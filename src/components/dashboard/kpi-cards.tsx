'use client';

import { useCRMStore } from '@/store/crm-store';
import { TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';

const CARDS = [
  { key: 'pipeline',     label: 'Pipeline Value',    icon: TrendingUp, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
  { key: 'totalLeads',   label: 'Total Leads',        icon: Users,       color: 'text-[#0F172A]', bg: 'bg-[#F1F5F9]' },
  { key: 'qualified',    label: 'Qualified Leads',    icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  { key: 'appointments', label: 'Appointments',       icon: Calendar,    color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
];

export function KPICards() {
  const { leads, appointments, dashboardStats } = useCRMStore();

  const pipelineValue = leads.filter(l => l.status === 'qualified').length * 4500;

  const values: Record<string, string | number> = {
    pipeline:     `$${(pipelineValue / 1000).toFixed(1)}k`,
    totalLeads:   dashboardStats.totalLeads,
    qualified:    dashboardStats.qualifiedLeads,
    appointments: dashboardStats.appointmentsBooked,
  };

  const trends: Record<string, string> = {
    pipeline:     '+12%',
    totalLeads:   '+8%',
    qualified:    '+5%',
    appointments: '+3%',
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium text-[#64748B]">{label}</p>
            <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </div>
          <p className="text-[32px] font-bold text-[#0F172A] leading-none tracking-tight">
            {values[key]}
          </p>
          <p className="text-[12px] text-[#10B981] font-medium mt-2">
            {trends[key]} <span className="text-[#94A3B8] font-normal">vs last month</span>
          </p>
        </div>
      ))}
    </div>
  );
}
