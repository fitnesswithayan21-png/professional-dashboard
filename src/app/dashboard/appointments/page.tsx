/* eslint-disable */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useCRMStore } from "@/store/crm-store";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  List,
  LayoutGrid,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { DashboardGrid } from "@/components/ui/DashboardGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDisplayDate(raw: string): string {
  if (!raw) return "—";
  // Handle ISO strings (2026-06-02T... or 2026-06-02)
  const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(raw: string): string {
  if (!raw) return "—";
  // raw may be "12:00 PM", "12:00:00", or full ISO
  if (raw.includes("T")) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }
  // Already formatted like "12:00 PM"
  if (/^\d{1,2}:\d{2}\s?(AM|PM)/i.test(raw.trim())) return raw.trim();
  // HH:MM:SS → 12-hour
  const parts = raw.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parts[1].padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
  return raw;
}

/**
 * Compute the effective display status based on stored status + time logic.
 * Priority: no-show > cancelled > time-based (completed / in-progress / scheduled)
 */
function computeStatus(apt: {
  status: string;
  appointmentStart?: string;
  appointmentEnd?: string;
}): string {
  const stored = (apt.status || "").toLowerCase().trim();

  // Hard overrides — DB always wins for these
  if (stored === "no-show" || stored === "no show") return "no-show";
  if (stored === "cancelled") return "cancelled";

  const now = Date.now();
  if (apt.appointmentStart && apt.appointmentEnd) {
    const start = new Date(apt.appointmentStart).getTime();
    const end = new Date(apt.appointmentEnd).getTime();
    if (!isNaN(start) && !isNaN(end)) {
      if (now > end) return "completed";
      if (now >= start) return "confirmed";
      return "scheduled";
    }
  }

  // Fallback to stored status
  return stored || "scheduled";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { appointments, leads } = useCRMStore();
  const [view, setView] = useState<"calendar" | "agenda">("calendar");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Resolve lead name from leads store by leadId
  const getLeadName = (leadId: string): string => {
    const lead = leads.find((l) => l.id === leadId);
    return lead?.fullName || leadId || "Unknown Lead";
  };

  const getLeadSource = (leadId: string): string => {
    const lead = leads.find((l) => l.id === leadId);
    return lead?.source || "";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get("leadId");
      if (leadId) setSelectedLeadId(leadId);
    }
  }, []);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Enrich appointments with computed status + resolved lead name
  const enriched = useMemo(() => {
    return appointments.map((apt) => ({
      ...apt,
      resolvedName: getLeadName(apt.leadId),
      resolvedSource: getLeadSource(apt.leadId),
      effectiveStatus: computeStatus(apt),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, leads]);

  const statusCounts = useMemo(
    () => ({
      all: enriched.length,
      scheduled: enriched.filter(
        (a) =>
          a.effectiveStatus === "scheduled" ||
          a.effectiveStatus === "confirmed",
      ).length,
      completed: enriched.filter((a) => a.effectiveStatus === "completed")
        .length,
      cancelled: enriched.filter((a) => a.effectiveStatus === "cancelled")
        .length,
      "no-show": enriched.filter((a) => a.effectiveStatus === "no-show").length,
    }),
    [enriched],
  );

  const filtered = useMemo(() => {
    let result = [...enriched];

    // Lead filter (from URL param)
    if (selectedLeadId) {
      result = result.filter((a) => a.leadId === selectedLeadId);
    }

    // Status tab filter
    if (statusFilter === "scheduled") {
      result = result.filter(
        (a) =>
          a.effectiveStatus === "scheduled" ||
          a.effectiveStatus === "confirmed",
      );
    } else if (statusFilter !== "all") {
      result = result.filter((a) => a.effectiveStatus === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.resolvedName.toLowerCase().includes(q) ||
          a.leadId.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q),
      );
    }

    // Sort by appointmentStart (or appointmentDate) ascending
    return result.sort((a, b) => {
      const ta = a.appointmentStart
        ? new Date(a.appointmentStart).getTime()
        : new Date(a.appointmentDate).getTime();
      const tb = b.appointmentStart
        ? new Date(b.appointmentStart).getTime()
        : new Date(b.appointmentDate).getTime();
      return ta - tb;
    });
  }, [enriched, statusFilter, selectedLeadId, search]);

  // ── Action button ──────────────────────────────────────────────────────────
  const renderAction = (apt: (typeof enriched)[number], compact = false) => {
    const status = apt.effectiveStatus;
    const btnBase = cn(
      "inline-flex items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-bold transition-all",
      compact ? "h-[38px] px-6 min-w-[130px]" : "h-10 w-full",
    );

    if (status === "scheduled" || status === "confirmed") {
      return (
        <a
          href={apt.meetingLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            btnBase,
            "bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5",
          )}
        >
          <Video className="h-4 w-4 shrink-0" />
          {compact ? "Join" : "Join Meeting"}
        </a>
      );
    }
    if (status === "completed") {
      return (
        <div
          className={cn(
            btnBase,
            "bg-emerald-50 text-emerald-700 border border-emerald-100/50 cursor-default",
          )}
        >
          <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
          Completed
        </div>
      );
    }
    if (status === "no-show") {
      return (
        <div
          className={cn(
            btnBase,
            "bg-rose-50 text-rose-700 border border-rose-100/50 cursor-default",
          )}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 stroke-[2.5]" />
          No Show
        </div>
      );
    }
    if (status === "cancelled") {
      return (
        <div
          className={cn(
            btnBase,
            "bg-slate-50 text-slate-500 border border-slate-200/60 cursor-default",
          )}
        >
          <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
          Cancelled
        </div>
      );
    }
    return null;
  };

  // ── Filter tab labels ─────────────────────────────────────────────────────
  const tabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All", count: statusCounts.all },
    { key: "scheduled", label: "Upcoming", count: statusCounts.scheduled },
    { key: "completed", label: "Completed", count: statusCounts.completed },
    { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
    { key: "no-show", label: "No Show", count: statusCounts["no-show"] },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Appointments"
        description="Manage your schedule, upcoming meetings, and past appointments."
        action={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-9 text-sm font-medium">
            New Appointment
          </Button>
        }
      />

      <DashboardGrid columns={4}>
        <MetricCard
          label="Total Appointments"
          value={statusCounts.all.toString()}
          sub="All time"
          icon={CalendarIcon}
        />
        <MetricCard
          label="Upcoming"
          value={statusCounts.scheduled.toString()}
          trend={{ value: "2", type: "up" }}
          sub="This week"
          icon={Clock}
        />
        <MetricCard
          label="Completed"
          value={statusCounts.completed.toString()}
          trend={{ value: "5", type: "up" }}
          sub="This month"
          icon={Check}
        />
        <MetricCard
          label="Cancelled"
          value={statusCounts.cancelled.toString()}
          sub="This month"
          icon={X}
        />
      </DashboardGrid>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative z-10">
        {/* Status Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 px-1">
          {tabs.map(({ key, label, count }) => {
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "group h-[34px] px-3.5 rounded-[10px] text-[13px] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer border",
                  isActive
                    ? "bg-white text-[#2563EB] border-[#2563EB]/20 shadow-[0_2px_8px_rgba(37,99,235,0.08)] font-semibold"
                    : "bg-white/60 text-slate-500 border-slate-200/60 hover:bg-white hover:text-slate-800 hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-slate-300 font-medium",
                )}
              >
                <span className="tracking-tight">{label}</span>
                <span
                  className={cn(
                    "flex items-center justify-center px-1.5 min-w-[20px] h-[20px] rounded-md text-[11px] font-bold transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-[#2563EB]"
                      : "bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + View Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white/80 border border-slate-200/60 rounded-[12px] px-3 h-[36px] shadow-sm">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments…"
              className="text-[13px] bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-[180px]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[14px] p-1 shadow-sm">
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "p-2 rounded-[10px] transition-all duration-200 cursor-pointer",
                view === "calendar"
                  ? "bg-white text-slate-900 shadow-sm scale-105"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/30",
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("agenda")}
              className={cn(
                "p-2 rounded-[10px] transition-all duration-200 cursor-pointer",
                view === "agenda"
                  ? "bg-white text-slate-900 shadow-sm scale-105"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/30",
              )}
              title="Agenda View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lead Filter Banner */}
      {selectedLead && (
        <div className="flex items-center justify-between bg-blue-50/60 border border-blue-200 rounded-[10px] px-4 py-2 text-[13px] text-slate-800 font-semibold shadow-xs">
          <span>
            Showing appointments only for{" "}
            <span className="text-[#2563EB]">{selectedLead.fullName}</span>
          </span>
          <button
            onClick={() => setSelectedLeadId(null)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 font-bold bg-white border border-slate-200 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3 shrink-0" />
            Clear
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {view === "calendar" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filtered.map((apt) => {
            const name = apt.resolvedName;
            const source = apt.resolvedSource;
            const dispDate = formatDisplayDate(
              apt.appointmentDate || apt.appointmentStart || "",
            );
            const dispTime = apt.appointmentStart
              ? formatDisplayTime(apt.appointmentStart)
              : formatDisplayTime(apt.appointmentTime);
            const effStatus = apt.effectiveStatus;

            return (
              <div
                key={apt.id}
                className="group flex flex-col h-full bg-white rounded-[20px] border border-slate-200/60 transition-all duration-400 hover:-translate-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)]"
              >
                <div className="flex-1 p-6 flex flex-col h-full">
                  {/* Header: Avatar + Name + Status */}
                  <div className="flex items-start gap-4 mb-5">
                    <Avatar
                      name={name}
                      className="h-11 w-11 text-[14px] font-semibold shadow-sm shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#2563EB] transition-colors truncate">
                        {name}
                      </h3>
                      {source && (
                        <span className="text-[12px] text-slate-400 font-medium capitalize">
                          {source}
                        </span>
                      )}
                      <div className="mt-1.5">
                        <Badge
                          status={effStatus}
                          className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="flex flex-col gap-2.5 mb-6">
                    <div className="flex items-center gap-3 text-[13.5px] font-medium text-slate-500">
                      <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{dispDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13.5px] font-medium text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{dispTime}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-auto pt-5 border-t border-slate-100">
                    {renderAction(apt)}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-[14px] font-semibold text-slate-900">
                No appointments found
              </p>
              <p className="text-[13px] text-slate-500 mt-1">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Agenda View ── */
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="flex flex-col gap-4">
            {filtered.map((apt) => {
              const name = apt.resolvedName;
              const source = apt.resolvedSource;
              const dispDate = formatDisplayDate(
                apt.appointmentDate || apt.appointmentStart || "",
              );
              const dispTime = apt.appointmentStart
                ? formatDisplayTime(apt.appointmentStart)
                : formatDisplayTime(apt.appointmentTime);
              const effStatus = apt.effectiveStatus;

              return (
                <div
                  key={apt.id}
                  className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white border border-slate-200/60 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-400 hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                >
                  <div className="flex items-center gap-5">
                    <Avatar
                      name={name}
                      className="h-11 w-11 shadow-sm font-semibold shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h4 className="text-[16px] font-bold text-slate-900 tracking-tight group-hover:text-[#2563EB] transition-colors">
                          {name}
                        </h4>
                        <Badge
                          status={effStatus}
                          className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border-none"
                        />
                      </div>
                      {source && (
                        <p className="text-[12px] text-slate-400 font-medium capitalize mb-1">
                          {source}
                        </p>
                      )}
                      <div className="flex items-center gap-5 flex-wrap">
                        <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                          {dispDate}
                        </p>
                        <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {dispTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    {renderAction(apt, true)}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center bg-white/50 backdrop-blur-md rounded-[24px] border border-white shadow-sm">
                <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-[16px] font-bold text-slate-900 tracking-tight">
                  No appointments found
                </p>
                <p className="text-[14px] text-slate-500 font-medium mt-1">
                  Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
