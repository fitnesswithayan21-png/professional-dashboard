'use client';

import { useState, useMemo } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { ScoreBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  Brain,
  Briefcase,
  DollarSign,
  Target,
  Zap,
  X,
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

const MEMORY_META: Record<TargetMemoryType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  business_type: { label: 'Business Type', icon: Briefcase,   color: 'text-blue-600',   bg: 'bg-blue-50'   },
  budget:        { label: 'Budget',         icon: DollarSign,  color: 'text-emerald-600',bg: 'bg-emerald-50'},
  intent:        { label: 'Intent',         icon: Target,      color: 'text-violet-600', bg: 'bg-violet-50' },
  urgency:       { label: 'Urgency',        icon: Zap,         color: 'text-amber-600',  bg: 'bg-amber-50'  },
};

function getLatestValue(
  rows: { memoryValue: string; lastUpdated: string }[]
): string {
  if (!rows.length) return '';
  return rows
    .slice()
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]
    .memoryValue;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AIMemoryPage() {
  const { memories, leads } = useCRMStore();
  const [search, setSearch] = useState('');

  // Build leads map for O(1) lookup
  const leadsMap = useMemo(() => {
    const map: Record<string, typeof leads[0]> = {};
    leads.forEach(l => { map[l.id] = l; });
    return map;
  }, [leads]);

  // Group memories by leadId, then pick the latest value per target type
  const summaries: LeadMemorySummary[] = useMemo(() => {
    // Group all raw memory rows by leadId
    const byLead: Record<string, typeof memories> = {};
    memories.forEach(m => {
      if (!m.leadId) return;
      if (!byLead[m.leadId]) byLead[m.leadId] = [];
      byLead[m.leadId].push(m);
    });

    return Object.entries(byLead).map(([leadId, rows]) => {
      const lead = leadsMap[leadId];
      const leadName = lead?.fullName || leadId;
      const leadScore = lead?.leadScore ?? 0;
      const businessTypeFromLead = lead?.businessType || '';
      const sourceFromLead = lead?.source || '';

      // For each target type, find all rows of that type, pick latest value
      const resolvedMemories: Partial<Record<TargetMemoryType, string>> = {};
      TARGET_MEMORY_TYPES.forEach(type => {
        const matching = rows.filter(r => {
          const t = (r.memoryType || '').toLowerCase().trim();
          return t === type;
        });
        if (matching.length > 0) {
          resolvedMemories[type] = getLatestValue(matching);
        }
      });

      // Latest timestamp across all rows
      const lastUpdated = rows
        .map(r => r.lastUpdated || '')
        .filter(Boolean)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || '';

      return {
        leadId,
        leadName,
        leadScore,
        businessTypeFromLead,
        sourceFromLead,
        memories: resolvedMemories,
        lastUpdated,
      };
    })
    // Sort by lead score descending
    .sort((a, b) => b.leadScore - a.leadScore);
  }, [memories, leadsMap]);

  // Apply search filter
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
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative z-10">
        {/* Search */}
        <div className="flex items-center w-full md:w-[360px] h-[42px] bg-white border border-slate-200/60 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all overflow-hidden px-3.5">
          <Search className="h-[18px] w-[18px] text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search by lead name, business type, intent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-full bg-transparent border-none text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 p-0"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Summary pill */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium bg-white border border-slate-200/60 rounded-[12px] px-4 py-2 shadow-sm">
          <Brain className="h-4 w-4 text-[#2563EB]" />
          <span><strong className="text-slate-900">{filtered.length}</strong> lead{filtered.length !== 1 ? 's' : ''} with AI memory</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-[15px] font-bold text-slate-900">No memory records found</p>
            <p className="text-[13px] text-slate-500 mt-1 max-w-xs">
              {search ? 'Try adjusting your search.' : 'AI memory records will appear here once leads interact.'}
            </p>
          </div>
        ) : (
          filtered.map(summary => {
            const { leadId, leadName, leadScore, businessTypeFromLead, sourceFromLead, memories: mems } = summary;

            // Display business type: prefer AI memory value, fallback to lead record
            const displayBizType = mems.business_type || businessTypeFromLead;

            return (
              <Card
                key={leadId}
                padding="none"
                className="flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.09)] transition-all duration-300 hover:-translate-y-0.5 group"
              >
                {/* ── Card Header ── */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <Avatar name={leadName} className="h-12 w-12 shadow-sm font-bold shrink-0 text-[14px]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <Link
                        href={`/dashboard/leads?id=${leadId}`}
                        className="text-[16.5px] font-bold text-slate-900 tracking-tight leading-tight hover:text-[#2563EB] transition-colors truncate"
                      >
                        {leadName}
                      </Link>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2 py-0.5 rounded-[6px] shadow-sm shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                        <ScoreBadge score={leadScore} className="text-[12.5px]" />
                      </div>
                    </div>
                    <p className="text-[12.5px] text-slate-500 font-medium truncate">
                      {displayBizType || sourceFromLead || 'No industry specified'}
                    </p>
                  </div>
                </div>

                {/* ── Memory Fields ── */}
                <div className="px-6 py-5 space-y-3 flex-1">
                  {TARGET_MEMORY_TYPES.map(type => {
                    const meta  = MEMORY_META[type];
                    const value = type === 'business_type' ? displayBizType : mems[type];
                    const Icon  = meta.icon;
                    const isEmpty = !value;

                    return (
                      <div
                        key={type}
                        className="flex items-center gap-3.5 p-3 rounded-[12px] bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        {/* Icon */}
                        <div className={cn('flex items-center justify-center h-8 w-8 rounded-[8px] shrink-0', meta.bg)}>
                          <Icon className={cn('h-4 w-4', meta.color)} />
                        </div>

                        {/* Label + Value */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                            {meta.label}
                          </p>
                          <p className={cn(
                            'text-[13.5px] font-semibold leading-snug truncate',
                            isEmpty ? 'text-slate-300 italic' : 'text-slate-800'
                          )}>
                            {isEmpty ? 'Not Available' : value}
                          </p>
                        </div>

                        {/* Value badge for urgency */}
                        {type === 'urgency' && value && (
                          <span className={cn(
                            'text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0',
                            value.toLowerCase() === 'high' || value.toLowerCase() === 'urgent'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : value.toLowerCase() === 'medium'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          )}>
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Card Footer ── */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <span className="text-[11.5px] text-slate-400 font-medium">
                    ID: <span className="font-mono text-slate-500">{leadId}</span>
                  </span>
                  <Link
                    href={`/dashboard/conversations?leadId=${leadId}`}
                    className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors"
                  >
                    View Conversations →
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
