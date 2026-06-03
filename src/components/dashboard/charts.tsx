'use client';

import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

/* ─── Data ─────────────────────────────────── */
const monthlyData = [
  { month: 'Jan', forms: 4000, referrals: 2400 },
  { month: 'Feb', forms: 3000, referrals: 1800 },
  { month: 'Mar', forms: 5200, referrals: 3200 },
  { month: 'Apr', forms: 4800, referrals: 2900 },
  { month: 'May', forms: 6100, referrals: 3800 },
  { month: 'Jun', forms: 5500, referrals: 4200 },
  { month: 'Jul', forms: 7200, referrals: 4800 },
];

const yearlyData = [
  { month: '2020', forms: 28000, referrals: 14000 },
  { month: '2021', forms: 42000, referrals: 22000 },
  { month: '2022', forms: 58000, referrals: 31000 },
  { month: '2023', forms: 71000, referrals: 40000 },
  { month: '2024', forms: 89000, referrals: 52000 },
  { month: '2025', forms: 94000, referrals: 58000 },
];

const activityData = [
  { day: 'Mon', leads: 12, conversions: 4 },
  { day: 'Tue', leads: 19, conversions: 7 },
  { day: 'Wed', leads: 15, conversions: 5 },
  { day: 'Thu', leads: 24, conversions: 9 },
  { day: 'Fri', leads: 22, conversions: 8 },
  { day: 'Sat', leads: 14, conversions: 6 },
  { day: 'Sun', leads: 10, conversions: 3 },
];

const sourceData = [
  { name: 'Organic',  value: 35, color: '#2563EB' },
  { name: 'Paid Ads', value: 25, color: '#10B981' },
  { name: 'Referral', value: 20, color: '#F59E0B' },
  { name: 'Social',   value: 12, color: '#8B5CF6' },
  { name: 'Direct',   value: 8,  color: '#64748B' },
];

/* ─── Shared tooltip style ───────────────── */
const tooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    fontSize: '12px',
    color: '#0F172A',
    padding: '8px 12px',
  },
  cursor: { fill: '#F1F5F9' },
};

/* ─── Revenue / Bar Chart ────────────────── */
export function DashboardBarChart() {
  const [view, setView] = useState<'month' | 'year'>('month');
  const data = view === 'month' ? monthlyData : yearlyData;
  const total = data.reduce((s, d) => s + d.forms + d.referrals, 0);
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Total Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none">
              {fmt(total)}
            </span>
            <span className="text-[12px] font-semibold text-[#10B981]">+14.5%</span>
          </div>
        </div>
        {/* Segmented control */}
        <div className="flex items-center bg-[#F1F5F9] rounded-lg p-0.5">
          {(['month', 'year'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`h-[30px] px-4 rounded-md text-[12px] font-semibold transition-all ${
                view === v
                  ? 'bg-white text-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-5 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
          <span className="h-2 w-2 rounded-full bg-[#2563EB] inline-block" />Website Forms
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
          <span className="h-2 w-2 rounded-full bg-[#93C5FD] inline-block" />Referrals
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 pb-4 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              axisLine={false} tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              axisLine={false} tickLine={false}
              dx={-4} width={48}
            />
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [fmt(v), name === 'forms' ? 'Website Forms' : 'Referrals']} />
            <Bar dataKey="forms"    fill="#2563EB" radius={[4,4,0,0]} maxBarSize={32} />
            <Bar dataKey="referrals" fill="#93C5FD" radius={[4,4,0,0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Lead Source / Donut ────────────────── */
export function DashboardDonutChart() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Lead Sources</p>
        <p className="text-[20px] font-semibold text-[#0F172A]">Distribution</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4">
        <div className="relative w-full" style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={48} outerRadius={70}
                dataKey="value" paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                {sourceData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[22px] font-bold text-[#0F172A] leading-none">100%</span>
            <span className="text-[11px] text-[#94A3B8] mt-0.5">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2 mt-2">
          {sourceData.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[12px] text-[#64748B]">{d.name}</span>
              </div>
              <span className="text-[12px] font-semibold text-[#0F172A]">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Activity / Area Chart ──────────────── */
export function DashboardAreaChart() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Lead Activity</p>
          <p className="text-[20px] font-semibold text-[#0F172A]">Weekly Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] inline-block" />New Leads
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] inline-block" />Conversions
          </span>
        </div>
      </div>
      <div className="flex-1 px-4 pb-4 pt-3 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} dx={-4} width={32} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="leads"       stroke="#2563EB" strokeWidth={2} fill="url(#gLeads)" dot={false} name="New Leads" />
            <Area type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} fill="url(#gConv)"  dot={false} name="Conversions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
