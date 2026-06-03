'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCRMStore } from '@/store/crm-store';
import {
  LayoutDashboard, Users, Calendar, MessageSquare,
  Brain, BookOpen, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';

const NAV = [
  { group: 'CRM', items: [
    { label: 'Dashboard',    href: '/dashboard',                icon: LayoutDashboard },
    { label: 'Leads',        href: '/dashboard/leads',          icon: Users },
    { label: 'Conversations',href: '/dashboard/conversations',  icon: MessageSquare },
    { label: 'Appointments', href: '/dashboard/appointments',   icon: Calendar },
  ]},
  { group: 'AI Tools', items: [
    { label: 'AI Memory',    href: '/dashboard/ai-memory',      icon: Brain },
  ]},
  { group: 'Analytics', items: [
    { label: 'Analytics',    href: '/dashboard/analytics',      icon: BarChart3 },
  ]},
  { group: 'Settings', items: [
    { label: 'Settings',     href: '/dashboard/settings',       icon: Settings },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useCRMStore();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        'h-screen flex flex-col shrink-0 transition-all duration-200 ease-in-out z-40',
        'bg-[#0F172A] border-r border-[#1E293B]',
        sidebarOpen ? 'w-[240px]' : 'w-[56px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-[56px] flex items-center shrink-0 border-b border-[#1E293B]',
        sidebarOpen ? 'px-5 gap-3' : 'justify-center'
      )}>
        <div className="h-7 w-7 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/10">
          <span className="text-white font-bold text-[13px] tracking-tight">N</span>
        </div>
        {sidebarOpen && (
          <span className="text-white font-semibold text-[14px] tracking-tight whitespace-nowrap">NexusAI CRM</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-5 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            {sidebarOpen && (
              <p className="px-5 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {group}
              </p>
            )}
            <div className="space-y-0.5 px-3">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={!sidebarOpen ? label : undefined}
                    className={cn(
                      'flex items-center rounded-lg h-[36px] text-[13px] font-medium transition-all duration-150 cursor-pointer',
                      sidebarOpen ? 'px-3 gap-3' : 'justify-center px-0',
                      active
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    )}
                  >
                    <Icon className={cn('shrink-0 h-4 w-4 transition-colors', active ? 'text-[#2563EB]' : 'text-slate-450')} />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse + User profile */}
      <div className="shrink-0 border-t border-[#1E293B] bg-slate-950/20">
        <div className="px-3 py-1.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'flex items-center h-8 w-full rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors duration-150 cursor-pointer',
              sidebarOpen ? 'px-3 gap-3' : 'justify-center'
            )}
          >
            {sidebarOpen
              ? <><ChevronLeft className="h-4 w-4 shrink-0" /><span className="text-[12px] font-medium">Collapse menu</span></>
              : <ChevronRight className="h-4 w-4 shrink-0" />
            }
          </button>
        </div>

        <div className={cn(
          'flex items-center gap-3 px-4 py-3 border-t border-[#1E293B]',
          !sidebarOpen && 'justify-center px-0 py-3'
        )}>
          <div className="h-7 w-7 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs">
            AD
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-none">Admin Owner</p>
              <p className="text-[10px] text-slate-500 truncate mt-1">owner@nexusai.com</p>
            </div>
          )}
          {sidebarOpen && (
            <Link href="/" className="shrink-0">
              <button className="p-1.5 rounded-md text-slate-505 hover:text-rose-500 hover:bg-slate-800 transition-colors cursor-pointer">
                <LogOut className="h-4 w-4" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
