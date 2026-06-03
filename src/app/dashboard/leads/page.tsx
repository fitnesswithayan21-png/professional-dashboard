'use client';

import { useState, useMemo } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SlideOver } from '@/components/ui/slide-over';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { 
  Search, ArrowUpDown, List, LayoutGrid, Plus, Brain,
  ChevronDown, MessageSquare, Calendar, ChevronRight,
  Activity, AlertCircle, CheckCircle2, Phone, Mail,
  Clock, Video, Target, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 12;
const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Google Ads', 'Direct'];

export default function LeadsPage() {
  const { leads, appointments, followUps, conversations, memories } = useCRMStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortField, setSortField] = useState('leadScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<'table' | 'grid'>('table');
  
  // Slide Over state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => 
        l.fullName.toLowerCase().includes(s) || 
        l.email.toLowerCase().includes(s) || 
        l.businessType?.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(l => l.status === statusFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter(l => l.source === sourceFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc' 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [leads, search, statusFilter, sourceFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const newLeads = leads.filter(l => l.status === 'new').length;

  // Joined Data Lookups
  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const leadConversations = conversations.filter(c => c.leadId === selectedLeadId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const leadMemories = memories.filter(m => m.leadId === selectedLeadId);
  const leadFollowUps = followUps.filter(f => f.leadId === selectedLeadId);
  const leadAppointments = appointments.filter(a => a.leadId === selectedLeadId);

  // Formatting helpers
  const formatScore = (score: number) => (score / 10).toFixed(1);

  const getQualLevel = (score: number) => {
    const s = score / 10;
    if (s >= 9.0) return 'High';
    if (s >= 7.0) return 'Medium';
    return 'Low';
  };

  const getDerivedIntent = (lead: any, mems: any[]) => {
    if (lead.intent) return lead.intent;
    const intentMem = mems.find(m => m.memoryType === 'intent');
    if (intentMem) return intentMem.memoryValue;
    return 'Not Available';
  };

  const getDerivedPriority = (lead: any, mems: any[]) => {
    if (lead.urgency) return lead.urgency;
    const urgencyMem = mems.find(m => m.memoryType === 'timeline');
    if (urgencyMem) return urgencyMem.memoryValue;
    return 'Not Available';
  };

  const renderScoreBar = (score: number) => {
    let barColor = 'bg-rose-500';
    if (score >= 90) barColor = 'bg-emerald-500';
    else if (score >= 70) barColor = 'bg-amber-500';

    return (
      <div className="flex items-center gap-3 w-full max-w-[130px] select-none">
        <div className="h-1.5 w-[64px] bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div className={cn("h-full rounded-full transition-all duration-300", barColor)} style={{ width: `${score}%` }} />
        </div>
        <span className={cn(
          "font-mono text-[13px] font-bold tabular-nums shrink-0",
          score >= 90 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-rose-600"
        )}>
          {formatScore(score)} / 10
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <p className="text-[13px] text-slate-500 leading-none">Manage, qualify, and track your active sales pipeline leads.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[640px]">
        {/* Total Leads Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">TOTAL LEADS</span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {totalLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Live database rows</div>
        </div>

        {/* Qualified Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">QUALIFIED</span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {qualifiedLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Status: Qualified</div>
        </div>

        {/* New Today Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">NEW LEADS</span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {newLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Status: New</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 w-full">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 min-w-[240px] max-w-full lg:max-w-[320px]">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '48px', paddingRight: '16px' }}
              className="w-full h-11 rounded-[10px] bg-white border border-[#E2E8F0] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="relative min-w-[150px] w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none w-full h-11 px-4 text-center rounded-[10px] bg-white border border-[#E2E8F0] text-[13px] font-medium text-slate-700 hover:bg-slate-50/50 hover:border-slate-300 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">Status: All</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[150px] w-full sm:w-auto">
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="appearance-none w-full h-11 px-4 text-center rounded-[10px] bg-white border border-[#E2E8F0] text-[13px] font-medium text-slate-700 hover:bg-slate-50/50 hover:border-slate-300 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">Source: All</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-1 h-11">
            <button
              onClick={() => setActiveView('table')}
              className={cn("h-9 px-4 rounded-md text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-[12.5px] font-medium", activeView === 'table' && "bg-white text-slate-900 shadow-sm border border-[#E2E8F0]")}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveView('grid')}
              className={cn("h-9 px-4 rounded-md text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-[12.5px] font-medium", activeView === 'grid' && "bg-white text-slate-900 shadow-sm border border-[#E2E8F0]")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button className="h-11 min-w-[140px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[13px] gap-2 flex items-center justify-center transition-all cursor-pointer shrink-0">
          <Plus className="h-4 w-4 shrink-0" />
          Add Lead
        </button>
      </div>

      {/* Main Content */}
      {activeView === 'table' ? (
        <Card padding="none" className="overflow-hidden bg-white border border-slate-200">
          <div className="overflow-x-auto px-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 h-[52px]">
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none" onClick={() => toggleSort('fullName')}>
                    <div className="flex items-center gap-1">Lead Details <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company & Source</th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none" onClick={() => toggleSort('leadScore')}>
                    <div className="flex items-center gap-1">Lead Score <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Added Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-[13px] text-slate-500">No data available.</td></tr>
                ) : (
                  paginated.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      <tr 
                        key={lead.id} 
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={cn("h-[60px] cursor-pointer transition-colors", isSelected ? "bg-blue-50/30 hover:bg-blue-50/40" : "hover:bg-slate-50/60")}
                      >
                        <td className="px-[20px] py-2">
                          <div className="flex items-center gap-3">
                            <Avatar name={lead.fullName || 'NA'} size="sm" className="h-8 w-8 text-[11px]" />
                            <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-slate-900 leading-tight">{lead.fullName || 'Not Available'}</span>
                              <span className="text-[11px] text-slate-400 font-normal mt-0.5">{lead.email || 'Not Available'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-[20px] py-2">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-slate-700 leading-tight">{lead.businessType || 'Not Available'}</span>
                            <span className="text-[11px] text-slate-400 capitalize font-normal mt-0.5">{lead.source || 'Not Available'}</span>
                          </div>
                        </td>
                        <td className="px-[20px] py-2">{renderScoreBar(lead.leadScore || 0)}</td>
                        <td className="px-[20px] py-2"><Badge status={lead.status} /></td>
                        <td className="px-[20px] py-2 text-[13px] text-slate-400">{lead.createdDate ? formatDate(lead.createdDate) : 'Not Available'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-5 h-12 border-t border-slate-200 bg-slate-50/50">
            <span className="text-[12px] text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8">Prev</Button>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8">Next</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
          {paginated.map(lead => (
            <div 
              key={lead.id} 
              onClick={() => setSelectedLeadId(lead.id)}
              className="group relative flex flex-col bg-white rounded-[16px] border border-slate-200 cursor-pointer hover:shadow-md transition-all h-[200px]"
            >
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-4">
                  <Avatar name={lead.fullName} className="h-12 w-12 text-[15px] font-bold" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-slate-900 truncate">{lead.fullName}</h3>
                    <p className="text-[12px] text-slate-500 truncate">{lead.businessType || 'Not Available'}</p>
                    <div className="mt-2 flex gap-2">
                       <Badge status={lead.status} className="px-2 py-0 text-[10px]" />
                       <span className="bg-slate-100 text-slate-700 px-2 rounded-full text-[10px] font-bold flex items-center">
                         {formatScore(lead.leadScore || 0)} / 10
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Over Details Panel */}
      <SlideOver
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        width="max-w-[460px]"
        showHeader={false}
      >
        {selectedLead && (
          <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-800 font-sans">
            {/* Header / Dismiss */}
            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10">
              <span className="text-[14px] font-semibold text-slate-800">Live Lead Profile</span>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
              
              {/* SECTION: PROFILE HEADER */}
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
                <Avatar name={selectedLead.fullName || 'NA'} size="lg" className="h-20 w-20 text-[28px] font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md mb-4" />
                <h3 className="text-[18px] font-semibold text-slate-900 tracking-tight">{selectedLead.fullName || 'Not Available'}</h3>
                <p className="text-[14px] text-slate-500 mb-4">{selectedLead.email || 'Not Available'}</p>
                <div className="flex items-center gap-2">
                  <Badge status={selectedLead.status} className="px-3 py-1 text-[12px] uppercase tracking-wider font-bold" />
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">
                    Score {formatScore(selectedLead.leadScore || 0)} / 10
                  </span>
                </div>
              </div>

              {/* QUICK LINKS */}
              <div className="flex gap-3">
                <Link href={`/dashboard/conversations?leadId=${selectedLead.id}`} className="flex-1">
                  <div className="flex flex-col items-center justify-center py-4 bg-white border border-slate-200/60 rounded-[14px] hover:border-blue-300 hover:shadow-sm transition-all group">
                    <MessageSquare className="h-5 w-5 text-blue-600 mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[12px] font-semibold text-slate-700">Conversations</span>
                  </div>
                </Link>
                <Link href={`/dashboard/ai-memory?leadId=${selectedLead.id}`} className="flex-1">
                  <div className="flex flex-col items-center justify-center py-4 bg-white border border-slate-200/60 rounded-[14px] hover:border-purple-300 hover:shadow-sm transition-all group">
                    <Brain className="h-5 w-5 text-purple-600 mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[12px] font-semibold text-slate-700">AI Memory</span>
                  </div>
                </Link>
              </div>

              {/* SECTION: CONTACT INFORMATION */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Contact Information</h4>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Phone</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedLead.phone || 'Not Available'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Email</span>
                    <span className="text-[13px] font-medium text-slate-900 truncate max-w-[200px]">{selectedLead.email || 'Not Available'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Timezone</span>
                    <span className="text-[13px] font-medium text-slate-900">Not Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Pref. Contact</span>
                    <span className="text-[13px] font-medium text-slate-900 capitalize">Not Available</span>
                  </div>
                </div>
              </div>

              {/* SECTION: LEAD SNAPSHOT */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Lead Snapshot</h4>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedLead.businessType || 'Not Available'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Source</span>
                    <span className="text-[13px] font-medium text-slate-900 capitalize">{selectedLead.source || 'Not Available'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                    <Badge status={selectedLead.status} className="px-2 py-0.5 text-[10px]" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Created Date</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedLead.createdDate ? formatDate(selectedLead.createdDate) : 'Not Available'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Activity</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedLead.lastContactTime ? formatDateTime(selectedLead.lastContactTime) : 'Not Available'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: LEAD INTELLIGENCE */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Lead Intelligence</h4>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Qualification</span>
                    <span className="text-[13px] font-bold text-slate-900">{getQualLevel(selectedLead.leadScore || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Intent</span>
                    <span className="text-[13px] font-bold text-slate-900 capitalize">{getDerivedIntent(selectedLead, leadMemories)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Priority</span>
                    <span className="text-[13px] font-bold text-slate-900 capitalize">{getDerivedPriority(selectedLead, leadMemories)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Health Score</span>
                    <span className={cn("text-[13px] font-bold", (selectedLead.leadScore||0) >= 70 ? "text-emerald-600" : "text-rose-600")}>
                      {formatScore(selectedLead.leadScore || 0)} / 10
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: FOLLOW-UP INFORMATION */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Follow-Up Information</h4>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {leadFollowUps.length === 0 ? (
                    <span className="text-[13px] text-slate-500">Not Available</span>
                  ) : (
                    leadFollowUps.map(fu => (
                      <div key={fu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] font-bold text-slate-700">Follow-Up #{fu.followUpNumber}</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 uppercase">{fu.status}</span>
                        </div>
                        <div className="flex justify-between text-[12px] text-slate-500">
                          <span>Scheduled: {formatDate(fu.scheduledTime)}</span>
                          <span>{fu.responseReceived ? 'Responded' : 'No Response'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION: APPOINTMENTS */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Appointment Information</h4>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {leadAppointments.length === 0 ? (
                    <span className="text-[13px] text-slate-500">Not Available</span>
                  ) : (
                    leadAppointments.map(app => {
                      const showJoin = app.status === 'scheduled' || app.status === 'confirmed';
                      return (
                        <div key={app.id} className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100/50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="block text-[13px] font-bold text-slate-900">{formatDate(app.appointmentDate)}</span>
                              <span className="text-[12px] text-slate-500">{app.appointmentTime}</span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 uppercase capitalize">{app.status}</span>
                          </div>
                          {showJoin ? (
                             <a href={app.meetingLink || '#'} target="_blank" rel="noreferrer" className="mt-2 w-full flex items-center justify-center gap-2 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold rounded-md transition-colors">
                               <Video className="w-4 h-4" /> Join Meeting
                             </a>
                          ) : (
                             <span className="mt-2 block w-full text-center py-2 bg-slate-100 text-slate-500 text-[12px] font-bold rounded-md uppercase">{app.status}</span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* SECTION: ENGAGEMENT */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-500" />
                  <h4 className="text-[13px] font-bold text-slate-900">Engagement Information</h4>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Total Messages</span>
                    <span className="text-[13px] font-bold text-slate-900">{leadConversations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Last Reply</span>
                    <span className="text-[13px] font-medium text-slate-900">
                      {leadConversations.find(c => c.messageType === 'inbound') 
                        ? formatDateTime(leadConversations.find(c => c.messageType === 'inbound')!.timestamp) 
                        : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Waiting For User</span>
                    <span className="text-[13px] font-medium text-slate-900">
                      {leadConversations.length > 0 && leadConversations[0].messageType === 'outbound' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-500">Last Contact</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedLead.lastContactTime ? formatDateTime(selectedLead.lastContactTime) : 'Not Available'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
