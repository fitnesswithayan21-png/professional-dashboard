"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConversations = pathname === '/dashboard/conversations';

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
