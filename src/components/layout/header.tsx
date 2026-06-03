'use client';

import { useCRMStore } from '@/store/crm-store';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/dashboard/leads':        'Leads',
  '/dashboard/conversations':'Conversations',
  '/dashboard/appointments': 'Appointments',
  '/dashboard/ai-memory':    'AI Memory',
  '/dashboard/analytics':    'Analytics',
  '/dashboard/settings':     'Settings',
};

export function Header() {
  const { isRefreshing, refreshData } = useCRMStore();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Dashboard';

  return (
    <header className="h-[56px] flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0] shrink-0 z-30">
      {/* Left: page title */}
      <h1 className="text-[16px] font-semibold text-[#0F172A]">{title}</h1>

      {/* Center: search */}
      <div className="flex-1 max-w-[420px] mx-8">
        <div className="relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, companies, appointments..."
            className={cn(
              'w-full h-11 rounded-[10px] search-input-padding-override',
              'bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A]',
              'placeholder:text-slate-400 font-medium',
              'focus:outline-hidden focus:border-[#2563EB] focus:bg-white',
              'transition-colors duration-150'
            )}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors disabled:opacity-40"
          title="Sync data"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin text-[#2563EB]')} />
        </button>

        <button className="relative h-9 w-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
        </button>

        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        <button className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <div className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] font-bold text-white">
            AD
          </div>
          <span className="text-[13px] font-medium text-[#0F172A]">Admin</span>
        </button>
      </div>
    </header>
  );
}
