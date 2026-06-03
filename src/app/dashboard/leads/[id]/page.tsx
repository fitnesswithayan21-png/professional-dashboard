'use client';

import { use, useMemo } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatDate, formatDateTime, getScoreColor } from '@/lib/utils';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Brain, 
  MessageSquare, 
  Clock, 
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { leads, conversations, memories, appointments, followUps } = useCRMStore();
  const lead = leads.find(l => l.id === id);
  const leadConversations = conversations.filter(c => c.leadId === id);
  const leadMemories = memories.filter(m => m.leadId === id);
  const leadAppointments = appointments.filter(a => a.leadId === id);
  const leadFollowUps = followUps.filter(f => f.leadId === id);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-96 select-none">
        <div className="text-center space-y-4">
          <p className="text-[14px] font-semibold text-[#6B7280]">Lead Not Found</p>
          <Link href="/dashboard/leads">
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4" /> Back to Leads
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getLeadHealth = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-[#10B981]' };
    if (score >= 60) return { label: 'Good', color: 'text-[#3B82F6]' };
    if (score >= 40) return { label: 'Fair', color: 'text-[#F59E0B]' };
    return { label: 'Critical', color: 'text-[#EF4444]' };
  };

  const health = getLeadHealth(lead.leadScore);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto select-none animate-fade-in">
      <PageHeader title={lead.fullName} description={`Lead profile and history`}>
        <Link href="/dashboard/leads">
          <Button variant="secondary" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4 text-[#6B7280]" /> Back to Leads
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="text-center relative overflow-hidden" padding="lg">
            <div className="flex flex-col items-center">
              <Avatar name={lead.fullName} size="lg" className="h-16 w-16 text-xl shadow-sm" />
              <h3 className="mt-4 text-[18px] font-bold text-[#111827]">{lead.fullName}</h3>
              <p className="text-[13px] text-[#6B7280] font-medium mt-1">{lead.businessType}</p>
              
              <div className="flex items-center gap-2 mt-4">
                <Badge status={lead.status} />
              </div>

              <div className="w-full mt-6 pt-6 border-t border-[#E5E7EB] space-y-4">
                <div className="flex flex-col items-center justify-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl py-4">
                  <span className={cn('text-[32px] font-bold leading-none', getScoreColor(lead.leadScore))}>{lead.leadScore}</span>
                  <span className="text-[12px] font-medium text-[#6B7280] mt-1">Lead Score ({health.label})</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-3 text-[13px] text-[#4B5563] text-left">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC]">
                  <Mail className="h-4 w-4 text-[#9CA3AF] shrink-0" />
                  <span className="truncate font-medium">{lead.email}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC]">
                  <Phone className="h-4 w-4 text-[#9CA3AF] shrink-0" />
                  <span className="font-medium">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC]">
                  <Globe className="h-4 w-4 text-[#9CA3AF] shrink-0" />
                  <span className="font-medium">Source: {lead.source}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: Conversations & Memories */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="border-b border-[#E5E7EB] pb-4 mb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#4F46E5]" />
                Conversation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadConversations.length > 0 ? (
                <div className="space-y-6">
                  {leadConversations.map(conv => (
                    <div key={conv.id} className="space-y-3">
                      <span className="text-[11px] font-semibold text-[#6B7280] uppercase">
                        {formatDateTime(conv.timestamp)}
                      </span>
                      <div className="flex flex-col gap-3">
                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB]">
                          <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-2">User Query</p>
                          <p className="text-[13px] text-[#111827] leading-relaxed">{conv.userMessage}</p>
                        </div>
                        <div className="bg-[#EFF6FF] rounded-xl p-4 border border-[#BFDBFE]">
                          <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Output
                          </p>
                          <p className="text-[13px] text-[#111827] leading-relaxed">{conv.aiResponse}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280] text-[13px] font-medium">
                  No conversations recorded.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#E5E7EB] pb-4 mb-4">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#4F46E5]" />
                AI Memory & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadMemories.length > 0 ? (
                <div className="space-y-3">
                  {leadMemories.map(mem => (
                    <div key={mem.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge status={mem.memoryType} />
                        <span className="text-[12px] text-[#6B7280]">
                          {formatDate(mem.lastUpdated)}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#111827] leading-relaxed">{mem.memoryValue}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280] text-[13px] font-medium">
                  No AI memories stored.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Appointments & Activity */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="border-b border-[#E5E7EB] pb-4 mb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#4F46E5]" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadAppointments.length > 0 ? (
                <div className="space-y-3">
                  {leadAppointments.map(apt => (
                    <div key={apt.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <p className="text-[13px] font-semibold text-[#111827]">
                          {formatDate(apt.appointmentDate)} at {apt.appointmentTime}
                        </p>
                        <Badge status={apt.status} />
                      </div>
                      <a 
                        href={apt.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[12px] font-medium text-[#4F46E5] hover:underline"
                      >
                        Meeting Link
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280] text-[13px] font-medium">
                  No appointments scheduled.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#E5E7EB] pb-4 mb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#4F46E5]" />
                Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadFollowUps.length > 0 ? (
                <div className="space-y-3">
                  {leadFollowUps.map(fu => (
                    <div key={fu.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#111827]">Outreach #{fu.followUpNumber}</span>
                        <Badge status={fu.status} />
                      </div>
                      <p className="text-[13px] text-[#4B5563] leading-relaxed">{fu.followUpMessage}</p>
                      <p className="text-[11px] font-medium text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
                        Scheduled: {formatDateTime(fu.scheduledTime)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280] text-[13px] font-medium">
                  No follow-ups in queue.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
