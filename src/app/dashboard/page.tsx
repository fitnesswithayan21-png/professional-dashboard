'use client';

import { KPICards } from '@/components/dashboard/kpi-cards';
import { DashboardBarChart, DashboardAreaChart, DashboardDonutChart } from '@/components/dashboard/charts';
import { useCRMStore } from '@/store/crm-store';
import { timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Calendar, Clock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const AVATAR_COLORS = [
  ['bg-[#EFF6FF]', 'text-[#2563EB]'],
  ['bg-[#ECFDF5]', 'text-[#065F46]'],
  ['bg-[#FFFBEB]', 'text-[#92400E]'],
  ['bg-[#F5F3FF]', 'text-[#5B21B6]'],
  ['bg-[#FEF2F2]', 'text-[#991B1B]'],
  ['bg-[#F0FDF4]', 'text-[#14532D]'],
];

export default function DashboardPage() {
  const { leads, appointments } = useCRMStore();

  const upcoming = appointments
    .filter(a => ['scheduled','confirmed'].includes(a.status) && new Date(a.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 5);

  const needsAttention: { id: string; type: 'warning' | 'error'; text: string; action: string; href: string }[] = [];

  const qualifiedUnscheduled = leads.filter(l => l.status === 'qualified' && !appointments.some(a => a.leadId === l.id));
  if (qualifiedUnscheduled.length > 0) {
    needsAttention.push({ id: 'q1', type: 'warning', text: `${qualifiedUnscheduled[0].fullName} is qualified — no appointment booked`, action: 'Schedule', href: '/dashboard/appointments' });
  }
  const noShow = appointments.filter(a => a.status === 'no-show');
  if (noShow.length > 0) {
    needsAttention.push({ id: 'n1', type: 'error', text: `${noShow[0].leadName} missed their appointment`, action: 'Follow Up', href: '/dashboard/conversations' });
  }
  const uncontacted = leads.filter(l => l.status === 'new' && !l.lastContactTime);
  if (uncontacted.length > 0) {
    needsAttention.push({ id: 'u1', type: 'warning', text: `${uncontacted[0].fullName} hasn't been contacted yet`, action: 'Engage', href: '/dashboard/conversations' });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Page Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#0F172A]">{greeting}, Admin</h2>
        <p className="text-[13px] text-[#64748B] mt-0.5">{dateStr}</p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Row 2: Revenue (8) + Lead Sources (4) */}
      <div className="grid grid-cols-12 gap-4" style={{ height: 400 }}>
        <div className="col-span-8 h-full"><DashboardBarChart /></div>
        <div className="col-span-4 h-full"><DashboardDonutChart /></div>
      </div>

      {/* Row 3: Activity (8) + Needs Attention (4) */}
      <div className="grid grid-cols-12 gap-4" style={{ height: 320 }}>
        <div className="col-span-8 h-full"><DashboardAreaChart /></div>

        {/* Needs Attention */}
        <div className="col-span-4 h-full">
          <div className="h-full bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
              <p className="text-[14px] font-semibold text-[#0F172A]">Needs Attention</p>
              {needsAttention.length > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold flex items-center justify-center">
                  {needsAttention.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {needsAttention.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 px-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
                  <p className="text-[14px] font-medium text-[#0F172A]">All caught up</p>
                  <p className="text-[12px] text-[#94A3B8]">No pending actions.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {needsAttention.map(item => (
                    <div key={item.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`h-4 w-4 mt-0.5 shrink-0 ${item.type === 'error' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`} />
                        <p className="text-[13px] text-[#0F172A] leading-relaxed flex-1">{item.text}</p>
                      </div>
                      <div className="mt-3 ml-7">
                        <Link href={item.href}>
                          <button className="h-[32px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12px] font-semibold hover:bg-[#1D4ED8] transition-colors">
                            {item.action}
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Leads (8) + Upcoming (4) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Leads */}
        <div className="col-span-8">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <p className="text-[14px] font-semibold text-[#0F172A]">Recent Leads</p>
              <Link href="/dashboard/leads" className="flex items-center gap-1 text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  <th className="pl-5 pr-4 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {leads.slice(0, 6).map((lead, i) => {
                  const [bg, tc] = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const initials = lead.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="pl-5 pr-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full ${bg} ${tc} flex items-center justify-center text-[11px] font-semibold shrink-0`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#0F172A] truncate">{lead.fullName}</p>
                            <p className="text-[12px] text-[#94A3B8] truncate">{lead.businessType || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[13px] text-[#64748B] min-w-0">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
                          <span className="truncate max-w-[180px]">{lead.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge status={lead.status} /></td>
                      <td className="px-5 py-3 text-right text-[12px] text-[#94A3B8]">{timeAgo(lead.createdDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="col-span-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <p className="text-[14px] font-semibold text-[#0F172A]">Upcoming</p>
              <Link href="/dashboard/appointments" className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                View all
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center gap-2">
                <Calendar className="h-8 w-8 text-[#E2E8F0]" />
                <p className="text-[14px] font-medium text-[#0F172A]">No upcoming appointments</p>
                <p className="text-[12px] text-[#94A3B8]">Your calendar is clear.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F8FAFC]">
                {upcoming.map(appt => {
                  const d = new Date(appt.appointmentDate);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={appt.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[#F1F5F9] shrink-0">
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase leading-none">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-[16px] font-bold text-[#0F172A] leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#0F172A] truncate">{appt.leadName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3 text-[#94A3B8] shrink-0" />
                          <span className="text-[12px] text-[#64748B]">
                            {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          {isToday && <Badge status="Today" className="!bg-[#EFF6FF] !text-[#2563EB] !border-[#BFDBFE]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
