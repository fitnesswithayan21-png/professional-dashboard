// ============================================
// CRM Dashboard Type Definitions
// ============================================

export interface Lead {
  id: string;
  conversationId: string;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  businessType: string;
  leadScore: number;
  intent: "high" | "medium" | "low";
  urgency: "urgent" | "high" | "medium" | "low";
  status: "new" | "qualified" | "contacted" | "converted" | "lost";
  bookedCall: boolean;
  reminderSent: boolean;
  createdDate: string;
  lastContactTime: string;
  notes?: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  sender: string;
  message: string;
  channel: string;
  messageType: string;
  timestamp: string;
}

export interface AIMemory {
  id: string;
  leadId: string;
  leadName: string;
  memoryType: "preference" | "behavior" | "context" | "intent" | "objection" | "timeline";
  memoryValue: string;
  lastUpdated: string;
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  appointmentDate: string;
  appointmentTime: string;
  meetingLink: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  reminderSent: boolean;
  notes?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  followUpNumber: number;
  followUpMessage: string;
  scheduledTime: string;
  status: "pending" | "sent" | "completed" | "failed";
  messageSent: boolean;
  responseReceived: boolean;
}

export interface BusinessKnowledge {
  id: string;
  businessName: string;
  services: string[];
  pricing: string;
  faqs: { question: string; answer: string }[];
  hours: string;
  policies: string;
  bookingLink: string;
}

export interface Settings {
  apiKeys: {
    grok: string;
    openai: string;
    gemini: string;
    claude: string;
  };
  googleSheets: {
    clientId: string;
    clientSecret: string;
    spreadsheetUrl: string;
    connected: boolean;
    lastSync: string;
  };
  googleCalendar: {
    clientId: string;
    clientSecret: string;
    calendarId: string;
    connected: boolean;
  };
  telegram: {
    botToken: string;
    webhookUrl: string;
    connected: boolean;
  };
  business: {
    businessName: string;
    timezone: string;
    workingHours: string;
    meetingDuration: number;
  };
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
  followUpsPending: number;
  remindersSent: number;
  conversionRate: number;
  leadScoreAverage: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
}

export interface AIInsight {
  type: "health" | "qualification" | "recommendation" | "risk" | "opportunity" | "followup";
  title: string;
  description: string;
  score?: number;
  priority: "high" | "medium" | "low";
  leadId?: string;
  leadName?: string;
}
