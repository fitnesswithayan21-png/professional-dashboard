"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
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
import { mockBusinessKnowledge } from "@/lib/mock-data";

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
  sheetsStatus: 'idle' | 'loading' | 'success' | 'error' | 'not_connected';
  sheetsError: string | null;

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
  setSheetsStatus: (status: 'idle' | 'loading' | 'success' | 'error' | 'not_connected', error?: string | null) => void;

  // Database Actions
  loadSettingsFromDB: () => Promise<void>;
  saveSettingsToDB: (newSettings: Settings) => Promise<boolean>;
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
    clientId: "",
    clientSecret: "",
    spreadsheetUrl: "",
    connected: false,
    lastSync: "",
  },
  googleCalendar: {
    clientId: "",
    clientSecret: "",
    calendarId: "",
    connected: false,
  },
  telegram: {
    botToken: "",
    webhookUrl: "",
    connected: false,
  },
  business: {
    businessName: "NexusAI Solutions",
    timezone: "America/New_York",
    workingHours: "9:00 AM - 6:00 PM",
    meetingDuration: 30,
  },
};

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      // Initial Data — always empty; populated from Google Sheets via refreshData()
      leads: [],
      conversations: [],
      memories: [],
      appointments: [],
      followUps: [],
      businessKnowledge: mockBusinessKnowledge,
      settings: defaultSettings,

      // UI State
      isLoading: false,
      isRefreshing: false,
      sidebarOpen: true,
      theme: "dark",
      sheetsStatus: 'idle' as const,
      sheetsError: null,

      // Computed
      dashboardStats: calculateStats([], [], []),

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
      setSheetsStatus: (status, error = null) => set({ sheetsStatus: status, sheetsError: error }),

      refreshData: async () => {
        set({ isRefreshing: true, sheetsStatus: 'loading', sheetsError: null });
        try {
          // Always read the latest settings — avoid stale closure
          const { spreadsheetUrl, clientSecret, clientId } = useCRMStore.getState().settings.googleSheets;

          // If Google Sheets credentials are not present, show not_connected state
          if (!spreadsheetUrl || (!clientSecret && !clientId)) {
            console.info("Google Sheets not configured — using existing store data.");
            set({ isRefreshing: false, sheetsStatus: 'not_connected' });
            return;
          }

          // Get the current session token to authenticate the server request
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.warn("No active session — cannot refresh from Google Sheets.");
            set({ isRefreshing: false, sheetsStatus: 'error', sheetsError: 'No active session' });
            return;
          }

          // Call the server-side refresh route with the auth token
          const res = await fetch("/api/refresh", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (res.ok) {
            const data = await res.json();

            if (!data.success) {
              console.warn("Google Sheets refresh:", data.message || data.error);
              set({ isRefreshing: false, sheetsStatus: 'error', sheetsError: data.message || data.error });
              return;
            }

            // Populate the store with live data from Google Sheets
            if (data.leads)         set({ leads: data.leads });
            if (data.conversations) set({ conversations: data.conversations });
            if (data.memories)      set({ memories: data.memories });
            if (data.appointments)  set({ appointments: data.appointments });
            if (data.followUps)     set({ followUps: data.followUps });

            const updated = useCRMStore.getState();
            set({
              dashboardStats: calculateStats(
                updated.leads,
                updated.appointments,
                updated.followUps
              ),
              sheetsStatus: 'success',
              sheetsError: null,
              settings: {
                ...updated.settings,
                googleSheets: {
                  ...updated.settings.googleSheets,
                  lastSync: data.lastSync || new Date().toISOString(),
                },
              },
            });
          } else {
            set({ sheetsStatus: 'error', sheetsError: 'Server error. Please try again.' });
          }
        } catch (error) {
          console.error("Failed to refresh data:", error);
          set({ sheetsStatus: 'error', sheetsError: 'Network error. Check your connection.' });
        } finally {
          set({ isRefreshing: false });
        }
      },
      
      // Database Actions
      loadSettingsFromDB: async () => {
        try {
          // 1. Get authenticated session
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // 2. Fetch user's settings from Supabase
            const { data: dbSettings, error } = await supabase
              .from('workspace_settings')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (dbSettings && !error) {
              const parsedSettings: Settings = {
                apiKeys: {
                  grok: dbSettings.grok_key || '',
                  openai: dbSettings.openai_key || '',
                  gemini: dbSettings.gemini_key || '',
                  claude: dbSettings.claude_key || ''
                },
                googleSheets: {
                  clientId: dbSettings.sheets_client_id || '',
                  clientSecret: dbSettings.sheets_client_secret || '',
                  spreadsheetUrl: dbSettings.sheets_url || '',
                  connected: dbSettings.sheets_connected || false,
                  lastSync: ''
                },
                googleCalendar: {
                  clientId: dbSettings.calendar_client_id || '',
                  clientSecret: dbSettings.calendar_client_secret || '',
                  calendarId: dbSettings.calendar_id || '',
                  connected: dbSettings.calendar_connected || false
                },
                telegram: {
                  botToken: dbSettings.telegram_bot_token || '',
                  webhookUrl: dbSettings.telegram_webhook_url || '',
                  connected: dbSettings.telegram_connected || false
                },
                business: {
                  businessName: dbSettings.business_name || 'NexusAI Solutions',
                  timezone: dbSettings.timezone || 'America/New_York',
                  workingHours: dbSettings.working_hours || '9:00 AM - 6:00 PM',
                  meetingDuration: dbSettings.meeting_duration || 30
                }
              };

              set({ settings: parsedSettings });
            }
          }
        } catch (e) {
          console.error("Error loading settings from Supabase:", e);
        }
      },

      saveSettingsToDB: async (newSettings: Settings) => {
        try {
          // 1. Get authenticated session
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const payload = {
              user_id: session.user.id,
              grok_key: newSettings.apiKeys.grok,
              openai_key: newSettings.apiKeys.openai,
              gemini_key: newSettings.apiKeys.gemini,
              claude_key: newSettings.apiKeys.claude,
              
              sheets_client_id: newSettings.googleSheets.clientId,
              sheets_client_secret: newSettings.googleSheets.clientSecret,
              sheets_url: newSettings.googleSheets.spreadsheetUrl,
              sheets_connected: newSettings.googleSheets.connected,
              
              calendar_client_id: newSettings.googleCalendar.clientId,
              calendar_client_secret: newSettings.googleCalendar.clientSecret,
              calendar_id: newSettings.googleCalendar.calendarId,
              calendar_connected: newSettings.googleCalendar.connected,
              
              telegram_bot_token: newSettings.telegram.botToken,
              telegram_webhook_url: newSettings.telegram.webhookUrl,
              telegram_connected: newSettings.telegram.connected,
              
              business_name: newSettings.business.businessName,
              timezone: newSettings.business.timezone,
              working_hours: newSettings.business.workingHours,
              meeting_duration: newSettings.business.meetingDuration,
              
              updated_at: new Date().toISOString()
            };

            // Upsert based on user_id 
            // Note: In Supabase, if user_id is unique, upsert works. Otherwise, we match and update, or insert.
            const { error: matchError, data: existing } = await supabase
              .from('workspace_settings')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (existing) {
              await supabase.from('workspace_settings').update(payload).eq('id', existing.id);
            } else {
              await supabase.from('workspace_settings').insert([payload]);
            }

            set({ settings: newSettings });
            return true;
          }
        } catch (e) {
          console.error("Error saving settings to Supabase:", e);
        }
        return false;
      }
    }),
    {
      name: "crm-storage",
      // CRITICAL: Only persist UI preferences.
      // NEVER persist CRM data (leads, conversations, etc) — always load fresh from Google Sheets.
      // NEVER persist settings — always load from Supabase for security.
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
