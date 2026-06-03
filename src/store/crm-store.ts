"use client";

import { create } from "zustand";
import {
  Lead,
  Conversation,
  AIMemory,
  Appointment,
  FollowUp,
  BusinessKnowledge,
  Settings,
  DashboardStats,
} from "@/types";
import {
  mockLeads,
  mockConversations,
  mockMemories,
  mockAppointments,
  mockFollowUps,
  mockBusinessKnowledge,
} from "@/lib/mock-data";

interface CRMState {
  // Data
  leads: Lead[];
  conversations: Conversation[];
  memories: AIMemory[];
  appointments: Appointment[];
  followUps: FollowUp[];
  businessKnowledge: BusinessKnowledge;
  settings: Settings;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  sidebarOpen: boolean;
  theme: "dark" | "light";

  // Computed
  dashboardStats: DashboardStats;

  // Actions
  setLeads: (leads: Lead[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMemories: (memories: AIMemory[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setFollowUps: (followUps: FollowUp[]) => void;
  setBusinessKnowledge: (knowledge: BusinessKnowledge) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  refreshData: () => Promise<void>;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, value: string) => void;
}

function calculateStats(
  leads: Lead[],
  appointments: Appointment[],
  followUps: FollowUp[]
): DashboardStats {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;
  const appointmentsBooked = appointments.length;
  const appointmentsCompleted = appointments.filter((a) => a.status === "completed").length;
  const followUpsPending = followUps.filter((f) => f.status === "pending").length;
  const remindersSent = leads.filter((l) => l.reminderSent).length;
  const conversionRate = totalLeads > 0 ? Math.round((leads.filter((l) => l.status === "converted").length / totalLeads) * 100) : 0;
  const leadScoreAverage = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads) : 0;

  return {
    totalLeads,
    qualifiedLeads,
    appointmentsBooked,
    appointmentsCompleted,
    followUpsPending,
    remindersSent,
    conversionRate,
    leadScoreAverage,
  };
}

const defaultSettings: Settings = {
  apiKeys: {
    grok: "",
    openai: "",
    gemini: "",
    claude: "",
  },
  googleSheets: {
    spreadsheetId: "",
    connected: false,
    lastSync: "",
  },
  business: {
    businessName: "NexusAI Solutions",
    timezone: "America/New_York",
    workingHours: "9:00 AM - 6:00 PM",
    meetingDuration: 30,
  },
};

export const useCRMStore = create<CRMState>((set, get) => ({
  // Initial Data
  leads: mockLeads,
  conversations: mockConversations,
  memories: mockMemories,
  appointments: mockAppointments,
  followUps: mockFollowUps,
  businessKnowledge: mockBusinessKnowledge,
  settings: defaultSettings,

  // UI State
  isLoading: false,
  isRefreshing: false,
  sidebarOpen: true,
  theme: "dark",

  // Computed
  dashboardStats: calculateStats(mockLeads, mockAppointments, mockFollowUps),

  // Actions
  setLeads: (leads) =>
    set((state) => ({
      leads,
      dashboardStats: calculateStats(leads, state.appointments, state.followUps),
    })),
  setConversations: (conversations) => set({ conversations }),
  setMemories: (memories) => set({ memories }),
  setAppointments: (appointments) =>
    set((state) => ({
      appointments,
      dashboardStats: calculateStats(state.leads, appointments, state.followUps),
    })),
  setFollowUps: (followUps) =>
    set((state) => ({
      followUps,
      dashboardStats: calculateStats(state.leads, state.appointments, followUps),
    })),
  setBusinessKnowledge: (businessKnowledge) => set({ businessKnowledge }),
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),
  deleteMemory: (id) =>
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    })),
  updateMemory: (id, value) =>
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, memoryValue: value, lastUpdated: new Date().toISOString() } : m
      ),
    })),
  refreshData: async () => {
    set({ isRefreshing: true });
    try {
      const res = await fetch("/api/refresh");
      if (res.ok) {
        const data = await res.json();
        if (data.leads) set({ leads: data.leads });
        if (data.conversations) set({ conversations: data.conversations });
        if (data.memories) set({ memories: data.memories });
        if (data.appointments) set({ appointments: data.appointments });
        if (data.followUps) set({ followUps: data.followUps });
        const state = get();
        set({
          dashboardStats: calculateStats(state.leads, state.appointments, state.followUps),
        });
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      set({ isRefreshing: false });
    }
  },
}));
