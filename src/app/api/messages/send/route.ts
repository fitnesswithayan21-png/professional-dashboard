import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sheetsService } from "@/lib/google-sheets";

function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) return url.trim();
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch workspace settings
    const { data: dbSettings, error: settingsError } = await supabase
      .from("workspace_settings")
      .select("telegram_bot_token, sheets_url, sheets_client_id, sheets_client_secret")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !dbSettings) {
      return NextResponse.json({ success: false, error: "Settings not found" }, { status: 400 });
    }

    const { telegram_bot_token, sheets_url, sheets_client_id, sheets_client_secret } = dbSettings;

    if (!telegram_bot_token) {
      return NextResponse.json({ success: false, error: "Telegram Bot Token not configured" }, { status: 400 });
    }

    // 3. Initialize Google Sheets
    if (!sheets_url) {
      return NextResponse.json({ success: false, error: "Google Sheets not connected" }, { status: 400 });
    }

    const spreadsheetId = extractSpreadsheetId(sheets_url);
    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: "Invalid Google Sheets URL" }, { status: 400 });
    }

    let credentialsJson: string | undefined;
    if (sheets_client_secret) {
      const rawSecret = sheets_client_secret.trim();
      if (rawSecret.startsWith("{")) {
        credentialsJson = rawSecret;
      } else if (sheets_client_id) {
        const serviceAccount = {
          client_email: sheets_client_id.trim(),
          private_key: rawSecret.replace(/\\n/g, "\n"),
        };
        credentialsJson = JSON.stringify(serviceAccount);
      }
    }

    if (!credentialsJson) {
      return NextResponse.json({ success: false, error: "Google Sheets credentials invalid" }, { status: 400 });
    }

    await sheetsService.initialize(spreadsheetId, credentialsJson);

    // 4. Parse request body
    const body = await req.json();
    const { leadId, message } = body;

    console.log(`[DEBUG] Received manual message request for lead_id: ${leadId}`);
    console.log(`[DEBUG] Outgoing message: "${message}"`);

    if (!leadId || !message) {
      return NextResponse.json({ success: false, error: "Missing leadId or message" }, { status: 400 });
    }

    // 5. Lookup Lead
    const leads = await sheetsService.getLeads();
    const lead = leads.find((l) => l.id === leadId);

    if (!lead) {
      console.log(`[DEBUG] Lead ${leadId} not found in Google Sheets.`);
      return NextResponse.json({ success: false, error: "Lead not found in Google Sheets" }, { status: 404 });
    }

    console.log(`[DEBUG] Selected lead_id: ${lead.id}`);
    console.log(`[DEBUG] conversation_id: ${lead.conversationId}`);
    console.log(`[DEBUG] source: ${lead.source}`);
    console.log(`[DEBUG] telegram token loaded: ${telegram_bot_token ? "YES (hidden)" : "NO"}`);

    if (lead.source?.toLowerCase() !== "telegram") {
      return NextResponse.json({ success: false, error: `Cannot send Telegram message to source: ${lead.source}` }, { status: 400 });
    }

    const chatId = lead.conversationId;
    if (!chatId) {
      return NextResponse.json({ success: false, error: "Lead has no conversation_id mapped" }, { status: 400 });
    }

    // 6. Send via Telegram API
    console.log(`[DEBUG] Sending Telegram API request to chat_id: ${chatId}`);
    const tgRes = await fetch(`https://api.telegram.org/bot${telegram_bot_token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!tgRes.ok) {
      const errorText = await tgRes.text();
      console.error("[DEBUG] Telegram API Error response:", errorText);
      return NextResponse.json({ success: false, error: "Message delivery failed.", details: errorText }, { status: tgRes.status });
    }

    console.log(`[DEBUG] Telegram response OK. Message delivered to chat_id: ${chatId}`);

    // 7. Store message in Google Sheets
    const messageId = `msg_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMsg = {
      id: messageId,
      leadId: lead.id,
      sender: "owner",
      message: message,
      channel: "telegram",
      messageType: "text",
      timestamp: timestamp,
    };

    try {
      await sheetsService.addConversationMessage(newMsg);
    } catch (sheetErr: any) {
      console.error("Google Sheets append error:", sheetErr);
      // We don't fail the request because Telegram delivery succeeded.
      // But we can notify the frontend that DB sync failed.
      return NextResponse.json({ 
        success: true, 
        messageData: newMsg,
        warning: "Message delivered but failed to sync to Google Sheets"
      });
    }

    return NextResponse.json({ success: true, messageData: newMsg });

  } catch (err: any) {
    console.error("Telegram Send error:", err);
    return NextResponse.json({ success: false, error: "Message delivery failed.", details: err.message }, { status: 500 });
  }
}
