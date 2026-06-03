// Google Sheets Service Layer
// Handles all CRUD operations with Google Sheets as the database

import { google, sheets_v4 } from "googleapis";
import {
  Lead,
  Conversation,
  AIMemory,
  Appointment,
  FollowUp,
  BusinessKnowledge,
} from "@/types";

// Sheet names matching the required data structure
const SHEETS = {
  LEADS: "Leads",
  CONVERSATIONS: "Conversation History",
  AI_MEMORY: "AI Memory",
  APPOINTMENTS: "Appointments",
  FOLLOW_UPS: "Follow-Up Queue",
  BUSINESS: "Business Knowledge",
} as const;

class GoogleSheetsService {
  private sheets: sheets_v4.Sheets | null = null;
  private spreadsheetId: string = "";

  async initialize(spreadsheetId: string, credentials?: string) {
    this.spreadsheetId = spreadsheetId;

    try {
      let auth;
      if (credentials) {
        const creds = JSON.parse(credentials);
        auth = new google.auth.GoogleAuth({
          credentials: creds,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
      } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        auth = new google.auth.GoogleAuth({
          credentials: creds,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
      } else {
        throw new Error("No Google credentials provided");
      }

      this.sheets = google.sheets({ version: "v4", auth });
      return true;
    } catch (error) {
      console.error("Failed to initialize Google Sheets:", error);
      return false;
    }
  }

  private async getSheetData(range: string): Promise<string[][]> {
    if (!this.sheets) throw new Error("Sheets not initialized");

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return (response.data.values as string[][]) || [];
  }

  private async appendRow(sheet: string, values: string[][]): Promise<void> {
    if (!this.sheets) throw new Error("Sheets not initialized");

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: sheet,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  }

  private async updateRow(
    range: string,
    values: string[][]
  ): Promise<void> {
    if (!this.sheets) throw new Error("Sheets not initialized");

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  }

  // ===== LEADS =====
  async getLeads(): Promise<Lead[]> {
    const data = await this.getSheetData(`${SHEETS.LEADS}!A2:O`);
    return data.map((row) => ({
      id: row[0] || "",
      fullName: row[1] || "",
      email: row[2] || "",
      phone: row[3] || "",
      source: row[4] || "",
      businessType: row[5] || "",
      leadScore: parseInt(row[6]) || 0,
      intent: (row[7] as Lead["intent"]) || "low",
      urgency: (row[8] as Lead["urgency"]) || "low",
      status: (row[9] as Lead["status"]) || "new",
      bookedCall: row[10] === "TRUE",
      reminderSent: row[11] === "TRUE",
      createdDate: row[12] || new Date().toISOString(),
      lastContactTime: row[13] || new Date().toISOString(),
      notes: row[14] || "",
    }));
  }

  async addLead(lead: Lead): Promise<void> {
    await this.appendRow(SHEETS.LEADS, [
      [
        lead.id,
        lead.fullName,
        lead.email,
        lead.phone,
        lead.source,
        lead.businessType,
        lead.leadScore.toString(),
        lead.intent,
        lead.urgency,
        lead.status,
        lead.bookedCall.toString().toUpperCase(),
        lead.reminderSent.toString().toUpperCase(),
        lead.createdDate,
        lead.lastContactTime,
        lead.notes || "",
      ],
    ]);
  }

  // ===== CONVERSATIONS =====
  async getConversations(): Promise<Conversation[]> {
    const data = await this.getSheetData(
      `${SHEETS.CONVERSATIONS}!A2:H`
    );
    return data.map((row) => ({
      id: row[0] || "",
      leadId: row[1] || "",
      leadName: row[2] || "",
      userMessage: row[3] || "",
      aiResponse: row[4] || "",
      timestamp: row[5] || new Date().toISOString(),
      channel: (row[6] as Conversation["channel"]) || "web",
      messageType:
        (row[7] as Conversation["messageType"]) || "inbound",
    }));
  }

  // ===== AI MEMORY =====
  async getMemories(): Promise<AIMemory[]> {
    const data = await this.getSheetData(`${SHEETS.AI_MEMORY}!A2:F`);
    return data.map((row) => ({
      id: row[0] || "",
      leadId: row[1] || "",
      leadName: row[2] || "",
      memoryType: (row[3] as AIMemory["memoryType"]) || "context",
      memoryValue: row[4] || "",
      lastUpdated: row[5] || new Date().toISOString(),
    }));
  }

  // ===== APPOINTMENTS =====
  async getAppointments(): Promise<Appointment[]> {
    const data = await this.getSheetData(
      `${SHEETS.APPOINTMENTS}!A2:I`
    );
    return data.map((row) => ({
      id: row[0] || "",
      leadId: row[1] || "",
      leadName: row[2] || "",
      appointmentDate: row[3] || "",
      appointmentTime: row[4] || "",
      meetingLink: row[5] || "",
      status: (row[6] as Appointment["status"]) || "scheduled",
      reminderSent: row[7] === "TRUE",
      notes: row[8] || "",
    }));
  }

  // ===== FOLLOW-UPS =====
  async getFollowUps(): Promise<FollowUp[]> {
    const data = await this.getSheetData(`${SHEETS.FOLLOW_UPS}!A2:I`);
    return data.map((row) => ({
      id: row[0] || "",
      leadId: row[1] || "",
      leadName: row[2] || "",
      followUpNumber: parseInt(row[3]) || 1,
      followUpMessage: row[4] || "",
      scheduledTime: row[5] || new Date().toISOString(),
      status: (row[6] as FollowUp["status"]) || "pending",
      messageSent: row[7] === "TRUE",
      responseReceived: row[8] === "TRUE",
    }));
  }

  // ===== BUSINESS KNOWLEDGE =====
  async getBusinessKnowledge(): Promise<BusinessKnowledge | null> {
    const data = await this.getSheetData(`${SHEETS.BUSINESS}!A2:H`);
    if (data.length === 0) return null;

    const row = data[0];
    return {
      id: row[0] || "",
      businessName: row[1] || "",
      services: row[2] ? row[2].split(",").map((s: string) => s.trim()) : [],
      pricing: row[3] || "",
      faqs: row[4] ? JSON.parse(row[4]) : [],
      hours: row[5] || "",
      policies: row[6] || "",
      bookingLink: row[7] || "",
    };
  }

  // ===== FULL REFRESH =====
  async refreshAll() {
    const [leads, conversations, memories, appointments, followUps, business] =
      await Promise.all([
        this.getLeads(),
        this.getConversations(),
        this.getMemories(),
        this.getAppointments(),
        this.getFollowUps(),
        this.getBusinessKnowledge(),
      ]);

    return {
      leads,
      conversations,
      memories,
      appointments,
      followUps,
      business,
    };
  }

  // ===== TEST CONNECTION =====
  async testConnection(): Promise<boolean> {
    try {
      if (!this.sheets) return false;
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const sheetsService = new GoogleSheetsService();
