'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useCRMStore } from '@/store/crm-store';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Users,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Activity,
  DollarSign,
  ArrowRight,
  Loader2,
  Brain,
  RefreshCw,
  PhoneCall,
  UserCheck,
  BarChart2,
  Flame,
  XCircle,
  ChevronRight,
  Info,
  Thermometer,
  Snowflake,
  Ban
} from 'lucide-react';

// ─── Strict SaaS Palette ──────────────────────────────────────────────────
const PALETTE = {
  primary: '#2563EB', // Blue
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger:  '#EF4444', // Red
  ai:      '#8B5CF6', // Purple
  slate:   '#64748B', // Neutral Secondary
  slateDark: '#0F172A', // Neutral Text
};

const PIE_COLORS = [PALETTE.primary, PALETTE.success, PALETTE.ai, PALETTE.warning];

// ─── Pipeline stages ──────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'new',           label: 'New',           color: PALETTE.primary },
  { key: 'contacted',     label: 'Contacted',     color: PALETTE.primary },
  { key: 'qualified',     label: 'Qualified',     color: PALETTE.ai      },
  { key: 'booked',        label: 'Booked',        color: PALETTE.success },
  { key: 'proposal sent', label: 'Proposal Sent', color: PALETTE.warning },
  { key: 'won',           label: 'Won',           color: PALETTE.success },
  { key: 'lost',          label: 'Lost',          color: PALETTE.danger  },
];

