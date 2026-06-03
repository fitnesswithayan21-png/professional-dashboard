'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import { 
  Search, 
  Bot, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Brain,
  Zap,
  Calendar,
  Sparkles,
  Activity,
  AlertCircle,
  Paperclip,
  Wand2,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageSquareDashed,
  Video,
  FileText,
  Image as ImageIcon,
  Mic,
  Check,
  CheckCheck,
  StickyNote,
  Smartphone,
  Smile
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Mock timeline events for demonstration
const mockTimelineEvents = [
  { id: '1', type: 'appointment', text: 'Appointment Scheduled', time: '10:30 AM' },
  { id: '2', type: 'qualified', text: 'Lead Qualified', time: '11:15 AM' }
];

export default function ConversationsPage() {
  const { conversations, leads, memories, settings } = useCRMStore();
  const [aiInsights, setAiInsights] = useState<{ signal: string, opportunity: string, actionTitle: string, actionDesc: string } | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsCache, setInsightsCache] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get('leadId');
      if (leadId) {
        setSelectedLeadId(leadId);
      }
    }
  }, []);
  const [takeoverActive, setTakeoverActive] = useState(false);
  const [inputText, setInputText] = useState('');

  const grouped = useMemo(() => {
    const groups: Record<string, typeof conversations> = {};
    conversations.forEach(conv => {
      if (!groups[conv.leadId]) groups[conv.leadId] = [];
      groups[conv.leadId].push(conv);
    });
    return groups;
  }, [conversations]);

  const leadIds = Object.keys(grouped);
  const leadsMap = useMemo(() => {
    const map: Record<string, typeof leads[0]> = {};
    leads.forEach(l => { map[l.id] = l; });
    return map;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leadIds.filter(id => {
      const convs = grouped[id];
      const lead = leadsMap[id];
      const name = lead?.fullName || '';
      return name.toLowerCase().includes(search.toLowerCase()) || 
             lead?.email.toLowerCase().includes(search.toLowerCase()) ||
             lead?.businessType?.toLowerCase().includes(search.toLowerCase());
    });
  }, [leadIds, grouped, leadsMap, search]);

  const activeLeadId = selectedLeadId || filteredLeads[0] || '';
  const activeConversations = activeLeadId ? grouped[activeLeadId] || [] : [];
  const activeLead = leadsMap[activeLeadId];
  const activeName = activeLead?.fullName || '';

  useEffect(() => {
    if (!activeLeadId || !activeLead) return;
    
    if (insightsCache[activeLeadId]) {
      setAiInsights(insightsCache[activeLeadId]);
      return;
    }

    const fetchInsights = async () => {
      setIsGeneratingInsights(true);
      try {
        const leadConvs = (grouped[activeLeadId] || []).map(c => `${c.sender}: ${c.message}`).join('\n');
        const leadMems = memories.filter(m => m.leadId === activeLeadId).map(m => `${m.memoryType}: ${m.memoryValue}`).join('\n');
        
        const prompt = `Analyze this lead and return a JSON object with exactly 4 keys: "signal", "opportunity", "actionTitle", and "actionDesc".
Each value must be 1-2 concise sentences based on actual data. No hallucinations.
If insufficient data, fallback to "No significant signal detected yet.", "No clear opportunity identified yet.", "Continue Nurturing", and "Continue collecting engagement data."

Lead:
Name: ${activeLead.fullName}
Type: ${activeLead.businessType}
Status: ${activeLead.status}
Score: ${activeLead.leadScore}/10
Intent: ${activeLead.intent}
Urgency: ${activeLead.urgency}

Conversations:
${leadConvs || 'None'}

Memories:
${leadMems || 'None'}`;

        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt, 
            provider: 'grok',
            apiKey: settings?.apiKeys?.grok || ''
          })
        });
        
        const data = await res.json();
        
        let parsed;
        try {
            const jsonStr = data.response.match(/\{[\s\S]*\}/)?.[0] || data.response;
            parsed = JSON.parse(jsonStr);
        } catch(e) {
            parsed = {};
        }
        
        const finalInsights = {
            signal: parsed.signal || "No significant signal detected yet.",
            opportunity: parsed.opportunity || "No clear opportunity identified yet.",
            actionTitle: parsed.actionTitle || "Continue Nurturing",
            actionDesc: parsed.actionDesc || "Continue collecting engagement data."
        };

        setInsightsCache(prev => ({ ...prev, [activeLeadId]: finalInsights }));
        setAiInsights(finalInsights);
      } catch (err) {
        console.error(err);
        const fallback = {
          signal: "No significant signal detected yet.",
          opportunity: "No clear opportunity identified yet.",
          actionTitle: "Continue Nurturing",
          actionDesc: "Continue collecting engagement data."
        };
        setInsightsCache(prev => ({ ...prev, [activeLeadId]: fallback }));
        setAiInsights(fallback);
      } finally {
        setIsGeneratingInsights(false);
      }
    };
    
    if (settings?.apiKeys?.grok) {
        fetchInsights();
    } else {
        const fallback = {
          signal: "Grok API Key not configured.",
          opportunity: "Configure API key in settings to enable AI insights.",
          actionTitle: "Configure API",
          actionDesc: "Go to Settings -> Credentials to connect Grok API."
        };
        setAiInsights(fallback);
    }
  }, [activeLeadId, activeLead, grouped, memories, settings?.apiKeys?.grok]);

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'phone': return <Phone className="h-3.5 w-3.5" />;
      case 'email': return <Mail className="h-3.5 w-3.5" />;
      default: return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  // Helper for Lead Intelligence Badges
  const renderIntelligenceBadge = (type: string, value: string) => {
    let tint = 'bg-slate-50 text-slate-700 border-slate-200';
    let dot = 'bg-slate-400';
    
    if (value.toLowerCase().includes('high') || value.toLowerCase().includes('strong')) {
      tint = 'bg-emerald-50 text-emerald-700 border-emerald-100';
      dot = 'bg-emerald-500';
    } else if (value.toLowerCase().includes('medium') || value.toLowerCase().includes('moderate')) {
      tint = 'bg-amber-50 text-amber-700 border-amber-100';
      dot = 'bg-amber-500';
    } else if (value.toLowerCase().includes('low') || value.toLowerCase().includes('weak')) {
      tint = 'bg-rose-50 text-rose-700 border-rose-100';
      dot = 'bg-rose-500';
    }

    return (
      <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <span className="text-[12px] font-medium text-slate-500">{type}</span>
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold leading-none", tint)}>
          <div className={cn("w-1.5 h-1.5 rounded-full", dot)} />
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-[#F8FAFC] overflow-hidden">
      
      {/* LEFT COLUMN — Light Dashboard Style */}
      <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#FDFDFE', borderRight: '1px solid rgba(0,0,0,0.06)' }}>

        {/* Search Bar */}
        <div style={{ padding: '8px 12px 10px', backgroundColor: '#FDFDFE', flexShrink: 0, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 12px', height: '36px', gap: '10px' }}>
            <Search style={{ height: '16px', width: '16px', color: '#64748b', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', caretColor: '#3b82f6' }}
            />
          </div>
        </div>

        {/* Lead List */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          {filteredLeads.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <MessageSquare style={{ height: '32px', width: '32px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px', fontWeight: 500 }}>No conversations found</p>
            </div>
          ) : (
            filteredLeads.map((leadId, idx) => {
              const convs = grouped[leadId];
              const lead = leadsMap[leadId];
              const name = lead?.fullName || '';
              const lastMsg = convs[convs.length - 1];
              const isActive = activeLeadId === leadId;
              const msgTime = (() => {
                try {
                  const d = new Date(lastMsg?.timestamp);
                  if (isNaN(d.getTime())) return '';
                  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                } catch { return ''; }
              })();
              const preview = lastMsg?.message || '';

              return (
                <button
                  key={leadId}
                  onClick={() => setSelectedLeadId(leadId)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                    gap: '12px', padding: '10px 16px',
                    backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  {/* Avatar */}
                  <Avatar name={name} size="md" className="shrink-0 h-[48px] w-[48px] text-[16px] font-bold" />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Row 1: Name + Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {name}
                      </span>
                      <span style={{ fontSize: '12px', color: isActive ? '#3b82f6' : '#64748b', flexShrink: 0, marginLeft: '8px' }}>
                        {msgTime}
                      </span>
                    </div>
                    {/* Row 2: Ticks + Last message */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCheck style={{ height: '15px', width: '15px', color: '#3b82f6', flexShrink: 0 }} />
                      <p style={{ fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, flex: 1 }}>
                        {preview}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>


      {/* MIDDLE COLUMN: Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Header */}
        <div className="h-[64px] shrink-0 px-4 flex items-center z-10" style={{ backgroundColor: '#FDFDFE', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3.5 cursor-pointer">
            <Avatar name={activeName} size="md" className="h-10 w-10 text-[14px] font-bold shadow-sm" />
            <div className="flex flex-col justify-center">
              <h2 className="text-[16px] font-medium text-[#0f172a] leading-tight">{activeName}</h2>
              <span className="text-[12px] font-semibold text-slate-500 leading-tight">Score <span className="text-amber-500">{activeLead?.leadScore || '--'}</span></span>
            </div>
          </div>
        </div>


        {/* Chat Feed */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          style={{
            backgroundColor: '#f8fafc',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23000000' stroke-width='0.4' stroke-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='8'/%3E%3Ccircle cx='60' cy='60' r='8'/%3E%3Ccircle cx='60' cy='20' r='4'/%3E%3Ccircle cx='20' cy='60' r='4'/%3E%3Cline x1='0' y1='40' x2='80' y2='40'/%3E%3Cline x1='40' y1='0' x2='40' y2='80'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Extra top/bottom padding; 5% horizontal mirrors WhatsApp's side margins */}
          <div style={{ padding: '20px 5% 28px 5%', display: 'flex', flexDirection: 'column' }}>
            {activeConversations.length === 0 ? (
              <div className="text-center py-20">
                <Bot className="h-8 w-8 mx-auto mb-4 text-slate-300" />
                <p className="text-[14px] font-medium text-slate-400">Ready to engage when lead responds.</p>
              </div>
            ) : (
              <>
                {/* ── Date Separator ── */}
                <div className="flex justify-center my-4">
                  <span className="bg-white border border-slate-200 text-slate-500 text-[12.5px] font-medium px-3 py-1 rounded-md shadow-sm">
                    Today
                  </span>
                </div>

                {/* ── Timeline CRM event ── */}
                <div className="flex justify-center mb-4">
                  <span className="bg-white border border-slate-200 text-slate-500 text-[12px] font-medium px-3 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    Appointment Scheduled · 10:30 AM
                  </span>
                </div>

                {activeConversations
                  .slice()
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((conv, idx, sortedArr) => {
                  // Robust time: parse the timestamp and format as h:mm AM/PM
                  const msgTime = (() => {
                    try {
                      const d = new Date(conv.timestamp);
                      if (isNaN(d.getTime())) return formatDateTime(conv.timestamp);
                      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    } catch { return '' }
                  })();
                  const isLast = idx === sortedArr.length - 1;
                  const isAI = /ai|agent|nexusai|assistant|bot/i.test(conv.sender);

                  return (
                    <div key={conv.id || idx}>
                      {!isAI ? (
                        <div className="flex justify-start" style={{ marginTop: '8px', marginBottom: '8px' }}>
                          <div style={{
                            position: 'relative',
                            maxWidth: '65%',
                            backgroundColor: '#ffffff',
                            borderRadius: '0 8px 8px 8px',
                            padding: '8px 12px 26px 12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word',
                            border: '1px solid rgba(0,0,0,0.05)',
                          }}>
                            {/* Tail — top-left corner */}
                            <svg style={{ position: 'absolute', top: '-1px', left: '-8px' }} width="9" height="14" viewBox="0 0 9 14">
                              <path d="M9 0 L0 0 L0 14 Q4 7 9 0 Z" fill="#ffffff" />
                            </svg>
                            {/* Lead name */}
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#f97316', margin: '0 0 5px 0', lineHeight: '16px' }}>
                              {activeName}
                            </p>
                            {/* Customer message text */}
                            <p style={{ fontSize: '14.3px', lineHeight: '21px', color: '#334155', margin: 0 }}>
                              {conv.message}
                            </p>
                            {/* Timestamp in bottom padding zone */}
                            <span style={{ position: 'absolute', right: '10px', bottom: '7px' }}>
                              <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1 }}>{msgTime}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', marginBottom: '8px' }}>
                          <div style={{
                            position: 'relative',
                            maxWidth: '65%',
                            backgroundColor: '#dcfce7',
                            borderRadius: '8px 0 8px 8px',
                            padding: '8px 12px 26px 12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word',
                            border: '1px solid rgba(22,163,74,0.1)',
                          }}>
                            {/* Tail top-right */}
                            <svg style={{ position: 'absolute', top: '-1px', right: '-8px' }} width="9" height="14" viewBox="0 0 9 14">
                              <path d="M0 0 L9 0 L9 14 Q5 7 0 0 Z" fill="#dcfce7" />
                            </svg>
                            {/* NexusAI name in teal */}
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#059669', margin: '0 0 5px 0', lineHeight: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              NexusAI <Sparkles style={{ height: '11px', width: '11px', color: '#059669' }} />
                            </p>
                            {/* AI message text */}
                            <p style={{ fontSize: '14.3px', lineHeight: '21px', color: '#1e293b', margin: 0 }}>
                              {conv.message}
                            </p>
                            {/* Time + blue double ticks */}
                            <span style={{ position: 'absolute', right: '10px', bottom: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1 }}>{msgTime}</span>
                              <CheckCheck style={{ height: '16px', width: '16px', color: '#3b82f6', flexShrink: 0 }} />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ── CRM event after first exchange ── */}
                      {idx === 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px 0' }}>
                          <span style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <CheckCircle2 style={{ height: '12px', width: '12px', color: '#22c55e' }} />
                            Lead Qualified · 11:15 AM
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ── Composer Bar ── */}
        <div style={{ backgroundColor: '#FDFDFE', borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          {/* Mode Toggle Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 0 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              {takeoverActive ? (
                <>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block', boxShadow: '0 0 6px rgba(5,150,105,0.4)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Manual Mode — You are replying</span>
                </>
              ) : (
                <>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block', boxShadow: '0 0 6px rgba(59,130,246,0.4)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>AI Mode — NexusAI is responding</span>
                </>
              )}
            </div>
            <button
              onClick={() => setTakeoverActive(!takeoverActive)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 12px 4px 8px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: takeoverActive ? 'rgba(5,150,105,0.1)' : 'rgba(59,130,246,0.1)', transition: 'background 0.2s' }}
            >
              <div style={{ width: '34px', height: '18px', borderRadius: '999px', backgroundColor: takeoverActive ? '#059669' : '#3b82f6', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: takeoverActive ? '18px' : '3px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: takeoverActive ? '#059669' : '#3b82f6' }}>
                {takeoverActive ? 'Manual' : 'AI'}
              </span>
            </button>
          </div>
          {/* Input Row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '8px 12px 10px 12px' }}>

            <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: takeoverActive ? '1px solid rgba(5,150,105,0.3)' : '1px solid transparent', transition: 'border-color 0.2s' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={takeoverActive ? 'Type a message…' : 'AI is handling this conversation…'}
                disabled={!takeoverActive}
                rows={1}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '15px', lineHeight: '1.5', color: takeoverActive ? '#0f172a' : '#64748b', padding: '10px 14px', resize: 'none', maxHeight: '140px', outline: 'none', cursor: takeoverActive ? 'text' : 'default', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                }}
              />
            </div>
            {takeoverActive && inputText.trim() ? (
              <button onClick={handleSendMessage} style={{ height: '42px', width: '42px', borderRadius: '50%', border: 'none', backgroundColor: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(5,150,105,0.4)' }}>
                <Send style={{ height: '20px', width: '20px', color: '#fff' }} />
              </button>
            ) : (
              <button style={{ height: '42px', width: '42px', borderRadius: '50%', border: 'none', backgroundColor: takeoverActive ? '#059669' : '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 8px ${takeoverActive ? 'rgba(5,150,105,0.4)' : 'rgba(59,130,246,0.3)'}` }}>
                {takeoverActive ? <Mic style={{ height: '22px', width: '22px', color: '#fff' }} /> : <Bot style={{ height: '20px', width: '20px', color: '#fff' }} />}
              </button>
            )}
          </div>
        </div>

      {/* END MIDDLE COLUMN */}
      </div>

      {/* RIGHT COLUMN: AI Lead Intelligence Center */}

      <div className="w-[420px] shrink-0 flex flex-col bg-[#FDFDFE] border-l border-slate-200/60 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          
          {/* Section 1: Lead Profile Card */}
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col items-center text-center">
              <Avatar name={activeName} size="lg" className="h-24 w-24 text-[28px] font-bold shadow-sm mb-5" />
              <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">{activeName}</h3>
              <p className="text-[14px] text-slate-500 font-medium mb-1">{activeLead?.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-7">
              <div className="bg-blue-50/30 border border-blue-100/50 rounded-[16px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-blue-50/50">
                <span className="text-[11px] font-bold text-blue-500/80 uppercase tracking-widest leading-none">Company</span>
                <span className="text-[14px] font-bold text-blue-900 truncate leading-none w-full">{activeLead?.businessType || 'Independent'}</span>
              </div>
              <div className="bg-violet-50/30 border border-violet-100/50 rounded-[16px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-violet-50/50">
                <span className="text-[11px] font-bold text-violet-500/80 uppercase tracking-widest leading-none">Source</span>
                <span className="text-[14px] font-bold text-violet-900 capitalize leading-none">{activeLead?.source || 'Direct'}</span>
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-[16px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-emerald-50/50">
                <span className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-widest leading-none">Status</span>
                <div className="flex"><Badge status={activeLead?.status || 'new'} className="px-2.5 py-1 text-[11px] leading-none" /></div>
              </div>
              <div className="bg-amber-50/30 border border-amber-100/50 rounded-[16px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-amber-50/50">
                <span className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest leading-none">Score</span>
                <span className="text-[18px] font-black text-amber-700 tracking-tight leading-none">{activeLead?.leadScore || '--'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Actions */}
          <div className="flex flex-col gap-3">
            <Link href={`/dashboard/leads`} className="block w-full">
              <div className="relative flex items-center justify-center h-[56px] px-5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-[16px] hover:shadow-[0_4px_20px_rgba(99,102,241,0.25)] transition-all group cursor-pointer hover:-translate-y-0.5">
                <div className="absolute left-4 h-9 w-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-[14.5px] font-semibold text-white">View Full Profile</span>
                <ChevronRight className="absolute right-5 h-4.5 w-4.5 text-white/80 group-hover:text-white transition-all group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href={`/dashboard/ai-memory`} className="block w-full">
              <div className="relative flex items-center justify-center h-[56px] px-5 bg-white border border-slate-200/60 rounded-[16px] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all group cursor-pointer hover:-translate-y-0.5">
                <div className="absolute left-4 h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <Brain className="h-4.5 w-4.5 text-slate-600 group-hover:text-slate-800" />
                </div>
                <span className="text-[14.5px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">View AI Memory</span>
                <ChevronRight className="absolute right-5 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-1" />
              </div>
            </Link>
            
            <Link href={`/dashboard/appointments`} className="block w-full">
              <div className="relative flex items-center justify-center h-[56px] px-5 bg-white border border-slate-200/60 rounded-[16px] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all group cursor-pointer hover:-translate-y-0.5">
                <div className="absolute left-4 h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <Calendar className="h-4.5 w-4.5 text-slate-600 group-hover:text-slate-800" />
                </div>
                <span className="text-[14.5px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Schedule Appointment</span>
                <ChevronRight className="absolute right-5 h-4.5 w-4.5 text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          {/* Section 3: Lead Intelligence Core */}
          <div className="bg-white border border-slate-200/60 rounded-[20px] overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
            <div className="py-5 px-6 border-b border-slate-100/80 bg-[#FDFDFE]">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">Lead Intelligence</h3>
              </div>
              <p className="text-[13px] text-slate-500 font-medium">
                AI-powered analysis of CRM activity.
              </p>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* Health Score Circle */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-2">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                    <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3.5"></circle>
                      <circle cx="18" cy="18" r="16" fill="none" className={cn(
                          "stroke-current transition-all duration-1000",
                          activeLead?.leadScore && activeLead.leadScore >= 8 ? "text-emerald-500" :
                          activeLead?.leadScore && activeLead.leadScore >= 5 ? "text-amber-500" : "text-rose-500"
                        )} strokeWidth="3.5" strokeDasharray={`${((activeLead?.leadScore || 0) / 10) * 100}, 100`} strokeLinecap="round"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn(
                        "text-[26px] font-black leading-none tracking-tight",
                        activeLead?.leadScore && activeLead.leadScore >= 8 ? "text-emerald-600" :
                        activeLead?.leadScore && activeLead.leadScore >= 5 ? "text-amber-600" : "text-rose-600"
                      )}>{activeLead?.leadScore || 0}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Health</span>
                </div>

                {/* Intelligence Micro-Cards */}
                <div className="flex-grow grid grid-cols-1 gap-3.5 w-full">
                  
                  {/* Qualification */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-[16px] border border-slate-100 bg-slate-50/30 transition-all hover:bg-slate-50/60">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                      activeLead?.leadScore && activeLead.leadScore >= 8 ? "bg-emerald-50" :
                      activeLead?.leadScore && activeLead.leadScore >= 5 ? "bg-amber-50" : "bg-blue-50"
                    )}>
                      <CheckCircle2 className={cn("h-4 w-4",
                        activeLead?.leadScore && activeLead.leadScore >= 8 ? "text-emerald-600" :
                        activeLead?.leadScore && activeLead.leadScore >= 5 ? "text-amber-600" : "text-blue-600"
                      )} />
                    </div>
                    <div className="flex flex-col gap-1 flex-grow">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Qualification</span>
                      <p className="text-[13px] text-slate-700 font-medium leading-snug">
                        {activeLead?.leadScore && activeLead.leadScore >= 8 ? "Ready for sales." : activeLead?.leadScore && activeLead.leadScore >= 5 ? "Requires nurturing." : "Not qualified."}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-20 text-left pl-2">
                      <span className={cn("text-[13px] font-bold",
                        activeLead?.leadScore && activeLead.leadScore >= 8 ? "text-emerald-700" :
                        activeLead?.leadScore && activeLead.leadScore >= 5 ? "text-amber-700" : "text-blue-700"
                      )}>
                        {activeLead?.leadScore && activeLead.leadScore >= 8 ? "High" : activeLead?.leadScore && activeLead.leadScore >= 5 ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>

                  {/* Intent */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-[16px] border border-slate-100 bg-slate-50/30 transition-all hover:bg-slate-50/60">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                      activeLead?.intent === "high" ? "bg-orange-50" : "bg-blue-50"
                    )}>
                      <Activity className={cn("h-4 w-4",
                        activeLead?.intent === "high" ? "text-orange-600" : "text-blue-600"
                      )} />
                    </div>
                    <div className="flex flex-col gap-1 flex-grow">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Intent Level</span>
                      <p className="text-[13px] text-slate-700 font-medium leading-snug">
                        {activeLead?.intent === "high" ? "Active engagement." : "Passive consumption."}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-20 text-left pl-2">
                      <span className={cn("text-[13px] font-bold capitalize",
                        activeLead?.intent === "high" ? "text-orange-700" : "text-blue-700"
                      )}>
                        {activeLead?.intent || "Medium"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Section 4: AI Insights & Recommended Action */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Insights & Actions
            </h4>
            
            <div className="flex flex-col gap-4">
              {/* Key Signal Card */}
              <div className="p-6 bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/50 rounded-[20px] shadow-[0_2px_12px_-4px_rgba(59,130,246,0.05)] transition-all hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '10px' }}>
                  <span className="text-[14px] font-bold text-slate-900 tracking-tight">Key Signal</span>
                  {isGeneratingInsights && <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />}
                </div>
                <p className={cn("text-[14px] font-medium leading-relaxed", isGeneratingInsights ? "text-slate-400 animate-pulse" : "text-slate-600")}>
                  {aiInsights?.signal || "Analyzing lead data..."}
                </p>
              </div>

              {/* Opportunity Card */}
              <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/50 rounded-[20px] shadow-[0_2px_12px_-4px_rgba(16,185,129,0.05)] transition-all hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3" style={{ borderLeft: '3px solid #10b981', paddingLeft: '10px' }}>
                  <span className="text-[14px] font-bold text-slate-900 tracking-tight">Opportunity</span>
                  {isGeneratingInsights && <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />}
                </div>
                <div className="space-y-1.5">
                  <p className={cn("text-[14px] font-medium leading-relaxed", isGeneratingInsights ? "text-slate-400 animate-pulse" : "text-slate-600")}>
                    {aiInsights?.opportunity || "Evaluating potential..."}
                  </p>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 rounded-[20px] shadow-[0_2px_12px_-4px_rgba(99,102,241,0.05)] relative overflow-hidden transition-all hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] hover:-translate-y-0.5">
                <div className="absolute -top-4 -right-4 p-3 opacity-[0.03]">
                  <Zap className="h-28 w-28 text-indigo-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5" style={{ borderLeft: '3px solid #6366f1', paddingLeft: '10px' }}>
                    <span className="text-[14px] font-bold text-indigo-900 tracking-tight">Recommended Action</span>
                    {isGeneratingInsights && <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />}
                  </div>
                  
                  <div className="mb-6">
                    <h5 className="text-[15px] font-bold text-indigo-950 mb-1.5">
                      {aiInsights?.actionTitle || "Analyzing actions..."}
                    </h5>
                    <p className={cn("text-[13px] font-medium leading-relaxed", isGeneratingInsights ? "text-indigo-900/40 animate-pulse" : "text-indigo-900/70")}>
                      {aiInsights?.actionDesc || "Processing optimal next steps..."}
                    </p>
                  </div>
                  
                  <Button className="w-full h-11 text-[13.5px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[12px] shadow-sm transition-all hover:shadow-md">
                    Execute Action
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
