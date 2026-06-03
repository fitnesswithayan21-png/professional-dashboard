'use client';

import { useState, useMemo } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Search,
  Brain,
  X,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

const TARGET_MEMORY_TYPES = ['business_type', 'budget', 'intent', 'urgency'] as const;
type TargetMemoryType = typeof TARGET_MEMORY_TYPES[number];

interface LeadMemorySummary {
  leadId: string;
  leadName: string;
  leadScore: number;
  businessTypeFromLead: string;
  sourceFromLead: string;
  memories: Partial<Record<TargetMemoryType, string>>;
  lastUpdated: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLatestValue(rows: { memoryValue: string; lastUpdated: string }[]): string {
  if (!rows.length) return '';
  return rows
    .slice()
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]
    .memoryValue;
}

/** Convert snake_case or raw strings into Title Case */
function humanize(value: string): string {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Score → gradient color class */
function scoreColor(score: number): string {
  if (score >= 8) return 'from-emerald-500 to-teal-500';
  if (score >= 5) return 'from-amber-400 to-orange-400';
  return 'from-rose-400 to-red-400';
}

/** Urgency color config */
function urgencyConfig(value: string): { bg: string; text: string; dot: string } {
  const v = value.toLowerCase();
  if (v === 'urgent' || v === 'high')
    return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
  if (v === 'medium')
    return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' };
  return { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AIMemoryPage() {
  const { memories, leads } = useCRMStore();
  const [search, setSearch] = useState('');

  const leadsMap = useMemo(() => {
    const map: Record<string, typeof leads[0]> = {};
    leads.forEach(l => { map[l.id] = l; });
    return map;
  }, [leads]);

  const summaries: LeadMemorySummary[] = useMemo(() => {
    const byLead: Record<string, typeof memories> = {};
    memories.forEach(m => {
      if (!m.leadId) return;
      if (!byLead[m.leadId]) byLead[m.leadId] = [];
      byLead[m.leadId].push(m);
    });

    return Object.entries(byLead).map(([leadId, rows]) => {
      const lead = leadsMap[leadId];
      const resolvedMemories: Partial<Record<TargetMemoryType, string>> = {};
      TARGET_MEMORY_TYPES.forEach(type => {
        const matching = rows.filter(r => (r.memoryType || '').toLowerCase().trim() === type);
        if (matching.length > 0) resolvedMemories[type] = getLatestValue(matching);
      });

      const lastUpdated = rows
        .map(r => r.lastUpdated || '')
        .filter(Boolean)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || '';

      return {
        leadId,
        leadName: lead?.fullName || leadId,
        leadScore: lead?.leadScore ?? 0,
        businessTypeFromLead: lead?.businessType || '',
        sourceFromLead: lead?.source || '',
        memories: resolvedMemories,
        lastUpdated,
      };
    }).sort((a, b) => b.leadScore - a.leadScore);
  }, [memories, leadsMap]);

  const filtered = useMemo(() => {
    if (!search.trim()) return summaries;
    const q = search.toLowerCase();
    return summaries.filter(s =>
      s.leadName.toLowerCase().includes(q) ||
      s.leadId.toLowerCase().includes(q) ||
      (s.businessTypeFromLead || '').toLowerCase().includes(q) ||
      (s.memories.intent || '').toLowerCase().includes(q) ||
      (s.memories.business_type || '').toLowerCase().includes(q)
    );
  }, [summaries, search]);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex items-center w-full sm:w-[380px] h-[42px] bg-white border border-slate-200/70 rounded-[13px] shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all px-4 gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search lead, business type, intent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-full bg-transparent text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Pill */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/70 rounded-[12px] px-4 py-2 shadow-sm text-[13px] text-slate-500">
          <Brain className="h-4 w-4 text-blue-500" />
          <span><strong className="text-slate-800 font-semibold">{filtered.length}</strong> lead{filtered.length !== 1 ? 's' : ''} with AI memory</span>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-5">
              <Brain className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-[15px] font-bold text-slate-900">No memory records found</p>
            <p className="text-[13px] text-slate-500 mt-1.5 max-w-xs">
              {search ? 'Try a different search term.' : 'AI memory records will appear once leads engage.'}
            </p>
          </div>
        ) : (
          filtered.map(summary => {
            const { leadId, leadName, leadScore, businessTypeFromLead, memories: mems } = summary;
            const displayBizType = mems.business_type || businessTypeFromLead || '—';
            const budget   = mems.budget   || null;
            const intent   = mems.intent   || null;
            const urgency  = mems.urgency  || null;
            const urg      = urgency ? urgencyConfig(urgency) : null;
            const gradient = scoreColor(leadScore);

            return (
              <div
                key={leadId}
                className="group relative flex flex-col bg-white rounded-[22px] border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Top accent strip */}
                <div className={cn('h-[3px] w-full bg-gradient-to-r', gradient)} />

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center gap-4 px-6 pt-5 pb-4">
                  <Avatar name={leadName} className="h-12 w-12 text-[14px] font-bold shadow-md shrink-0" />

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/leads?id=${leadId}`}
                      className="block text-[16.5px] font-bold text-slate-900 tracking-tight leading-tight truncate hover:text-blue-600 transition-colors"
                    >
                      {leadName}
                    </Link>
                    <p className="text-[12.5px] text-slate-500 font-medium mt-0.5 truncate">
                      {displayBizType}
                    </p>
                  </div>

                  {/* Score badge */}
                  <div className={cn(
                    'flex flex-col items-center justify-center h-12 w-12 rounded-[12px] bg-gradient-to-br shrink-0 shadow-sm',
                    gradient
                  )}>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-none">Score</span>
                    <span className="text-[18px] font-black text-white leading-none mt-0.5">{leadScore}</span>
                  </div>
                </div>

                {/* ── Divider ─────────────────────────────────────────────── */}
                <div className="mx-6 h-px bg-slate-100" />

                {/* ── 2-Column Memory Grid ────────────────────────────────── */}
                <div className="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4 flex-1">

                  {/* Business Type */}
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Business Type</p>
                    <p className="text-[14px] font-semibold text-slate-800 leading-snug truncate">{displayBizType}</p>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Budget</p>
                    {budget ? (
                      <p className="text-[14px] font-bold text-emerald-600 leading-snug">{budget}</p>
                    ) : (
                      <p className="text-[13px] text-slate-300 italic">Not Available</p>
                    )}
                  </div>

                  {/* Intent */}
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Intent</p>
                    {intent ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-blue-50 border border-blue-100 text-blue-700 text-[12px] font-semibold leading-none">
                        {humanize(intent)}
                      </span>
                    ) : (
                      <p className="text-[13px] text-slate-300 italic">Not Available</p>
                    )}
                  </div>

                  {/* Urgency */}
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Urgency</p>
                    {urgency && urg ? (
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-[12px] font-semibold leading-none',
                        urg.bg, urg.text,
                        urg.bg === 'bg-rose-50' ? 'border-rose-100' :
                        urg.bg === 'bg-amber-50' ? 'border-amber-100' : 'border-slate-200'
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', urg.dot)} />
                        {humanize(urgency)}
                      </span>
                    ) : (
                      <p className="text-[13px] text-slate-300 italic">Not Available</p>
                    )}
                  </div>
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="mx-6 h-px bg-slate-100" />
                <div className="flex items-center justify-end px-6 py-4">
                  <Link
                    href={`/dashboard/conversations?leadId=${leadId}`}
                    className="flex items-center gap-1.5 text-[13.5px] font-bold text-blue-600 hover:text-blue-700 transition-colors group/link"
                  >
                    View Conversation
                    <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