// ─── Shared Tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] min-w-[180px]">
      {label && <p className="text-[14px] font-bold text-[#0F172A] mb-4">{label}</p>}
      <div className="space-y-3">
        {payload.map((e, i) => (
          <div key={i} className="flex items-center justify-between gap-6 text-[14px]">
            <span className="flex items-center gap-2.5 text-[#475569] font-medium">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                style={{ background: e.color ?? e.fill }}
              />
              {e.name}
            </span>
            <span className="font-bold text-[#0F172A]">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-5 mb-6">
      <div className="h-12 w-12 rounded-2xl bg-white border border-[rgba(15,23,42,0.08)] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <Icon className="h-6 w-6 text-slate-700" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-[20px] font-bold text-[#0F172A] leading-tight tracking-tight">{title}</h2>
        {subtitle && <p className="text-[14px] font-medium text-[#64748B] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = PALETTE.primary,
  trend,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  trend?: { value: string; type: 'up' | 'down' | 'neutral' };
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        highlight 
          ? 'border border-[#2563EB]/20 shadow-[0_4px_16px_rgba(37,99,235,0.08),_0_12px_32px_rgba(37,99,235,0.04)] ring-1 ring-[#2563EB]/5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.1),_0_24px_48px_rgba(37,99,235,0.06)]' 
          : 'border border-[rgba(15,23,42,0.06)] shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.06),_0_24px_48px_rgba(15,23,42,0.04)]'
      }`}
    >
      <div className="flex flex-col items-start gap-4 h-full">
        {/* Top Area */}
        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
          <Icon size={22} style={{ color }} strokeWidth={2} />
        </div>
        
        {/* Middle Area */}
        <div className="mt-2 mb-2">
          <p className="text-[40px] font-bold text-[#0F172A] leading-none tracking-tight">{value}</p>
        </div>
        
        {/* Bottom Area */}
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-bold text-[#1E293B]">{label}</p>
          {sub && <p className="text-[13px] font-medium text-[#64748B]">{sub}</p>}
        </div>

        {/* Trend Info */}
        {trend && (
          <div className="mt-auto pt-6 w-full">
            <div className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg ${
              trend.type === 'up' ? 'text-[#10B981] bg-[#10B981]/10' :
              trend.type === 'down' ? 'text-[#EF4444] bg-[#EF4444]/10' :
              'text-[#64748B] bg-[#F1F5F9]'
            }`}>
              {trend.type === 'up' && <TrendingUp size={14} strokeWidth={2.5} />}
              {trend.type === 'down' && <TrendingDown size={14} strokeWidth={2.5} />}
              {trend.type === 'neutral' && <Minus size={14} strokeWidth={2.5} />}
              {trend.value}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini Profile Card (For Conv Analytics) ──────────────────────────────────
function MiniProfileCard({ name, subtitle, count }: { name: string; subtitle: string; count: number }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[rgba(15,23,42,0.06)] shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
      <div>
        <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mb-6 block">Most Active Lead</span>
        <div className="flex flex-col items-center text-center gap-4 mt-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-[20px] font-bold shadow-inner ring-4 ring-[#8B5CF6]/10 shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#0F172A] leading-tight max-w-[160px] truncate mx-auto">{name}</p>
            <p className="text-[13px] font-medium text-[#64748B] mt-1.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
        <span className="text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">{count}</span>
        <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-wide">Total Messages</span>
      </div>
    </div>
  );
}

// ─── Donut with Legend ───────────────────────────────────────────────────────
function DonutChart({
  data,
  title,
  emptyText = 'No data available',
}: {
  data: { name: string; value: number }[];
  title: string;
  emptyText?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const nonEmpty = data.filter(d => d.value > 0);

  return (
    <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-8 flex flex-col h-full">
      <p className="text-[16px] font-bold text-[#0F172A] mb-8">{title}</p>
      
      {total === 0 || nonEmpty.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[200px]">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <BarChart2 size={24} className="text-slate-400 stroke-[2]" />
          </div>
          <p className="text-[14px] font-medium text-[#64748B]">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-center justify-center gap-12 flex-1 p-4">
          <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonEmpty}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {nonEmpty.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[32px] font-bold text-[#0F172A] leading-none">{total}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 min-w-0 w-full xl:w-auto">
            {nonEmpty.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-[14px] font-medium text-[#475569] truncate">{d.name}</span>
                </div>
                <div className="flex items-center shrink-0">
                  <span className="text-[15px] font-bold text-[#0F172A]">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ring Progress ────────────────────────────────────────────────────────────
function RingProgress({
  value,
  label,
  color = PALETTE.primary,
  size = 120,
}: {
  value: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(value, 100) / 100);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative drop-shadow-sm" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={10} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#grad-${label.replace(/\s+/g, '')})`}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold text-[#0F172A]">
            {isNaN(value) ? '—' : `${Math.round(value)}%`}
          </span>
        </div>
      </div>
      <span className="text-[14px] font-bold text-[#475569] text-center">{label}</span>
    </div>
  );
}

// ─── Premium Empty State ─────────────────────────────────────────────────────
function PremiumEmptyState({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed h-full min-h-[240px]">
      <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Icon size={28} className="text-slate-400 stroke-[2]" />
      </div>
      <p className="text-[16px] font-bold text-[#0F172A] mb-2">{title}</p>
      <p className="text-[14px] font-medium text-[#64748B] max-w-[280px] leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Budget parser ────────────────────────────────────────────────────────────
function parseBudget(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[,$\s]/g, '').toLowerCase();
  const kMatch = cleaned.match(/^(\d+\.?\d*)k$/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ─── Today helper ─────────────────────────────────────────────────────────────
function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { leads, conversations, memories, appointments, followUps, settings } = useCRMStore();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    keyInsights: string[];
    opportunities: string[];
    recommendedActions: string[];
    attentionRequired: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // ── TODAY snapshot ─────────────────────────────────────────────────────────
  const todaySnapshot = useMemo(() => {
    const newLeadsToday = leads.filter(l => isToday(l.createdDate)).length;
    const todayConvLeads = new Set(
      conversations.filter(c => isToday(c.timestamp)).map(c => c.leadId)
    ).size;
    const messagesToday = conversations.filter(c => isToday(c.timestamp)).length;
    const appointmentsToday = appointments.filter(a => isToday(a.appointmentDate)).length;
    const followUpsDueToday = followUps.filter(
      f => f.status === 'pending' && isToday(f.scheduledTime)
    ).length;
    const highPriority = leads.filter(l => l.leadScore >= 8).length;
    const qualifyingStatuses = new Set(['qualified', 'booked', 'proposal sent']);
    const budgets = memories
      .filter(m => (m.memoryType as string) === 'budget' && qualifyingStatuses.has(leads.find(l => l.id === m.leadId)?.status as string ?? ''))
      .map(m => parseBudget(m.memoryValue))
      .filter((v): v is number => v !== null);
    const revenueToday = budgets.reduce((s, v) => s + v, 0);
    const bookedCount = appointments.filter(a =>
      ['scheduled', 'confirmed', 'completed'].includes(a.status)
    ).length;
    const conversionRate = leads.length > 0 ? (bookedCount / leads.length) * 100 : 0;
    return {
      newLeadsToday,
      conversationsToday: todayConvLeads,
      messagesToday,
      appointmentsToday,
      followUpsDueToday,
      highPriority,
      revenueToday,
      conversionRate,
    };
  }, [leads, conversations, appointments, followUps, memories]);

  // ── ATTENTION items ────────────────────────────────────────────────────────
  const attentionItems = useMemo(() => {
    const items: { id: string; severity: 'error' | 'warning'; text: string }[] = [];

    const highIntentWaiting = leads.filter(
      l => l.intent === 'high' && l.status === 'new'
    ).length;
    if (highIntentWaiting > 0)
      items.push({ id: 'hi1', severity: 'error', text: `${highIntentWaiting} high-intent lead${highIntentWaiting > 1 ? 's' : ''} awaiting first response.` });

    const qualifiedNotBooked = leads.filter(
      l => l.status === 'qualified' && !appointments.some(a => a.leadId === l.id)
    ).length;
    if (qualifiedNotBooked > 0)
      items.push({ id: 'qnb', severity: 'warning', text: `${qualifiedNotBooked} qualified lead${qualifiedNotBooked > 1 ? 's' : ''} have not booked an appointment yet.` });

    const proposalInactive = leads.filter(l => {
      if ((l.status as string) !== 'proposal sent') return false;
      const diff = (Date.now() - new Date(l.lastContactTime).getTime()) / 86400000;
      return diff > 7;
    }).length;
    if (proposalInactive > 0)
      items.push({ id: 'pi1', severity: 'error', text: `${proposalInactive} proposal-sent lead${proposalInactive > 1 ? 's have' : ' has'} been inactive for 7+ days.` });

    const overdueFollowUps = followUps.filter(
      f => f.status === 'pending' && isOverdue(f.scheduledTime)
    ).length;
    if (overdueFollowUps > 0)
      items.push({ id: 'of1', severity: 'warning', text: `${overdueFollowUps} follow-up${overdueFollowUps > 1 ? 's are' : ' is'} overdue.` });

    const upcomingUnconfirmed = appointments.filter(
      a => a.status === 'scheduled' && new Date(a.appointmentDate) > new Date()
    ).length;
    if (upcomingUnconfirmed > 0)
      items.push({ id: 'uu1', severity: 'warning', text: `${upcomingUnconfirmed} appointment${upcomingUnconfirmed > 1 ? 's' : ''} awaiting confirmation.` });

    const noShows = appointments.filter(a => a.status === 'no-show').length;
    if (noShows > 0)
      items.push({ id: 'ns1', severity: 'error', text: `${noShows} lead${noShows > 1 ? 's' : ''} missed their appointment.` });

    return items;
  }, [leads, appointments, followUps]);

  // ── KPI OVERVIEW ───────────────────────────────────────────────────────────
  const kpiData = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => (l.status as string) !== 'lost' && (l.status as string) !== 'won').length;
    const highQuality = leads.filter(l => l.leadScore > 7).length;
    const booked = appointments.filter(a =>
      ['scheduled', 'confirmed', 'completed'].includes(a.status)
    ).length;
    const avgScore = totalLeads > 0 ? leads.reduce((s, l) => s + l.leadScore, 0) / totalLeads : 0;
    const conversionRate = totalLeads > 0 ? (booked / totalLeads) * 100 : 0;
    return { totalLeads, activeLeads, highQuality, booked, avgScore, conversionRate };
  }, [leads, appointments]);

  // ── PIPELINE ────────────────────────────────────────────────────────────────
  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      ...stage,
      count: leads.filter(l => l.status.toLowerCase() === stage.key).length,
    }));
  }, [leads]);

  const maxPipelineCount = useMemo(
    () => Math.max(...pipelineData.map(d => d.count), 1),
    [pipelineData]
  );

  // ── LEAD SCORE TIERS ────────────────────────────────────────────────────────
  const scoreTiers = useMemo(() => {
    return {
      hot: leads.filter(l => l.leadScore >= 8).length,
      warm: leads.filter(l => l.leadScore >= 6 && l.leadScore < 8).length,
      cold: leads.filter(l => l.leadScore >= 3 && l.leadScore < 6).length,
      notInterested: leads.filter(l => l.leadScore < 3).length,
    };
  }, [leads]);

  // ── LEAD SOURCE ─────────────────────────────────────────────────────────────
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const src = l.source?.trim() || 'Unknown';
      counts[src] = (counts[src] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [leads]);

  const bestSource = sourceData.length > 0 ? sourceData[0].name : '—';

  // ── INTENT DISTRIBUTION ─────────────────────────────────────────────────────
  const intentData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const v = (l.intent || 'unknown').toLowerCase();
      counts[v] = (counts[v] ?? 0) + 1;
    });
    memories.filter(m => m.memoryType === 'intent').forEach(m => {
      const v = (m.memoryValue || 'unknown').toLowerCase();
      counts[v] = (counts[v] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [leads, memories]);

  // ── URGENCY DISTRIBUTION ────────────────────────────────────────────────────
  const urgencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const v = (l.urgency || 'unknown').toLowerCase();
      counts[v] = (counts[v] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [leads]);

  // ── BUSINESS TYPE DISTRIBUTION ──────────────────────────────────────────────
  const businessTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    memories.filter(m => m.memoryType === 'context').forEach(m => {
      const v = m.memoryValue?.trim() || '';
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });
    if (Object.keys(counts).length === 0) {
      leads.forEach(l => {
        const v = l.businessType?.trim() || 'Other';
        if (v) counts[v] = (counts[v] ?? 0) + 1;
      });
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [memories, leads]);

  // ── APPOINTMENT ANALYTICS ────────────────────────────────────────────────────
  const apptAnalytics = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(
      a => ['scheduled', 'confirmed'].includes(a.status) && new Date(a.appointmentDate) >= new Date()
    ).length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const booked = appointments.filter(a =>
      ['scheduled', 'confirmed', 'completed', 'no-show'].includes(a.status)
    ).length;
    const showRate = booked > 0 ? (completed / booked) * 100 : 0;
    const noShowRate = booked > 0 ? (noShow / booked) * 100 : 0;
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    const reminderSent = appointments.filter(a => a.reminderSent).length;
    const reminderRate = total > 0 ? (reminderSent / total) * 100 : 0;
    return { total, upcoming, completed, noShow, cancelled, booked, showRate, noShowRate, successRate, reminderRate };
  }, [appointments]);

  // ── FOLLOW-UP ANALYTICS ──────────────────────────────────────────────────────
  const followUpAnalytics = useMemo(() => {
    const total = followUps.length;
    const pending = followUps.filter(f => f.status === 'pending').length;
    const completed = followUps.filter(f => f.status === 'completed' || f.status === 'sent').length;
    const overdueList = followUps.filter(
      f => f.status === 'pending' && isOverdue(f.scheduledTime)
    );
    const overdue = overdueList.length;
    const failed = followUps.filter(f => f.status === 'failed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const avgDelayHours = overdue > 0 
      ? overdueList.reduce((sum, f) => sum + (Date.now() - new Date(f.scheduledTime).getTime()), 0) / overdue / 3600000 
      : 0;
      
    return { total, pending, completed, overdue, failed, completionRate, avgDelayHours };
  }, [followUps]);

  // ── CONVERSATION ANALYTICS ───────────────────────────────────────────────────
  const convAnalytics = useMemo(() => {
    const totalMessages = conversations.length;
    const uniqueLeads = new Set(conversations.map(c => c.leadId)).size;
    const ownerMessages = conversations.filter(
      c => c.sender?.toLowerCase() === 'owner'
    ).length;
    const aiMessages = conversations.filter(
      c => ['ai', 'bot', 'assistant', 'system'].includes(c.sender?.toLowerCase() ?? '')
    ).length;
    const avgPerLead = uniqueLeads > 0 ? totalMessages / uniqueLeads : 0;

    const leadMsgCount: Record<string, number> = {};
    conversations.forEach(c => {
      leadMsgCount[c.leadId] = (leadMsgCount[c.leadId] ?? 0) + 1;
    });
    const mostActiveLeadId = Object.entries(leadMsgCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostActiveLead = leads.find(l => l.id === mostActiveLeadId);

    return { totalMessages, uniqueLeads, ownerMessages, aiMessages, avgPerLead, mostActiveLead, leadMsgCount };
  }, [conversations, leads]);

  // ── REVENUE POTENTIAL ────────────────────────────────────────────────────────
  const revenueData = useMemo(() => {
    const qualifyingStatuses = new Set(['qualified', 'booked', 'proposal sent']);

    const latestBudgets: Record<string, string> = {};
    memories
      .filter(m => (m.memoryType as string) === 'budget')
      .sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
      .forEach(m => {
        const lead = leads.find(l => l.id === m.leadId);
        if (lead && qualifyingStatuses.has(lead.status as string)) {
          latestBudgets[m.leadId] = m.memoryValue;
        }
      });

    const budgetValues = Object.values(latestBudgets)
      .map(v => parseBudget(v))
      .filter((v): v is number => v !== null);

    const pipelineValue = budgetValues.reduce((s, v) => s + v, 0);
    const avgBudget = budgetValues.length > 0 ? pipelineValue / budgetValues.length : 0;

    return {
      pipelineValue,
      avgBudget,
      qualifyingLeadCount: Object.keys(latestBudgets).length,
      hasBudgetData: budgetValues.length > 0,
    };
  }, [memories, leads]);

  // ── fmt helpers ────────────────────────────────────────────────────────────
  const fmtCurrency = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Math.round(n).toLocaleString()}`;

  // ── AI INSIGHTS ──────────────────────────────────────────────────────────────
  const fetchAIInsights = useCallback(async () => {
    const grokKey = settings.apiKeys.grok;
    const openaiKey = settings.apiKeys.openai;

    if (!grokKey && !openaiKey) {
      setAiError('no_provider');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);

    try {
      const payload = {
        grokKey, openaiKey,
        analytics: {
          totalLeads: kpiData.totalLeads, activeLeads: kpiData.activeLeads,
          highQualityLeads: kpiData.highQuality, avgLeadScore: kpiData.avgScore, conversionRate: kpiData.conversionRate,
          statusDistribution: Object.fromEntries(pipelineData.map(s => [s.label, s.count])),
          sourceDistribution: Object.fromEntries(sourceData.map(s => [s.name, s.value])),
          scoreTiers,
          intentDistribution: Object.fromEntries(intentData.map(d => [d.name, d.value])),
          urgencyDistribution: Object.fromEntries(urgencyData.map(d => [d.name, d.value])),
          businessTypeDistribution: Object.fromEntries(businessTypeData.map(d => [d.name, d.value])),
          appointments: {
            total: apptAnalytics.total, upcoming: apptAnalytics.upcoming, completed: apptAnalytics.completed,
            noShow: apptAnalytics.noShow, cancelled: apptAnalytics.cancelled, showRate: apptAnalytics.showRate,
            reminderSuccessRate: apptAnalytics.reminderRate,
          },
          followUps: {
            total: followUpAnalytics.total, pending: followUpAnalytics.pending, completed: followUpAnalytics.completed,
            overdue: followUpAnalytics.overdue, completionRate: followUpAnalytics.completionRate,
          },
          conversations: {
            totalMessages: convAnalytics.totalMessages, uniqueLeads: convAnalytics.uniqueLeads,
            ownerMessages: convAnalytics.ownerMessages, aiMessages: convAnalytics.aiMessages,
            avgMessagesPerLead: convAnalytics.avgPerLead,
          },
          revenue: {
            pipelineValue: revenueData.pipelineValue, avgBudget: revenueData.avgBudget, qualifyingLeadCount: revenueData.qualifyingLeadCount,
          },
          todaySnapshot: {
            newLeads: todaySnapshot.newLeadsToday, conversationsToday: todaySnapshot.conversationsToday,
            messagesToday: todaySnapshot.messagesToday, appointmentsToday: todaySnapshot.appointmentsToday,
            followUpsDueToday: todaySnapshot.followUpsDueToday,
          },
        },
      };

      const res = await fetch('/api/analytics-insights', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error === 'no_provider') setAiError('no_provider');
        else setAiError('failed');
        return;
      }
      setAiInsights(data.insights);
    } catch {
      setAiError('failed');
    } finally {
      setAiLoading(false);
    }
  }, [settings, kpiData, pipelineData, sourceData, scoreTiers, intentData, urgencyData, businessTypeData, apptAnalytics, followUpAnalytics, convAnalytics, revenueData, todaySnapshot]);

  // ── Executive Summary Logic ──────────────────────────────────────────────────
  const healthStatus = kpiData.conversionRate >= 10 ? 'Excellent' : kpiData.conversionRate > 0 ? 'Good' : 'Needs Improvement';
  const qualityStatus = kpiData.avgScore >= 7 ? 'High Quality' : kpiData.avgScore >= 5 ? 'Average' : 'Low Quality';
  const execAction = attentionItems.length > 0 ? attentionItems[0].text : 'Pipeline looks healthy. No immediate actions required.';

  // ── Skeleton Loader ──────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="flex flex-col gap-10 p-10 animate-pulse">
        <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 rounded-2xl"></div>
          <div className="h-80 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-16 max-w-[1600px] mx-auto w-full">

      {/* ── Executive Summary Banner ───────────────────────────────────────── */}
      <section>
        <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10B981]" />
          <div>
            <p className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Executive Summary</p>
            <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight tracking-tight mb-3">Business Health: {healthStatus}</h1>
            <p className="text-[16px] font-medium text-[#64748B]">Real-time overview of your CRM pipeline performance.</p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Lead Quality</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{qualityStatus}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Appointments</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{apptAnalytics.showRate > 0 ? `${Math.round(apptAnalytics.showRate)}% Show Rate` : 'No Shows Yet'}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Revenue Potential</p>
              <p className="text-[20px] font-bold text-[#10B981]">{fmtCurrency(revenueData.pipelineValue)}</p>
            </div>
          </div>
        </div>
        {attentionItems.length > 0 && (
          <div className="mt-6 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-[#FDE68A]">
              <AlertTriangle className="text-[#D97706]" size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[16px] font-bold text-[#92400E]">Attention Needed</p>
              <p className="text-[14px] font-medium text-[#B45309] mt-1">{execAction}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2: KPI Overview ───────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Target} title="Pipeline Overview" subtitle="Key performance indicators across your entire CRM" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Leads" value={kpiData.totalLeads} icon={Users} color={PALETTE.primary} />
          <StatCard label="Active Leads" value={kpiData.activeLeads} icon={Activity} color={PALETTE.primary} trend={{ value: `${kpiData.activeLeads} active`, type: 'neutral' }} />
          <StatCard label="High Quality" value={kpiData.highQuality} sub="Score > 7" icon={Star} color={PALETTE.ai} trend={kpiData.highQuality > 0 ? { value: 'Strong', type: 'up' } : undefined} />
          <StatCard label="Appointments" value={kpiData.booked} sub="Booked" icon={Calendar} color={PALETTE.warning} />
          <StatCard label="Avg Score" value={`${kpiData.avgScore.toFixed(1)}`} sub="Out of 10" icon={Target} color={PALETTE.primary} />
          <StatCard label="Conversion Rate" value={`${kpiData.conversionRate.toFixed(1)}%`} sub="Leads → Booked" icon={TrendingUp} color={PALETTE.success} trend={kpiData.conversionRate > 0 ? { value: 'Positive', type: 'up' } : undefined} />
        </div>
      </section>

      {/* ── Section 3 + 4: Pipeline + Score Tiers ────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Pipeline */}
          <div className="flex flex-col h-full">
            <SectionHeader icon={ChevronRight} title="Lead Pipeline" subtitle="Breakdown by pipeline stage" />
            <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10 flex-1">
              {leads.length === 0 ? (
                <PremiumEmptyState icon={Users} title="No Leads Yet" desc="Your pipeline will populate here as new leads enter the system." />
              ) : (
                <div className="space-y-8 mt-2">
                  {pipelineData.map(stage => {
                    const pct = maxPipelineCount > 0 ? (stage.count / maxPipelineCount) * 100 : 0;
                    const stageIcons: Record<string, React.ElementType> = {
                      new: Users,
                      contacted: PhoneCall,
                      qualified: CheckCircle2,
                      booked: Calendar,
                      'proposal sent': MessageSquare,
                      won: Target,
                      lost: XCircle
                    };
                    const StageIcon = stageIcons[stage.key] || ArrowRight;

                    return (
                      <div key={stage.key} className="flex items-center gap-6">
                        <div className="flex items-center gap-4 w-48 shrink-0">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${stage.color}15` }}>
                            <StageIcon size={18} style={{ color: stage.color }} strokeWidth={2} />
                          </div>
                          <span className="text-[15px] font-bold text-[#334155]">
                            {stage.label}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center h-4">
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner flex items-center relative">
                            {stage.count === 0 ? (
                              <div className="h-3 w-3 rounded-full absolute left-0 top-0 shadow-sm" style={{ background: stage.color }} />
                            ) : (
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm"
                                style={{ 
                                  width: `${Math.max(pct, 2)}%`, 
                                  background: stage.color
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="w-24 flex items-center justify-end gap-6 shrink-0">
                          <span className="text-[16px] font-bold text-[#0F172A] w-6 text-right">{stage.count}</span>
                          <span className={`text-[14px] font-medium w-10 text-right ${stage.count > 0 ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                            {leads.length > 0 ? `${Math.round((stage.count / leads.length) * 100)}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Score Tiers */}
          <div className="flex flex-col h-full">
            <SectionHeader icon={Flame} title="Lead Score Tiers" subtitle="Pipeline quality distribution based on lead scores." />
            <div className="grid grid-cols-2 gap-6 flex-1 mb-6">
              {[
                { label: 'Hot Leads', count: scoreTiers.hot, color: PALETTE.danger, icon: Flame },
                { label: 'Warm Leads', count: scoreTiers.warm, color: PALETTE.warning, icon: Thermometer },
                { label: 'Cold Leads', count: scoreTiers.cold, color: PALETTE.primary, icon: Snowflake },
                { label: 'Not Interested', count: scoreTiers.notInterested, color: PALETTE.slate, icon: Ban },
              ].map(({ label, count, color, icon: TierIcon }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] border border-[rgba(15,23,42,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06),_0_24px_48px_rgba(15,23,42,0.04)] relative overflow-hidden h-full"
                >
                  <div className="absolute top-8 right-8 opacity-[0.04] pointer-events-none">
                    <TierIcon size={72} style={{ color }} />
                  </div>
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="h-3 w-3 rounded-full shadow-sm shrink-0" style={{ background: color }} />
                    <span className="text-[16px] font-bold text-[#0F172A] truncate">{label}</span>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <p className="text-[40px] font-bold text-[#0F172A] leading-none tracking-tight">{count}</p>
                    <p className="text-[14px] font-medium text-[#64748B] mt-3">
                      {leads.length > 0 ? `${Math.round((count / leads.length) * 100)}% of total pipeline` : '0%'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 flex items-start gap-4 shadow-sm mt-auto">
              <div className="bg-white rounded-lg p-1.5 shadow-sm border border-slate-100 shrink-0">
                <Star className="text-[#8B5CF6]" size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[14px] font-medium text-[#475569] leading-relaxed">
                <span className="font-bold text-[#8B5CF6]">Tip:</span> Focus on nurturing Hot and Warm leads to increase conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Lead Source Performance ────────────────────────────── */}
      <section>
        <SectionHeader icon={Zap} title="Lead Source Performance" subtitle="Where your leads are coming from" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <p className="text-[16px] font-bold text-[#0F172A]">Sources by Volume</p>
              {bestSource !== '—' && (
                <span className="text-[13px] font-bold text-[#64748B] bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                  Top Source: <span className="text-[#0F172A] ml-1">{bestSource}</span>
                </span>
              )}
            </div>
            {sourceData.length === 0 ? (
              <PremiumEmptyState icon={Zap} title="No Sources Tracked" desc="Lead source data will appear here once leads enter the system." />
            ) : (
              <div className="h-[320px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceData}
                    layout="vertical"
                    margin={{ top: 24, right: 32, left: 16, bottom: 24 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#0F172A" strokeOpacity={0.06} horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} tickMargin={16} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                      tickMargin={16}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="value" name="Leads" radius={[8, 8, 8, 8]} maxBarSize={32}>
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="h-full">
            <DonutChart data={sourceData} title="Source Distribution" emptyText="No sources tracked yet." />
          </div>
        </div>
      </section>

      {/* ── Section 6: Lead Intelligence ──────────────────────────────────── */}
      <section>
        <SectionHeader icon={Brain} title="Lead Intelligence" subtitle="Intent, urgency, and business type extracted from AI memory" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DonutChart data={intentData} title="Intent Distribution" emptyText="No intent data captured." />
          <DonutChart data={urgencyData} title="Urgency Distribution" emptyText="No urgency data captured." />
          <DonutChart data={businessTypeData} title="Business Type Distribution" emptyText="No business type data yet." />
        </div>
      </section>

      {/* ── Section 7: Appointment Analytics ──────────────────────────────── */}
      <section>
        <SectionHeader icon={Calendar} title="Appointment Analytics" subtitle="Performance and conversion tracking" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard label="Scheduled" value={apptAnalytics.upcoming} icon={Calendar} color={PALETTE.primary} />
          <StatCard label="Completed" value={apptAnalytics.completed} icon={CheckCircle2} color={PALETTE.success} />
          <StatCard label="No Shows" value={apptAnalytics.noShow} icon={XCircle} color={PALETTE.danger} />
          <StatCard label="Cancelled" value={apptAnalytics.cancelled} icon={AlertTriangle} color={PALETTE.warning} />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10 flex flex-col h-full">
            <p className="text-[16px] font-bold text-[#0F172A] mb-12">Appointment Rates</p>
            <div className="flex flex-wrap items-center justify-around gap-10 flex-1">
              <RingProgress value={apptAnalytics.showRate} label="Show Rate" color={PALETTE.success} size={140} />
              <RingProgress value={apptAnalytics.noShowRate} label="No-Show Rate" color={PALETTE.danger} size={140} />
              <RingProgress value={apptAnalytics.successRate} label="Success Rate" color={PALETTE.primary} size={140} />
            </div>
          </div>
          <div className="h-full">
            <DonutChart
              data={[
                { name: 'Upcoming', value: apptAnalytics.upcoming },
                { name: 'Completed', value: apptAnalytics.completed },
                { name: 'No-Show', value: apptAnalytics.noShow },
                { name: 'Cancelled', value: apptAnalytics.cancelled },
              ].filter(d => d.value > 0)}
              title="Appointment Status"
              emptyText="No appointments booked yet."
            />
          </div>
        </div>
      </section>

      {/* ── Section 8: Follow-Up Analytics ────────────────────────────────── */}
      <section>
        <SectionHeader icon={Clock} title="Follow-Up Analytics" subtitle="Effectiveness of your follow-up system" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatCard label="Pending" value={followUpAnalytics.pending} icon={Clock} color={PALETTE.warning} />
          <StatCard label="Completed" value={followUpAnalytics.completed} icon={CheckCircle2} color={PALETTE.success} />
          <StatCard label="Overdue" value={followUpAnalytics.overdue} icon={AlertTriangle} color={PALETTE.danger} highlight={followUpAnalytics.overdue > 0} />
          <StatCard label="Avg Delay" value={followUpAnalytics.avgDelayHours > 0 ? `${followUpAnalytics.avgDelayHours.toFixed(1)}h` : '—'} sub="For overdue items" icon={Activity} color={PALETTE.warning} />
          <StatCard label="Failed" value={followUpAnalytics.failed} icon={XCircle} color={PALETTE.slate} />
        </div>
        <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[16px] font-bold text-[#0F172A]">Follow-Up Completion Rate</p>
            <span className="text-[20px] font-bold text-[#0F172A]">
              {followUpAnalytics.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${followUpAnalytics.completionRate}%`,
                background: `linear-gradient(90deg, ${PALETTE.primary}CC, ${PALETTE.primary})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-[14px] font-bold text-[#64748B]">{followUpAnalytics.completed} completed of {followUpAnalytics.total} total</span>
            {followUpAnalytics.overdue > 0 && (
              <span className="text-[14px] font-bold text-[#EF4444]">
                {followUpAnalytics.overdue} overdue
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 9: Conversation Analytics ─────────────────────────────── */}
      <section>
        <SectionHeader icon={MessageSquare} title="Conversation Analytics" subtitle="Communication activity across all channels" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
          <StatCard label="Total Messages" value={convAnalytics.totalMessages} icon={MessageSquare} color={PALETTE.primary} />
          <StatCard label="Unique Leads" value={convAnalytics.uniqueLeads} icon={Users} color={PALETTE.primary} />
          <StatCard label="Owner Messages" value={convAnalytics.ownerMessages} icon={UserCheck} color={PALETTE.ai} />
          <StatCard label="AI Messages" value={convAnalytics.aiMessages} icon={Brain} color={PALETTE.ai} />
          <StatCard label="Avg / Lead" value={convAnalytics.avgPerLead.toFixed(1)} icon={Activity} color={PALETTE.success} />
          
          <MiniProfileCard 
            name={convAnalytics.mostActiveLead?.fullName || '—'} 
            subtitle={convAnalytics.mostActiveLead ? 'Leading conversation' : 'No activity yet'} 
            count={convAnalytics.mostActiveLead ? (convAnalytics.leadMsgCount[convAnalytics.mostActiveLead.id] ?? 0) : 0} 
          />
        </div>

        {convAnalytics.totalMessages > 0 && (
          <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] p-10">
            <p className="text-[16px] font-bold text-[#0F172A] mb-10">Message Breakdown</p>
            <div className="w-full h-16 flex rounded-xl overflow-hidden mb-8 shadow-sm">
              {[
                { label: 'AI Messages', value: convAnalytics.aiMessages, color: PALETTE.ai },
                { label: 'Owner Messages', value: convAnalytics.ownerMessages, color: PALETTE.primary },
                { label: 'Other', value: convAnalytics.totalMessages - convAnalytics.aiMessages - convAnalytics.ownerMessages, color: PALETTE.slate },
              ].filter(d => d.value > 0).map(d => (
                <div 
                  key={d.label} 
                  style={{ width: `${(d.value / convAnalytics.totalMessages) * 100}%`, background: d.color }} 
                  className="h-full transition-all duration-1000 ease-out flex items-center justify-center border-r border-white/20 last:border-0"
                >
                  {(d.value / convAnalytics.totalMessages) > 0.1 && (
                    <span className="text-[14px] font-bold text-white px-4 truncate">{d.label}</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-10 justify-center">
              {[
                { label: 'AI Messages', value: convAnalytics.aiMessages, color: PALETTE.ai },
                { label: 'Owner Messages', value: convAnalytics.ownerMessages, color: PALETTE.primary },
                { label: 'Other', value: convAnalytics.totalMessages - convAnalytics.aiMessages - convAnalytics.ownerMessages, color: PALETTE.slate },
              ].filter(d => d.value > 0).map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full shadow-sm" style={{ background: d.color }} />
                  <span className="text-[14px] font-bold text-[#475569]">{d.label}</span>
                  <span className="text-[16px] font-bold text-[#0F172A]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 10: Revenue Potential ─────────────────────────────────── */}
      <section>
        <SectionHeader icon={DollarSign} title="Revenue Potential" subtitle="Forecast based on qualified, booked, and proposal-sent leads only" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Pipeline Value"
            value={revenueData.hasBudgetData ? fmtCurrency(revenueData.pipelineValue) : '—'}
            sub="Qualifying leads"
            icon={TrendingUp}
            color={PALETTE.success}
            highlight
          />
          <StatCard
            label="Average Budget"
            value={revenueData.hasBudgetData ? fmtCurrency(revenueData.avgBudget) : '—'}
            sub="Per qualifying lead"
            icon={DollarSign}
            color={PALETTE.primary}
          />
          <StatCard
            label="Qualifying Leads"
            value={revenueData.qualifyingLeadCount}
            sub="Qualified + Booked + Proposal"
            icon={PhoneCall}
            color={PALETTE.ai}
          />
        </div>
        {!revenueData.hasBudgetData && (
          <div className="mt-8">
            <PremiumEmptyState icon={DollarSign} title="No Revenue Data" desc="Budget information will appear here once leads share their budget constraints with the AI assistant." />
          </div>
        )}
      </section>

      {/* ── Section 11: AI Generated Insights ────────────────────────────── */}
      <section>
        <SectionHeader icon={Brain} title="AI Business Insights" subtitle="Deep intelligence layer powered by your CRM data" />

        {/* Trigger panel */}
        {!aiInsights && !aiLoading && (
          <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl p-16 flex flex-col items-center justify-center gap-8 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] relative overflow-hidden group min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 relative z-10">
              <Brain size={48} className="text-white" />
            </div>
            <div className="max-w-xl relative z-10">
              <p className="text-[24px] font-bold text-[#0F172A] mb-3">Generate Executive Insights</p>
              <p className="text-[16px] text-[#64748B] leading-relaxed font-medium">
                Run a deep analysis on your live CRM data to uncover hidden opportunities, pinpoint pipeline bottlenecks, and receive actionable strategic recommendations.
              </p>
            </div>

            {aiError === 'no_provider' ? (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-8 py-5 flex items-center gap-4 shadow-sm relative z-10 mt-2">
                <AlertTriangle size={24} className="text-[#D97706] shrink-0" />
                <span className="text-[15px] font-bold text-[#92400E]">Configure an AI provider in Settings to enable Analytics Insights.</span>
              </div>
            ) : aiError === 'failed' ? (
              <div className="flex flex-col items-center gap-5 relative z-10 mt-2">
                <p className="text-[14px] font-bold text-[#EF4444]">Analysis failed. Please try again.</p>
                <button
                  onClick={fetchAIInsights}
                  className="flex items-center gap-3 px-8 py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[15px] font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  <RefreshCw size={18} /> Retry Analysis
                </button>
              </div>
            ) : (
              <button
                onClick={fetchAIInsights}
                className="flex items-center gap-3 px-10 py-5 bg-[#0F172A] hover:bg-[#1E293B] hover:-translate-y-1 hover:shadow-xl text-white text-[16px] font-bold rounded-2xl transition-all shadow-lg active:scale-95 relative z-10 mt-4"
              >
                <Brain size={20} />
                Generate Insights
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {aiLoading && (
          <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl p-24 flex flex-col items-center justify-center gap-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)] min-h-[400px]">
            <Loader2 size={48} className="text-[#8B5CF6] animate-spin" />
            <p className="text-[18px] font-bold text-[#0F172A]">Synthesizing CRM data…</p>
          </div>
        )}

        {/* Insights */}
        {aiInsights && !aiLoading && (
          <div className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl p-10 shadow-[0_2px_8px_rgba(15,23,42,0.04),_0_12px_24px_rgba(15,23,42,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]" />
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center">
                  <Brain size={28} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-[24px] font-bold text-[#0F172A]">Executive Analysis</p>
                  <p className="text-[15px] font-medium text-[#64748B] mt-1">Generated from live pipeline data</p>
                </div>
              </div>
              <button
                onClick={fetchAIInsights}
                className="flex items-center gap-2 px-5 py-3 text-[14px] font-bold text-[#475569] hover:text-[#0F172A] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw size={16} /> Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { title: 'Key Insights', items: aiInsights.keyInsights, color: PALETTE.primary, icon: BarChart2 },
                { title: 'Opportunities', items: aiInsights.opportunities, color: PALETTE.success, icon: TrendingUp },
                { title: 'Recommended Actions', items: aiInsights.recommendedActions, color: PALETTE.ai, icon: Zap },
                { title: 'Attention Required', items: aiInsights.attentionRequired, color: PALETTE.danger, icon: AlertTriangle },
              ].map(({ title, items, color, icon: Icon }) => (
                <div key={title} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Icon size={24} style={{ color }} strokeWidth={2.5} />
                    </div>
                    <span className="text-[18px] font-bold text-[#0F172A]">{title}</span>
                  </div>
                  <ul className="space-y-6">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="h-2 w-2 rounded-full mt-2 shrink-0 shadow-sm" style={{ background: color }} />
                        <p className="text-[15px] font-medium text-[#334155] leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
