import { NextRequest, NextResponse } from "next/server";
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
    const body = await req.json();
    const { botToken, chatId, text, googleSheetsConfig, messageData } = body;

    if (!botToken || !chatId || !text) {
      return NextResponse.json({ error: "Missing telegram parameters" }, { status: 400 });
    }

    // 1. Send via Telegram API
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!tgRes.ok) {
      const errorText = await tgRes.text();
      return NextResponse.json({ error: "Telegram API failed", details: errorText }, { status: tgRes.status });
    }

    // 2. Initialize Google Sheets
    if (googleSheetsConfig && googleSheetsConfig.spreadsheetUrl) {
      const spreadsheetId = extractSpreadsheetId(googleSheetsConfig.spreadsheetUrl);
      
      if (spreadsheetId) {
        let credentialsJson: string | undefined;
        if (googleSheetsConfig.clientSecret) {
          const rawSecret = googleSheetsConfig.clientSecret.trim();
          if (rawSecret.startsWith("{")) {
            credentialsJson = rawSecret;
          } else if (googleSheetsConfig.clientId) {
            const serviceAccount = {
              client_email: googleSheetsConfig.clientId.trim(),
              private_key: rawSecret.replace(/\\n/g, "\n"),
            };
            credentialsJson = JSON.stringify(serviceAccount);
          }
        }

        if (credentialsJson) {
          try {
            await sheetsService.init(spreadsheetId, credentialsJson);
            // 3. Append to Conversation History
            await sheetsService.addConversationMessage(messageData);
          } catch (sheetErr) {
            console.error("Google Sheets append error:", sheetErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Telegram Send error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
