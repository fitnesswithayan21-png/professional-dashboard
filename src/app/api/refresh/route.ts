/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sheetsService } from "@/lib/google-sheets";

// Helper: Extract spreadsheet ID from a Google Sheets URL
function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  // Handle both full URLs and bare IDs
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  // If it looks like a bare ID already (no slashes), return as-is
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) return url.trim();
  return null;
}

export async function GET(req: NextRequest) {
  try {
    // ── 1. Authenticate the request using the Authorization header ──────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const accessToken = authHeader.replace("Bearer ", "");

    // ── 2. Create a server-side Supabase client with the user's token ────────
    // This ensures we only ever access the credentials of the authenticated user.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    // ── 3. Verify user identity ──────────────────────────────────────────────
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── 4. Fetch THIS user's credentials from Supabase (server-side only) ───
    // The client secret NEVER leaves this server function.
    const { data: dbSettings, error: settingsError } = await supabase
      .from("workspace_settings")
      .select("sheets_url, sheets_client_id, sheets_client_secret, sheets_connected")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !dbSettings) {
      return NextResponse.json({
        success: false,
        error: "Google Sheets not connected",
        message: "Please enter your Google Sheets credentials in Settings.",
      }, { status: 200 }); // 200 so the client handles it gracefully
    }

    if (!dbSettings.sheets_url || (!dbSettings.sheets_client_id && !dbSettings.sheets_client_secret)) {
      return NextResponse.json({
        success: false,
        error: "Google Sheets not connected",
        message: "Google Sheets not connected. Go to Settings → Credentials to connect.",
      }, { status: 200 });
    }

    // ── 5. Extract spreadsheet ID from the saved URL ─────────────────────────
    const spreadsheetId = extractSpreadsheetId(dbSettings.sheets_url);
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: "Invalid spreadsheet URL",
        message: "Unable to parse the spreadsheet URL. Please check Settings → Credentials.",
      }, { status: 200 });
    }

    // ── 6. Build credentials for Google Sheets API ───────────────────────────
    // Supports two modes:
    //   a) clientSecret is a raw JSON string (service account key JSON)
    //   b) clientId + clientSecret as OAuth2 fields (treated as service account JSON fields)
    let credentialsJson: string | undefined;

    if (dbSettings.sheets_client_secret) {
      const rawSecret = dbSettings.sheets_client_secret.trim();
      // Check if the user pasted a full service account JSON
      if (rawSecret.startsWith("{")) {
        credentialsJson = rawSecret;
      } else if (dbSettings.sheets_client_id) {
        // Treat clientId as service_account email, clientSecret as private_key
        const serviceAccount = {
          type: "service_account",
          project_id: "",
          private_key_id: "",
          private_key: rawSecret.replace(/\\n/g, "\n"),
          client_email: dbSettings.sheets_client_id,
          client_id: "",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
        };
        credentialsJson = JSON.stringify(serviceAccount);
      }
    }

    // ── 7. Initialize the Google Sheets service ──────────────────────────────
    const initialized = await sheetsService.initialize(spreadsheetId, credentialsJson);
    if (!initialized) {
      return NextResponse.json({
        success: false,
        error: "Unable to access spreadsheet",
        message: "Authentication failed. Please verify your Google credentials in Settings.",
      }, { status: 200 });
    }

    // ── 8. Test connection first ──────────────────────────────────────────────
    const connected = await sheetsService.testConnection();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: "Unable to access spreadsheet",
        message: "Could not connect to the spreadsheet. Ensure the service account has edit access.",
      }, { status: 200 });
    }

    // ── 9. Fetch all data from Google Sheets ─────────────────────────────────
    const data = await sheetsService.refreshAll();

    return NextResponse.json({
      success: true,
      message: "Data refreshed from Google Sheets",
      lastSync: new Date().toISOString(),
      ...data,
    });

  } catch (error: any) {
    console.error("Refresh route error:", error?.message || error);

    // Surface sheet-not-found specifically
    if (error?.message?.includes("Unable to parse range") || error?.code === 400) {
      return NextResponse.json({
        success: false,
        error: "Sheet not found",
        message: "One or more required sheets were not found in your spreadsheet.",
      }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to refresh data" },
      { status: 500 }
    );
  }
}
