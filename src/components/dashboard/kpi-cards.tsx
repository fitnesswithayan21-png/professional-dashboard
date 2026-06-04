'use client';

import { useCRMStore } from '@/store/crm-store';
import { TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';
import { DashboardGrid } from '@/components/ui/DashboardGrid';
import { MetricCard } from '@/components/ui/MetricCard';

const CARDS = [
  { key: 'pipeline',     label: 'Pipeline Value',    icon: TrendingUp, color: '#2563EB', trend: 'up' as const },
  { key: 'totalLeads',   label: 'Total Leads',        icon: Users,       color: '#0F172A', trend: 'up' as const },
  { key: 'qualified',    label: 'Qualified Leads',    icon: CheckCircle, color: '#10B981', trend: 'up' as const },
  { key: 'appointments', label: 'Appointments',       icon: Calendar,    color: '#F59E0B', trend: 'up' as const },
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
    <DashboardGrid columns={4}>
      {CARDS.map(({ key, label, icon: Icon, color, trend }) => (
        <MetricCard
          key={key}
          label={label}
          value={String(values[key])}
          sub={`${trends[key]} vs last month`}
          icon={Icon}
          iconColor={color}
          trend={{ value: trends[key] || '', type: trend }}
        />
      ))}
    </DashboardGrid>
  );
}
