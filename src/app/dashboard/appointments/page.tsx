'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video,
  List,
  LayoutGrid,
  Plus,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function AppointmentsPage() {
  const { appointments, leads } = useCRMStore();
  const [view, setView] = useState<'calendar' | 'agenda'>('calendar');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const renderActionButton = (apt: any, isAgenda: boolean = false) => {
    const normalizedStatus = apt.status.toLowerCase().trim();
    const btnClass = cn(
      "inline-flex items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-bold transition-all",
      isAgenda ? "h-[38px] px-6 min-w-[130px]" : "h-10 w-full"
    );

    if (['scheduled', 'confirmed', 'upcoming'].includes(normalizedStatus)) {
      return (
        <a 
          href={apt.meetingLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={cn(btnClass, "bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5")}
        >
          <Video className="h-4 w-4 shrink-0" />
          {isAgenda ? 'Join' : 'Join Meeting'}
        </a>
      );
    }
    
    if (normalizedStatus === 'completed') {
      return (
        <div className={cn(btnClass, "bg-emerald-50 text-emerald-700 border border-emerald-100/50 cursor-default")}>
          <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
          Completed
        </div>
      );
    }

    if (normalizedStatus === 'no show' || normalizedStatus === 'no-show') {
      return (
        <div className={cn(btnClass, "bg-rose-50 text-rose-700 border border-rose-100/50 cursor-default")}>
          <AlertTriangle className="h-4 w-4 shrink-0 stroke-[2.5]" />
          No Show
        </div>
      );
    }

    if (normalizedStatus === 'cancelled') {
      return (
        <div className={cn(btnClass, "bg-slate-50 text-slate-500 border border-slate-200/60 cursor-default")}>
          <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
          Cancelled
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get('leadId');
      if (leadId) {
        setSelectedLeadId(leadId);
      }
    }
  }, []);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find(l => l.id === selectedLeadId);
  }, [leads, selectedLeadId]);

  const filtered = useMemo(() => {
    let result = [...appointments];
    if (selectedLeadId) {
      result = result.filter(a => a.leadId === selectedLeadId);
    } else if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    return result.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }, [appointments, statusFilter, selectedLeadId]);

  const statusCounts = useMemo(() => {
    return {
      all: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      'no show': appointments.filter(a => a.status === 'no-show').length,
    };
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6 relative min-h-screen">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[13px] text-slate-500 font-medium z-10 relative">
          <div className="group flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-[18px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 font-bold text-[14px] shadow-sm group-hover:scale-110 transition-transform duration-300">{statusCounts.scheduled}</div>
            <span className="text-slate-600 font-semibold tracking-tight">Upcoming</span>
          </div>
          <div className="group flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-[18px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[14px] shadow-sm group-hover:scale-110 transition-transform duration-300">{statusCounts.completed}</div>
            <span className="text-slate-600 font-semibold tracking-tight">Completed</span>
          </div>
        </div>

        <Button className="h-10 px-6 w-[160px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg rounded-[14px] transition-all duration-300 font-semibold border-none">
          New Appointment
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 px-1">
          {Object.entries(statusCounts).map(([status, count]) => {
            const isActive = statusFilter === status;
            return (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'group h-[34px] px-3.5 rounded-[10px] text-[13px] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer border',
                  isActive 
                    ? 'bg-white text-[#2563EB] border-[#2563EB]/20 shadow-[0_2px_8px_rgba(37,99,235,0.08)] font-semibold' 
                    : 'bg-white/60 text-slate-500 border-slate-200/60 hover:bg-white hover:text-slate-800 hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-slate-300 font-medium'
                )}
              >
                <span className="capitalize tracking-tight">{status === 'all' ? 'All' : status}</span>
                <span className={cn(
                  "flex items-center justify-center px-1.5 min-w-[20px] h-[20px] rounded-md text-[11px] font-bold transition-all duration-200",
                  isActive ? "bg-blue-50 text-[#2563EB]" : "bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[14px] p-1 shadow-sm">
          <button
            onClick={() => setView('calendar')}
            className={cn(
              "p-2 rounded-[10px] transition-all duration-200 cursor-pointer", 
              view === 'calendar' ? "bg-white text-slate-900 shadow-sm scale-105" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/30"
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('agenda')}
            className={cn(
              "p-2 rounded-[10px] transition-all duration-200 cursor-pointer", 
              view === 'agenda' ? "bg-white text-slate-900 shadow-sm scale-105" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/30"
            )}
            title="Agenda View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lead Filter Banner */}
      {selectedLead && (
        <div className="flex items-center justify-between bg-blue-50/60 border border-blue-200 rounded-[10px] px-4 py-2 text-[13px] text-slate-800 font-semibold shadow-xs">
          <span>Showing appointments only for <span className="text-[#2563EB]">{selectedLead.fullName}</span></span>
          <button 
            onClick={() => setSelectedLeadId(null)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 font-bold bg-white border border-slate-200 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3 shrink-0" />
            Clear
          </button>
        </div>
      )}

      {/* Content */}
      {view === 'calendar' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filtered.map(apt => (
            <div key={apt.id} className="group flex flex-col h-full bg-white rounded-[20px] border border-slate-200/60 transition-all duration-400 hover:-translate-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)]">
              <div className="flex-1 p-6 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-5">
                  <Avatar name={apt.leadName} className="h-11 w-11 text-[14px] font-semibold shadow-sm shrink-0" />
                  <div className="flex flex-col">
                    <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#2563EB] transition-colors">{apt.leadName}</h3>
                    <div className="mt-1.5">
                      <Badge status={apt.status} className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border-none" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2.5 mb-6">
                  <div className="flex items-center gap-3 text-[13.5px] font-medium text-slate-500">
                    <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{formatDate(apt.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13.5px] font-medium text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{apt.appointmentTime} (EST)</span>
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-slate-100">
                  {renderActionButton(apt)}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-[14px] font-semibold text-slate-900">No appointments found</p>
              <p className="text-[13px] text-slate-500 mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="flex flex-col gap-4">
            {filtered.map((apt) => (
              <div 
                key={apt.id} 
                className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white border border-slate-200/60 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-400 hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-5">
                  <Avatar name={apt.leadName} className="h-11 w-11 shadow-sm font-semibold shrink-0" />
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="text-[16px] font-bold text-slate-900 tracking-tight group-hover:text-[#2563EB] transition-colors">{apt.leadName}</h4>
                      <Badge status={apt.status} className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border-none" />
                    </div>
                    <div className="flex items-center gap-5">
                      <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        {formatDate(apt.appointmentDate)}
                      </p>
                      <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {apt.appointmentTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  {renderActionButton(apt, true)}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center bg-white/50 backdrop-blur-md rounded-[24px] border border-white shadow-sm">
                <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-[16px] font-bold text-slate-900 tracking-tight">No appointments found</p>
                <p className="text-[14px] text-slate-500 font-medium mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
