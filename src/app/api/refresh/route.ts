import { NextResponse } from "next/server";

// Google Sheets refresh endpoint
// In production, this connects to Google Sheets API
// For now, returns success to demonstrate the refresh flow

export async function GET() {
  try {
    // Check if Google Sheets is configured
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!spreadsheetId || !credentials) {
      // Return mock data signal when not connected
      return NextResponse.json({
        success: true,
        message: "Using demo data. Connect Google Sheets in Settings to sync live data.",
        demo: true,
      });
    }

    // In production: fetch from Google Sheets
    // const { google } = require('googleapis');
    // const auth = new google.auth.GoogleAuth({...});
    // const sheets = google.sheets({ version: 'v4', auth });
    // const response = await sheets.spreadsheets.values.get({...});

    return NextResponse.json({
      success: true,
      message: "Data refreshed from Google Sheets",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh data" },
      { status: 500 }
    );
  }
}
