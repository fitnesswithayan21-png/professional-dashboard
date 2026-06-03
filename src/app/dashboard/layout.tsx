"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCRMStore } from "@/store/crm-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const isConversations = pathname === '/dashboard/conversations';
  const { loadSettingsFromDB, refreshData, settings } = useCRMStore();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        if (mounted) {
          setAuthenticated(true);
          setLoading(false);
        }
      } else {
        // Prevent premature redirect if Supabase is currently processing an OAuth callback in the URL
        const isAuthCallback = window.location.search.includes('code=') || 
                               window.location.hash.includes('access_token=') ||
                               window.location.search.includes('error=') || 
                               window.location.hash.includes('error=');
        
        if (isAuthCallback) {
          return; // Let onAuthStateChange handle it after parsing
        }
        
        if (mounted) {
          router.replace("/auth/login");
        }
      }
    };

    checkAuth();

    // Listen for auth changes (like signing in via OAuth, or signing out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (mounted) {
          setAuthenticated(true);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) router.replace("/auth/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Once authenticated, load settings from Supabase then auto-refresh if connected
  useEffect(() => {
    if (!authenticated) return;
    const initData = async () => {
      await loadSettingsFromDB();
      // After loading, check if Google Sheets is configured and trigger a sync
      const latest = useCRMStore.getState().settings;
      if (latest.googleSheets.connected && latest.googleSheets.spreadsheetUrl) {
        await refreshData();
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return null; // Prevents flashing the dashboard before redirect takes effect
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]",
          isConversations ? "p-0 flex flex-col" : "p-6"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
