import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

// Helper: Extract spreadsheet ID from a Google Sheets URL
function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) return url.trim();
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Authenticate ────────────────────────────────────────────────────
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

    // ── 2. Get credentials from request body ───────────────────────────────
    const body = await req.json();
    const { spreadsheetUrl, clientId, clientSecret } = body;

    if (!spreadsheetUrl) {
      return NextResponse.json({
        success: false,
        error: "Missing spreadsheet URL",
        message: "Please enter the Google Spreadsheet URL."
      });
    }

    if (!clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing credentials",
        message: "Please enter your Google Client Secret (or paste the full Service Account JSON)."
      });
    }

    // ── 3. Extract spreadsheet ID ──────────────────────────────────────────
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: "Invalid spreadsheet URL",
        message: "Could not parse the spreadsheet ID from the URL. Please check the format."
      });
    }

    // ── 4. Build auth credentials ──────────────────────────────────────────
    // Supports two formats:
    //   a) Full service account JSON pasted into the Client Secret field
    //   b) Service account email in Client ID + private key in Client Secret
    let authClient;

    try {
      const rawSecret = clientSecret.trim();

      if (rawSecret.startsWith("{")) {
        // Full service account JSON pasted
        const serviceAccountKey = JSON.parse(rawSecret);
        authClient = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
      } else if (clientId && clientId.includes("@")) {
        // Client ID = service account email, Client Secret = private key
        const serviceAccount = {
          type: "service_account",
          client_email: clientId.trim(),
          private_key: rawSecret.replace(/\\n/g, "\n"),
        };
        authClient = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
      } else {
        // Credentials don't match service account format
        return NextResponse.json({
          success: false,
          error: "Unsupported credential format",
          message: "Please paste your full Service Account JSON into the Client Secret field, OR enter the service account email in Client ID and private key in Client Secret. Standard OAuth2 client credentials require user consent and cannot be used server-side."
        });
      }
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON credentials",
        message: "The credentials could not be parsed. If pasting a Service Account JSON, ensure it is valid JSON."
      });
    }

    // ── 5. Actually test the connection ────────────────────────────────────
    const sheets = google.sheets({ version: "v4", auth: authClient });

    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "spreadsheetId,properties.title,sheets.properties.title",
      });

      const sheetTitles = response.data.sheets?.map(s => s.properties?.title) || [];

      // Check for required sheets
      const required = ["Leads"];
      const missing = required.filter(name => !sheetTitles.includes(name));

      if (missing.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Missing required sheets",
          message: `Connected to spreadsheet "${response.data.properties?.title}" but missing required sheet(s): ${missing.join(", ")}. Please ensure your sheet is named exactly "Leads".`,
          sheetsFound: sheetTitles,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully connected to "${response.data.properties?.title}". Found ${sheetTitles.length} sheet(s): ${sheetTitles.join(", ")}.`,
        spreadsheetTitle: response.data.properties?.title,
        sheetsFound: sheetTitles,
      });
    } catch (sheetsError: any) {
      const status = sheetsError?.status || sheetsError?.code;
      const errMsg = sheetsError?.message || "";

      if (status === 403 || errMsg.includes("PERMISSION_DENIED")) {
        return NextResponse.json({
          success: false,
          error: "Permission denied",
          message: "The service account does not have access to this spreadsheet. Share the spreadsheet with the service account email and grant Editor access."
        });
      }
      if (status === 404 || errMsg.includes("NOT_FOUND")) {
        return NextResponse.json({
          success: false,
          error: "Spreadsheet not found",
          message: "The spreadsheet was not found. Please check the URL is correct."
        });
      }
      if (status === 401 || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("invalid_grant")) {
        return NextResponse.json({
          success: false,
          error: "Authentication failed",
          message: "The credentials are invalid or expired. Please check your Service Account key."
        });
      }

      return NextResponse.json({
        success: false,
        error: "Connection failed",
        message: errMsg || "Unable to connect to Google Sheets. Please verify your credentials."
      });
    }

  } catch (error: any) {
    console.error("Test sheets error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      message: "An unexpected error occurred. Please try again."
    }, { status: 500 });
  }
}
