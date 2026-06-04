'use client';

import { useMemo, useState, useCallback } from 'react';
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
  Thermometer,
  Snowflake,
  XCircle,
  ChevronRight,
} from 'lucide-react';

// ─── Palette ────────────────────────────────────────────────────────────────
const PALETTE = {
  blue:   '#2563EB',
  teal:   '#0D9488',
  violet: '#7C3AED',
  amber:  '#D97706',
  rose:   '#E11D48',
  sky:    '#0284C7',
  green:  '#059669',
  orange: '#EA580C',
  indigo: '#4338CA',
  slate:  '#64748B',
};

const PIE_COLORS = [
  PALETTE.blue, PALETTE.teal, PALETTE.violet, PALETTE.amber,
  PALETTE.rose, PALETTE.sky, PALETTE.green, PALETTE.orange,
];

// ─── Pipeline stages (exact values from CRM store) ──────────────────────────
const PIPELINE_STAGES = [
  { key: 'new',           label: 'New',           color: PALETTE.sky,    bg: 'bg-sky-50',    text: 'text-sky-700'    },
  { key: 'contacted',     label: 'Contacted',      color: PALETTE.blue,   bg: 'bg-blue-50',   text: 'text-blue-700'   },
  { key: 'qualified',     label: 'Qualified',      color: PALETTE.violet, bg: 'bg-violet-50', text: 'text-violet-700' },
  { key: 'booked',        label: 'Booked',         color: PALETTE.teal,   bg: 'bg-teal-50',   text: 'text-teal-700'   },
  { key: 'proposal sent', label: 'Proposal Sent',  color: PALETTE.amber,  bg: 'bg-amber-50',  text: 'text-amber-700'  },
  { key: 'won',           label: 'Won',            color: PALETTE.green,  bg: 'bg-emerald-50',text: 'text-emerald-700'},
  { key: 'lost',          label: 'Lost',           color: PALETTE.rose,   bg: 'bg-rose-50',   text: 'text-rose-700'   },
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
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg min-w-[130px]">
      {label && <p className="text-[12px] font-semibold text-slate-700 mb-2">{label}</p>}
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[12px]">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: e.color ?? e.fill }}
            />
            {e.name}
          </span>
          <span className="font-semibold text-slate-900">{e.value}</span>
        </div>
      ))}
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
    <div className="flex items-center gap-3 mb-5">
      <div className="h-9 w-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-[#2563EB]" size={18} />
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
        {subtitle && <p className="text-[12px] text-[#94A3B8]">{subtitle}</p>}
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
  color = '#2563EB',
  bg = '#EFF6FF',
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  bg?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-3 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        highlight ? 'border-[#2563EB]/30 ring-1 ring-[#2563EB]/10' : 'border-[#E2E8F0]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">{label}</span>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-[28px] font-bold text-[#0F172A] leading-none tracking-tight">{value}</p>
        {sub && <p className="text-[12px] text-[#94A3B8] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Donut with Legend ───────────────────────────────────────────────────────
function DonutChart({
  data,
  title,
  emptyText = 'No data yet',
}: {
  data: { name: string; value: number }[];
  title: string;
  emptyText?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const nonEmpty = data.filter(d => d.value > 0);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <p className="text-[13px] font-semibold text-[#0F172A] mb-4">{title}</p>
      {total === 0 || nonEmpty.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 gap-2">
          <BarChart2 size={28} className="text-[#E2E8F0]" />
          <p className="text-[12px] text-[#94A3B8]">{emptyText}</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonEmpty}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {nonEmpty.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[18px] font-bold text-[#0F172A]">{total}</span>
              <span className="text-[10px] text-[#94A3B8]">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {nonEmpty.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-[11px] text-[#64748B] truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-[#0F172A]">{d.value}</span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {total > 0 ? `${Math.round((d.value / total) * 100)}%` : '—'}
                  </span>
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
  color = '#10B981',
  size = 80,
}: {
  value: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const r = (size / 2) - 6;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(value, 100) / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={6} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-bold text-[#0F172A]">
            {isNaN(value) ? '—' : `${Math.round(value)}%`}
          </span>
        </div>
      </div>
      <span className="text-[11px] text-[#64748B] text-center">{label}</span>
    </div>
  );
}

// ─── Insight card sub-component ───────────────────────────────────────────────
function InsightPanel({
  title,
  items,
  color,
  icon: Icon,
}: {
  title: string;
  items: string[];
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[13px] font-semibold text-[#0F172A]">{title}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
            <p className="text-[13px] text-[#374151] leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
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
  const { leads, conversations, memories, appointments, followUps, settings } =
    useCRMStore();

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
      .filter(m => (m.memoryType as string) === 'budget' && qualifyingStatuses.has(leads.find(l => l.id === m.leadId)?.status ?? ''))
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
      items.push({ id: 'of1', severity: 'warning', text: `${overdueFollowUps} follow-up${overdueFollowUps > 1 ? 's are' : ' is'} overdue and need to be sent now.` });

    const upcomingUnconfirmed = appointments.filter(
      a => a.status === 'scheduled' && new Date(a.appointmentDate) > new Date()
    ).length;
    if (upcomingUnconfirmed > 0)
      items.push({ id: 'uu1', severity: 'warning', text: `${upcomingUnconfirmed} upcoming appointment${upcomingUnconfirmed > 1 ? 's' : ''} still awaiting confirmation.` });

    const noShows = appointments.filter(a => a.status === 'no-show').length;
    if (noShows > 0)
      items.push({ id: 'ns1', severity: 'error', text: `${noShows} lead${noShows > 1 ? 's' : ''} missed their appointment — follow-up recommended.` });

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
    const avgScore =
      totalLeads > 0
        ? leads.reduce((s, l) => s + l.leadScore, 0) / totalLeads
        : 0;
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

  const bestSource = useMemo(
    () => (sourceData.length > 0 ? sourceData[0].name : '—'),
    [sourceData]
  );

  // ── INTENT DISTRIBUTION ─────────────────────────────────────────────────────
  const intentData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const v = (l.intent || 'unknown').toLowerCase();
      counts[v] = (counts[v] ?? 0) + 1;
    });
    // Augment with AI Memory intent if available
    memories
      .filter(m => m.memoryType === 'intent')
      .forEach(m => {
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
    // Use AI Memory for business type (most accurate from AI qualification)
    memories
      .filter(m => m.memoryType === 'context')
      .forEach(m => {
        const v = m.memoryValue?.trim() || '';
        if (v) counts[v] = (counts[v] ?? 0) + 1;
      });
    // Fallback: leads.businessType
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

    // Most active lead by message count
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

    // Get latest budget memory per lead, only for qualifying leads
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
        grokKey,
        openaiKey,
        analytics: {
          totalLeads: kpiData.totalLeads,
          activeLeads: kpiData.activeLeads,
          highQualityLeads: kpiData.highQuality,
          avgLeadScore: kpiData.avgScore,
          conversionRate: kpiData.conversionRate,
          statusDistribution: Object.fromEntries(
            pipelineData.map(s => [s.label, s.count])
          ),
          sourceDistribution: Object.fromEntries(
            sourceData.map(s => [s.name, s.value])
          ),
          scoreTiers,
          intentDistribution: Object.fromEntries(
            intentData.map(d => [d.name, d.value])
          ),
          urgencyDistribution: Object.fromEntries(
            urgencyData.map(d => [d.name, d.value])
          ),
          businessTypeDistribution: Object.fromEntries(
            businessTypeData.map(d => [d.name, d.value])
          ),
          appointments: {
            total: apptAnalytics.total,
            upcoming: apptAnalytics.upcoming,
            completed: apptAnalytics.completed,
            noShow: apptAnalytics.noShow,
            cancelled: apptAnalytics.cancelled,
            showRate: apptAnalytics.showRate,
            reminderSuccessRate: apptAnalytics.reminderRate,
          },
          followUps: {
            total: followUpAnalytics.total,
            pending: followUpAnalytics.pending,
            completed: followUpAnalytics.completed,
            overdue: followUpAnalytics.overdue,
            completionRate: followUpAnalytics.completionRate,
          },
          conversations: {
            totalMessages: convAnalytics.totalMessages,
            uniqueLeads: convAnalytics.uniqueLeads,
            ownerMessages: convAnalytics.ownerMessages,
            aiMessages: convAnalytics.aiMessages,
            avgMessagesPerLead: convAnalytics.avgPerLead,
          },
          revenue: {
            pipelineValue: revenueData.pipelineValue,
            avgBudget: revenueData.avgBudget,
            qualifyingLeadCount: revenueData.qualifyingLeadCount,
          },
          todaySnapshot: {
            newLeads: todaySnapshot.newLeadsToday,
            conversationsToday: todaySnapshot.conversationsToday,
            messagesToday: todaySnapshot.messagesToday,
            appointmentsToday: todaySnapshot.appointmentsToday,
            followUpsDueToday: todaySnapshot.followUpsDueToday,
          },
        },
      };

      const res = await fetch('/api/analytics-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'no_provider') {
          setAiError('no_provider');
        } else {
          setAiError('failed');
        }
        return;
      }

      setAiInsights(data.insights);
    } catch {
      setAiError('failed');
    } finally {
      setAiLoading(false);
    }
  }, [
    settings,
    kpiData,
    pipelineData,
    sourceData,
    scoreTiers,
    intentData,
    urgencyData,
    businessTypeData,
    apptAnalytics,
    followUpAnalytics,
    convAnalytics,
    revenueData,
    todaySnapshot,
  ]);

  // ── fmt helpers ────────────────────────────────────────────────────────────
  const fmtCurrency = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Math.round(n).toLocaleString()}`;

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-8">

      {/* ── Section 0: Today's Business Snapshot ─────────────────────────── */}
      <section>
        <SectionHeader icon={Activity} title="Today's Business Snapshot" subtitle={new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())} />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'New Leads', value: todaySnapshot.newLeadsToday, icon: Users, color: PALETTE.blue, bg: '#EFF6FF' },
            { label: 'Conversations', value: todaySnapshot.conversationsToday, icon: MessageSquare, color: PALETTE.teal, bg: '#F0FDFA' },
            { label: 'Messages', value: todaySnapshot.messagesToday, icon: Activity, color: PALETTE.violet, bg: '#F5F3FF' },
            { label: 'Appointments', value: todaySnapshot.appointmentsToday, icon: Calendar, color: PALETTE.amber, bg: '#FFFBEB' },
            { label: 'Follow-Ups Due', value: todaySnapshot.followUpsDueToday, icon: Clock, color: PALETTE.orange, bg: '#FFF7ED' },
            { label: 'High Priority', value: todaySnapshot.highPriority, icon: Star, color: PALETTE.rose, bg: '#FFF1F2' },
            { label: 'Pipeline Value', value: fmtCurrency(revenueData.pipelineValue), icon: DollarSign, color: PALETTE.green, bg: '#F0FDF4' },
            { label: 'Conversion', value: `${kpiData.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: PALETTE.sky, bg: '#F0F9FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-2 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={13} style={{ color }} />
              </div>
              <p className="text-[20px] font-bold text-[#0F172A] leading-none tracking-tight">{value}</p>
              <p className="text-[11px] text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 1: Attention Needed ───────────────────────────────────── */}
      {attentionItems.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Attention Needed" subtitle="Issues requiring your immediate action" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {attentionItems.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl px-4 py-3.5 border ${
                  item.severity === 'error'
                    ? 'bg-[#FFF1F2] border-[#FECDD3]'
                    : 'bg-[#FFFBEB] border-[#FDE68A]'
                }`}
              >
                <AlertTriangle
                  size={15}
                  className={`mt-0.5 shrink-0 ${item.severity === 'error' ? 'text-[#E11D48]' : 'text-[#D97706]'}`}
                />
                <p className="text-[13px] text-[#1E293B] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 2: KPI Overview ───────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Target} title="Pipeline Overview" subtitle="Key performance indicators across all leads" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Leads" value={kpiData.totalLeads} icon={Users} color={PALETTE.blue} bg="#EFF6FF" />
          <StatCard label="Active Leads" value={kpiData.activeLeads} icon={Activity} color={PALETTE.teal} bg="#F0FDFA" />
          <StatCard label="High Quality" value={kpiData.highQuality} sub="Score > 7" icon={Star} color={PALETTE.violet} bg="#F5F3FF" highlight />
          <StatCard label="Appointments" value={kpiData.booked} sub="Booked" icon={Calendar} color={PALETTE.amber} bg="#FFFBEB" />
          <StatCard label="Avg Score" value={`${kpiData.avgScore.toFixed(1)}`} sub="Out of 10" icon={Target} color={PALETTE.sky} bg="#F0F9FF" />
          <StatCard label="Conversion Rate" value={`${kpiData.conversionRate.toFixed(1)}%`} sub="Leads → Booked" icon={TrendingUp} color={PALETTE.green} bg="#F0FDF4" highlight />
        </div>
      </section>

      {/* ── Section 3 + 4: Pipeline + Score Tiers ────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Pipeline */}
          <div className="lg:col-span-3">
            <SectionHeader icon={ChevronRight} title="Lead Pipeline" subtitle="Breakdown by status" />
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Users size={32} className="text-[#E2E8F0]" />
                  <p className="text-[13px] text-[#94A3B8]">No leads in the pipeline yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pipelineData.map(stage => {
                    const pct = maxPipelineCount > 0 ? (stage.count / maxPipelineCount) * 100 : 0;
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <span className={`text-[11px] font-semibold w-28 shrink-0 px-2 py-0.5 rounded-md text-center ${stage.bg} ${stage.text}`}>
                          {stage.label}
                        </span>
                        <div className="flex-1 h-6 bg-[#F8FAFC] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(pct, 4)}%`, background: stage.color }}
                          >
                            {stage.count > 0 && (
                              <span className="text-[10px] font-bold text-white leading-none">{stage.count}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[12px] text-[#94A3B8] w-12 text-right shrink-0">
                          {leads.length > 0 ? `${Math.round((stage.count / leads.length) * 100)}%` : '0%'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Score Tiers */}
          <div className="lg:col-span-2">
            <SectionHeader icon={Flame} title="Lead Score Tiers" subtitle="Quality breakdown" />
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 h-[calc(100%-56px)]">
              <div className="grid grid-cols-2 gap-3 h-full">
                {[
                  { label: 'Hot', range: '8–10', count: scoreTiers.hot, color: PALETTE.rose, bg: '#FFF1F2', icon: Flame },
                  { label: 'Warm', range: '6–7', count: scoreTiers.warm, color: PALETTE.amber, bg: '#FFFBEB', icon: Thermometer },
                  { label: 'Cold', range: '3–5', count: scoreTiers.cold, color: PALETTE.sky, bg: '#F0F9FF', icon: Snowflake },
                  { label: 'Not Interested', range: '0–2', count: scoreTiers.notInterested, color: PALETTE.slate, bg: '#F8FAFC', icon: XCircle },
                ].map(({ label, range, count, color, bg, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4 flex flex-col gap-2 border border-transparent hover:border-[#E2E8F0] transition-all"
                    style={{ background: bg }}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={16} style={{ color }} />
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: color + '20', color }}>
                        {range}
                      </span>
                    </div>
                    <p className="text-[26px] font-bold text-[#0F172A] leading-none">{count}</p>
                    <div>
                      <p className="text-[12px] font-medium text-[#374151]">{label}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {leads.length > 0 ? `${Math.round((count / leads.length) * 100)}% of leads` : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Lead Source Performance ────────────────────────────── */}
      <section>
        <SectionHeader icon={Zap} title="Lead Source Performance" subtitle="Where your leads are coming from" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-[#0F172A]">Sources by Volume</p>
              <span className="text-[11px] text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded-md">
                Best: <span className="font-semibold text-[#2563EB]">{bestSource}</span>
              </span>
            </div>
            {sourceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Zap size={28} className="text-[#E2E8F0]" />
                <p className="text-[12px] text-[#94A3B8]">No source data yet.</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceData}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#475569', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Donut */}
          <DonutChart data={sourceData} title="Source Distribution" emptyText="No sources tracked yet." />
        </div>
      </section>

      {/* ── Section 6: Lead Intelligence ──────────────────────────────────── */}
      <section>
        <SectionHeader icon={Brain} title="Lead Intelligence" subtitle="Intent, urgency, and business type from AI memory" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DonutChart data={intentData} title="Intent Distribution" emptyText="No intent data captured." />
          <DonutChart data={urgencyData} title="Urgency Distribution" emptyText="No urgency data captured." />
          <DonutChart data={businessTypeData} title="Business Type Distribution" emptyText="No business type data yet." />
        </div>
      </section>

      {/* ── Section 7: Appointment Analytics ──────────────────────────────── */}
      <section>
        <SectionHeader icon={Calendar} title="Appointment Analytics" subtitle="Performance and conversion tracking" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Booked" value={apptAnalytics.booked} icon={Calendar} color={PALETTE.blue} bg="#EFF6FF" />
          <StatCard label="Completed" value={apptAnalytics.completed} icon={CheckCircle2} color={PALETTE.green} bg="#F0FDF4" />
          <StatCard label="No Shows" value={apptAnalytics.noShow} icon={XCircle} color={PALETTE.rose} bg="#FFF1F2" />
          <StatCard label="Cancelled" value={apptAnalytics.cancelled} icon={AlertTriangle} color={PALETTE.amber} bg="#FFFBEB" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conversion rates */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <p className="text-[13px] font-semibold text-[#0F172A] mb-6">Appointment Rates</p>
            <div className="flex items-center justify-around">
              <RingProgress value={apptAnalytics.showRate} label="Show Rate" color={PALETTE.green} size={90} />
              <RingProgress value={apptAnalytics.noShowRate} label="No-Show Rate" color={PALETTE.rose} size={90} />
              <RingProgress value={apptAnalytics.successRate} label="Success Rate" color={PALETTE.blue} size={90} />
              <RingProgress value={apptAnalytics.reminderRate} label="Reminder Sent" color={PALETTE.teal} size={90} />
            </div>
          </div>
          {/* Appointment status donut */}
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
      </section>

      {/* ── Section 8: Follow-Up Analytics ────────────────────────────────── */}
      <section>
        <SectionHeader icon={Clock} title="Follow-Up Analytics" subtitle="Effectiveness of your follow-up system" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <StatCard label="Pending" value={followUpAnalytics.pending} icon={Clock} color={PALETTE.amber} bg="#FFFBEB" />
          <StatCard label="Completed" value={followUpAnalytics.completed} icon={CheckCircle2} color={PALETTE.green} bg="#F0FDF4" />
          <StatCard
            label="Overdue"
            value={followUpAnalytics.overdue}
            icon={AlertTriangle}
            color={PALETTE.rose}
            bg="#FFF1F2"
            highlight={followUpAnalytics.overdue > 0}
          />
          <StatCard 
            label="Avg Delay" 
            value={followUpAnalytics.avgDelayHours > 0 ? `${followUpAnalytics.avgDelayHours.toFixed(1)}h` : '—'} 
            sub="For overdue items" 
            icon={Activity} 
            color={PALETTE.orange} 
            bg="#FFF7ED" 
          />
          <StatCard label="Failed" value={followUpAnalytics.failed} icon={XCircle} color={PALETTE.slate} bg="#F8FAFC" />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] font-semibold text-[#0F172A]">Follow-Up Completion Rate</p>
            <span className="text-[12px] font-semibold text-[#0F172A]">
              {followUpAnalytics.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${followUpAnalytics.completionRate}%`,
                background: `linear-gradient(90deg, ${PALETTE.teal}, ${PALETTE.blue})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-[#94A3B8]">{followUpAnalytics.completed} completed of {followUpAnalytics.total} total</span>
            {followUpAnalytics.overdue > 0 && (
              <span className="text-[11px] font-semibold text-[#E11D48]">
                {followUpAnalytics.overdue} overdue
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 9: Conversation Analytics ─────────────────────────────── */}
      <section>
        <SectionHeader icon={MessageSquare} title="Conversation Analytics" subtitle="Communication activity across all channels" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <StatCard label="Total Messages" value={convAnalytics.totalMessages} icon={MessageSquare} color={PALETTE.blue} bg="#EFF6FF" />
          <StatCard label="Unique Leads" value={convAnalytics.uniqueLeads} sub="In conversation" icon={Users} color={PALETTE.teal} bg="#F0FDFA" />
          <StatCard label="Owner Messages" value={convAnalytics.ownerMessages} icon={UserCheck} color={PALETTE.violet} bg="#F5F3FF" />
          <StatCard label="AI Messages" value={convAnalytics.aiMessages} icon={Brain} color={PALETTE.sky} bg="#F0F9FF" />
          <StatCard label="Avg / Lead" value={convAnalytics.avgPerLead.toFixed(1)} sub="Messages per lead" icon={Activity} color={PALETTE.amber} bg="#FFFBEB" />
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-2">
            <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Most Active</span>
            {convAnalytics.mostActiveLead ? (
              <>
                <p className="text-[14px] font-bold text-[#0F172A] leading-tight truncate">
                  {convAnalytics.mostActiveLead.fullName}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  {convAnalytics.leadMsgCount[convAnalytics.mostActiveLead.id] ?? 0} messages
                </p>
              </>
            ) : (
              <p className="text-[13px] text-[#94A3B8]">—</p>
            )}
          </div>
        </div>
        {/* AI vs Owner message breakdown bar */}
        {convAnalytics.totalMessages > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <p className="text-[13px] font-semibold text-[#0F172A] mb-4">Message Breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'AI Messages', value: convAnalytics.aiMessages, color: PALETTE.sky },
                { label: 'Owner Messages', value: convAnalytics.ownerMessages, color: PALETTE.violet },
                { label: 'Other', value: convAnalytics.totalMessages - convAnalytics.aiMessages - convAnalytics.ownerMessages, color: PALETTE.slate },
              ].filter(d => d.value > 0).map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-[#64748B] w-28 shrink-0">{d.label}</span>
                  <div className="flex-1 h-5 bg-[#F8FAFC] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.value / convAnalytics.totalMessages) * 100}%`,
                        background: d.color,
                        transition: 'width 0.7s ease',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#374151] w-20 text-right shrink-0">
                    {d.value} ({Math.round((d.value / convAnalytics.totalMessages) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 10: Revenue Potential ─────────────────────────────────── */}
      <section>
        <SectionHeader icon={DollarSign} title="Revenue Potential" subtitle="Forecast based on qualified, booked, and proposal-sent leads only" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Pipeline Value"
            value={revenueData.hasBudgetData ? fmtCurrency(revenueData.pipelineValue) : '—'}
            sub="Qualifying leads"
            icon={TrendingUp}
            color={PALETTE.green}
            bg="#F0FDF4"
            highlight
          />
          <StatCard
            label="Average Budget"
            value={revenueData.hasBudgetData ? fmtCurrency(revenueData.avgBudget) : '—'}
            sub="Per qualifying lead"
            icon={DollarSign}
            color={PALETTE.blue}
            bg="#EFF6FF"
          />
          <StatCard
            label="Qualifying Leads"
            value={revenueData.qualifyingLeadCount}
            sub="Qualified + Booked + Proposal"
            icon={PhoneCall}
            color={PALETTE.violet}
            bg="#F5F3FF"
          />
        </div>
        {!revenueData.hasBudgetData && (
          <div className="mt-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 text-[12px] text-[#92400E]">
            Budget information will appear here once leads share their budget with the AI assistant.
          </div>
        )}
      </section>

      {/* ── Section 11: AI Generated Insights ────────────────────────────── */}
      <section>
        <SectionHeader icon={Brain} title="AI Business Insights" subtitle="Real-time analysis powered by your CRM data" />

        {/* Trigger panel */}
        {!aiInsights && !aiLoading && (
          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F0F9FF] border border-[#BFDBFE] rounded-xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center">
              <Brain size={24} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#0F172A]">Generate AI Insights</p>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-md">
                Analyze your live CRM data to get business recommendations, opportunities, and actions.
              </p>
            </div>

            {aiError === 'no_provider' ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3 flex items-center gap-2 text-[13px] text-[#64748B]">
                <AlertTriangle size={14} className="text-[#D97706] shrink-0" />
                Configure an AI provider in Settings to enable Analytics Insights.
              </div>
            ) : aiError === 'failed' ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-[12px] text-[#E11D48]">Failed to generate insights. Please try again.</p>
                <button
                  onClick={fetchAIInsights}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            ) : (
              <button
                onClick={fetchAIInsights}
                className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm shadow-[#2563EB]/20"
              >
                <Brain size={14} />
                Generate Insights
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {aiLoading && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 flex flex-col items-center gap-4">
            <Loader2 size={28} className="text-[#2563EB] animate-spin" />
            <p className="text-[13px] text-[#64748B]">Analyzing your CRM data…</p>
          </div>
        )}

        {/* Insights */}
        {aiInsights && !aiLoading && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InsightPanel
                title="Key Insights"
                items={aiInsights.keyInsights}
                color={PALETTE.blue}
                icon={BarChart2}
              />
              <InsightPanel
                title="Opportunities"
                items={aiInsights.opportunities}
                color={PALETTE.green}
                icon={TrendingUp}
              />
              <InsightPanel
                title="Recommended Actions"
                items={aiInsights.recommendedActions}
                color={PALETTE.violet}
                icon={Zap}
              />
              <InsightPanel
                title="Attention Required"
                items={aiInsights.attentionRequired}
                color={PALETTE.rose}
                icon={AlertTriangle}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={fetchAIInsights}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg transition-colors"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
