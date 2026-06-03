'use client';

import { useMemo } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
} from 'recharts';
import { 
  Users, 
  Target, 
  Zap, 
  Clock, 
} from 'lucide-react';

const COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string; fill: string}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg select-none min-w-[140px]">
        <p className="text-[13px] font-semibold text-slate-900 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-[13px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                <span>{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { leads, appointments } = useCRMStore();

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    leads.forEach(l => { 
      const source = l.source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1; 
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const scoreDistribution = useMemo(() => {
    return [
      { name: '0-25', count: leads.filter(l => l.leadScore <= 25).length },
      { name: '26-50', count: leads.filter(l => l.leadScore > 25 && l.leadScore <= 50).length },
      { name: '51-75', count: leads.filter(l => l.leadScore > 50 && l.leadScore <= 75).length },
      { name: '76-100', count: leads.filter(l => l.leadScore > 75).length },
    ];
  }, [leads]);

  const appointmentConversion = useMemo(() => {
    return [
      { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length },
      { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length },
      { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
      { name: 'No-Show', value: appointments.filter(a => a.status === 'no-show').length },
      { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
    ].filter(item => item.value > 0);
  }, [appointments]);

  const reminderData = useMemo(() => {
    if (appointments.length === 0) return { sent: 0, notSent: 0, percentage: 0 };
    const sent = appointments.filter(a => a.reminderSent).length;
    return {
      sent,
      notSent: appointments.length - sent,
      percentage: Math.round((sent / appointments.length) * 100)
    };
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-header description */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <p className="text-[13px] text-slate-500">Data-driven insights into your pipeline and appointments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Source donut */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <Users className="h-4 w-4 text-[#2563EB]" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full px-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={sourceData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={65} 
                    outerRadius={95} 
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score distribution bar */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <Target className="h-4 w-4 text-[#2563EB]" />
              Lead Score Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pr-4 pl-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Leads" maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointment conversion grid */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <Zap className="h-4 w-4 text-[#2563EB]" />
              Appointment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pr-4 pl-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentConversion} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Appointments" maxBarSize={32}>
                    {appointmentConversion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Telemetry */}
        <Card className="flex flex-col bg-white border border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-[#2563EB]" />
              Reminder Dispatch Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="10" 
                  strokeDasharray={`${(reminderData.percentage / 100) * 440} 440`} 
                  strokeLinecap="round" 
                  transform="rotate(-90 80 80)" 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[32px] font-bold text-slate-900 leading-none">{reminderData.percentage}%</span>
                <span className="text-[12px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">Delivered</span>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 mt-6 text-center">
              {reminderData.sent} of {appointments.length} appointment reminders sent.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
