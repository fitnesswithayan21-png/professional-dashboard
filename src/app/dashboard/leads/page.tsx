"use client";

import { useState, useMemo } from "react";
import { useCRMStore } from "@/store/crm-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, ScoreBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SlideOver } from "@/components/ui/slide-over";
import { cn, formatDate } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  List,
  LayoutGrid,
  Plus,
  Brain,
  ChevronDown,
  MessageSquare,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Heart,
  Sparkles,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { DashboardGrid } from "@/components/ui/DashboardGrid";
import Link from "next/link";

const PAGE_SIZE = 12;
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const SOURCES = ["Website", "LinkedIn", "Referral", "Google Ads", "Direct"];

export default function LeadsPage() {
  const { leads, appointments, memories } = useCRMStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState("leadScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<"table" | "grid">("table");

  // Slide Over state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(s) ||
          l.email.toLowerCase().includes(s) ||
          l.businessType?.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (sourceFilter !== "all") {
      result = result.filter((l) => l.source === sourceFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [leads, search, statusFilter, sourceFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const leadMemories = memories.filter((m) => m.leadId === selectedLeadId);

  // Generate initials from full name
  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Derive qualification level from lead_score directly
  const getQualificationLevel = (score: number) => {
    if (score >= 8) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  };

  // Derive intent: only from leads field
  const getDerivedIntent = (lead: any): string => {
    return lead.intent || "Not Available";
  };

  // Derive priority: only from lead_score directly
  const getDerivedPriority = (score: number): string => {
    if (score >= 8) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  };

  const renderScoreBar = (score: number) => {
    let barColor = "bg-rose-500";
    if (score >= 8) barColor = "bg-emerald-500";
    else if (score >= 5) barColor = "bg-amber-500";

    return (
      <div className="flex items-center gap-3 w-full max-w-[120px] select-none">
        <div className="h-1.5 w-[64px] bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              barColor,
            )}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
        <span
          className={cn(
            "font-mono text-[13px] font-bold tabular-nums shrink-0",
            score >= 8
              ? "text-emerald-600"
              : score >= 5
                ? "text-amber-600"
                : "text-rose-600",
          )}
        >
          {score}
        </span>
      </div>
    );
  };

  const renderAIIntelligence = (lead: any) => {
    const score = lead.leadScore;
    // Use actual intent from data — no fake fallback generation
    const intent = getDerivedIntent(lead);

    // Determine Qualification Badge from actual score
    let qualText = "Low Confidence";
    let qualIcon = <AlertCircle className="h-3 w-3 text-rose-500" />;
    let qualTint = "bg-rose-50/50 text-rose-700 border-rose-100/50";
    if (score >= 8) {
      qualText = "🔥 Top Qualification";
      qualIcon = <Sparkles className="h-3 w-3 text-emerald-500" />;
      qualTint = "bg-emerald-50 text-emerald-700 border-emerald-100";
    } else if (score >= 5) {
      qualText = "High Qualification";
      qualIcon = <Activity className="h-3 w-3 text-amber-500" />;
      qualTint = "bg-amber-50 text-amber-700 border-amber-100";
    } else if (score >= 0) {
      qualText = "Fair Qualification";
      qualIcon = <Activity className="h-3 w-3 text-blue-500" />;
      qualTint = "bg-blue-50 text-blue-700 border-blue-100";
    }

    // Determine Intent Badge from actual data
    const intentText =
      intent !== "Not Available"
        ? `${intent.replace(/_/g, " ")}`
        : "Not Available";
    let intentTint = "bg-slate-50/50 text-slate-600 border-slate-200/50";
    if (intent === "high" || intent === "urgent") {
      intentTint = "bg-orange-50 text-orange-700 border-orange-100";
    } else if (intent === "medium") {
      intentTint = "bg-blue-50 text-blue-700 border-blue-100";
    }

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Brain className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            AI Insight
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold w-fit",
              qualTint,
            )}
          >
            {qualIcon} {qualText}
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold w-fit",
              intentTint,
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
            {intentText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      {/* Issue 7: Spacing hierarchy */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <p className="text-[13px] text-slate-500 leading-none">
          Manage, qualify, and track your active sales pipeline leads.
        </p>
      </div>

      {/* Issue 1: KPI Summary Metric Cards (88px height, 12px border radius, 16px padding) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[640px]">
        {/* Total Leads Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">
              TOTAL LEADS
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full leading-none">
              +12%
            </span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {totalLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">
            vs last month
          </div>
        </div>

        {/* Qualified Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">
              QUALIFIED
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full leading-none">
              +8%
            </span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {qualifiedLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">
            vs last week
          </div>
        </div>

        {/* New Today Card */}
        <div className="h-[88px] bg-white border border-[#E2E8F0] rounded-[12px] p-[16px] flex flex-col justify-between items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">
              NEW TODAY
            </span>
            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full leading-none">
              +4%
            </span>
          </div>
          <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {newLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">
            vs yesterday
          </div>
        </div>
      </div>

      {/* Issue 6: Unified Horizontal Toolbar (Gap 12px, Height 44px, Vertical center) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 w-full">
        {/* Unified Search and Dropdowns filter controls */}
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          {/* Issue 3: Search field (Icon left 16px, placeholder padding-left 44px, padding-right 16px) */}
          <div className="relative flex-1 min-w-[240px] max-w-full lg:max-w-[320px]">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads, companies, emails..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: "48px", paddingRight: "16px" }}
              className="w-full h-11 rounded-[10px] bg-white border border-[#E2E8F0] search-input-padding-override text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Issue 2: Status filter dropdown (Center text, padding pr-4 pl-4 chevron absolute right-4, font-medium) */}
          <div className="relative min-w-[150px] w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none w-full h-11 px-4 text-center rounded-[10px] bg-white border border-[#E2E8F0] text-[13px] font-medium text-slate-700 hover:bg-slate-50/50 hover:border-slate-300 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">Status: All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Issue 2: Source filter dropdown (Center text, padding pr-4 pl-4 chevron absolute right-4, font-medium) */}
          <div className="relative min-w-[150px] w-full sm:w-auto">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none w-full h-11 px-4 text-center rounded-[10px] bg-white border border-[#E2E8F0] text-[13px] font-medium text-slate-700 hover:bg-slate-50/50 hover:border-slate-300 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">Source: All</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* View Toggle Segmented Control (Height 44px, Radius 10px, font-medium) */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-1 h-11">
            <button
              onClick={() => setActiveView("table")}
              className={cn(
                "h-9 px-4 rounded-md text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-[12.5px] font-medium",
                activeView === "table" &&
                  "bg-white text-slate-900 shadow-sm border border-[#E2E8F0]",
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setActiveView("grid")}
              className={cn(
                "h-9 px-4 rounded-md text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-[12.5px] font-medium",
                activeView === "grid" &&
                  "bg-white text-slate-900 shadow-sm border border-[#E2E8F0]",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Issue 5: Expanded Add Lead Button (Height 44px, Radius 10px, Min-width 140px, Padding px-5) */}
        <button
          onClick={() => {}}
          className="h-11 min-w-[140px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[13px] gap-2 flex items-center justify-center transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:-translate-y-[1px] active:translate-y-0 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Add Lead
        </button>
      </div>

      {/* Main Content */}
      {activeView === "table" ? (
        <Card
          padding="none"
          className="overflow-hidden bg-white border border-slate-200"
        >
          <div className="overflow-x-auto px-1">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* Issue 6: Table Header Styling (Height 52px, Font weight 600, tracking-wide) */}
                <tr className="bg-slate-50/70 border-b border-slate-200 h-[52px]">
                  <th
                    className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort("fullName")}
                  >
                    <div className="flex items-center gap-1">
                      Lead Details <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Company & Source
                  </th>
                  <th
                    className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort("leadScore")}
                  >
                    <div className="flex items-center gap-1">
                      Score <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-[20px] py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Added Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-[13px] text-slate-500"
                    >
                      No leads found matching filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      /* Issue 6 & 7: Row height 60px, column padding 20px, bold/medium text grouping, hover & selected states */
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={cn(
                          "h-[60px] cursor-pointer transition-colors",
                          isSelected
                            ? "bg-blue-50/30 hover:bg-blue-50/40"
                            : "hover:bg-slate-50/60",
                        )}
                      >
                        {/* Issue 7: Name Details cell (Avatar, bold Name, email/phone below) */}
                        <td className="px-[20px] py-2">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={lead.fullName}
                              size="sm"
                              className="h-8 w-8 text-[11px]"
                            />
                            <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-slate-900 leading-tight">
                                {lead.fullName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal mt-0.5">
                                Lead ID: {lead.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* Issue 7: Company & Source (Company medium, Source secondary text) */}
                        <td className="px-[20px] py-2">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-slate-700 leading-tight">
                              {lead.businessType || "—"}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize font-normal mt-0.5">
                              {lead.source}
                            </span>
                          </div>
                        </td>
                        <td className="px-[20px] py-2">
                          {renderScoreBar(lead.leadScore)}
                        </td>
                        <td className="px-[20px] py-2">
                          <Badge status={lead.status} />
                        </td>
                        <td className="px-[20px] py-2 text-[13px] text-slate-400">
                          {formatDate(lead.createdDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 h-12 border-t border-slate-200 bg-slate-50/50">
            <span className="text-[12px] text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8"
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <DashboardGrid columns={4}>
          {paginated.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLeadId(lead.id)}
              className={cn(
                "group relative flex flex-col bg-white rounded-[16px] border cursor-pointer transition-all duration-300 overflow-hidden",
                selectedLeadId === lead.id
                  ? "border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.15)] bg-white"
                  : "border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 bg-white",
                // Visual priority gradient for hot leads
                lead.leadScore >= 8
                  ? "bg-gradient-to-b from-emerald-50/30 to-white"
                  : "",
              )}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Top Section: Avatar + Info */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar
                    name={lead.fullName}
                    className="h-12 w-12 text-[15px] font-bold shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-[17px] font-bold text-slate-900 truncate tracking-tight">
                      {lead.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-[13px] text-slate-500 font-medium">
                      <span className="truncate max-w-[120px]">
                        {lead.businessType || "Not Available"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                      <span className="truncate">{lead.source}</span>
                    </div>
                  </div>
                  {/* Status indicator in top right */}
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 mt-2",
                      lead.status.toLowerCase() === "new"
                        ? "bg-purple-500"
                        : lead.status.toLowerCase() === "qualified"
                          ? "bg-emerald-500"
                          : "bg-slate-300",
                    )}
                  />
                </div>

                {/* Middle Section: AI Intelligence Module */}
                <div className="mt-auto mb-6">{renderAIIntelligence(lead)}</div>

                {/* Bottom Section: Activity Summary */}
                <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-100/80">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Activity Timeline
                    </span>
                    <span className="text-[12px] font-medium text-slate-600">
                      Active{" "}
                      {formatDate(lead.lastContactTime || lead.createdDate)} •
                      Created {formatDate(lead.createdDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar (Always Visible, integrated at bottom) */}
              <div className="h-[48px] bg-slate-50 border-t border-slate-200/60 flex items-center px-2 group-hover:bg-slate-100/50 transition-colors">
                <button className="flex-1 flex items-center justify-center gap-1.5 h-full text-[12.5px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                  View Profile
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 h-full text-slate-400 hover:text-blue-600 transition-colors"
                  title="AI Memory"
                >
                  <Brain className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 h-full text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Schedule"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 h-full text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Message"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </DashboardGrid>
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
            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100">
              <span className="text-[14px] font-semibold text-slate-800">
                Lead Details
              </span>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
              {/* SECTION 1: PROFILE HEADER */}
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
                <Avatar
                  name={getInitials(selectedLead.fullName)}
                  size="lg"
                  className="h-20 w-20 text-[28px] font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md mb-4"
                />
                <h3 className="text-[18px] font-semibold text-slate-900 tracking-tight">
                  {selectedLead.fullName || "Not Available"}
                </h3>
                <p className="text-[14px] text-slate-500 mb-4">
                  Lead ID: {selectedLead.id}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    status={selectedLead.status}
                    className="px-3 py-1 text-[12px] uppercase tracking-wider font-bold"
                  />
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">
                    Score {selectedLead.leadScore}
                  </span>
                </div>
              </div>

              {/* SECTION 2: QUICK ACTIONS */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href={`/dashboard/conversations?leadId=${selectedLead.id}`}
                  className="block w-full max-w-[330px]"
                >
                  <div className="relative flex items-center justify-center h-[52px] px-4 bg-white border border-slate-200/60 rounded-[14px] hover:border-blue-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group cursor-pointer">
                    <div className="absolute left-[10px] h-8 w-8 rounded-[10px] bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[14px] font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      View Conversations
                    </span>
                    <ChevronRight className="absolute right-4 h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/ai-memory?leadId=${selectedLead.id}`}
                  className="block w-full max-w-[330px]"
                >
                  <div className="relative flex items-center justify-center h-[52px] px-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[14px] hover:shadow-[0_4px_16px_rgba(99,102,241,0.25)] transition-all group cursor-pointer hover:-translate-y-[1px]">
                    <div className="absolute left-[10px] h-8 w-8 rounded-[10px] bg-white/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[14px] font-semibold text-white">
                      View AI Memory
                    </span>
                    <ChevronRight className="absolute right-4 h-4 w-4 text-white/80 group-hover:text-white transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/appointments?leadId=${selectedLead.id}`}
                  className="block w-full max-w-[330px]"
                >
                  <div className="relative flex items-center justify-center h-[52px] px-4 bg-white border border-slate-200/60 rounded-[14px] hover:border-blue-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group cursor-pointer">
                    <div className="absolute left-[10px] h-8 w-8 rounded-[10px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                      <Calendar className="h-4 w-4 text-slate-600 group-hover:text-slate-800" />
                    </div>
                    <span className="text-[14px] font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      Schedule Appointment
                    </span>
                    <ChevronRight className="absolute right-4 h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>

              {/* SECTION 3: LEAD SNAPSHOT */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] p-6 shadow-sm">
                <h4 className="text-[13px] font-bold text-slate-900 tracking-tight mb-4">
                  Lead Snapshot
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Company */}
                  <div className="bg-blue-50/40 border border-blue-100/60 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-blue-50/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-blue-500/80 uppercase tracking-wider leading-none">
                      Company
                    </span>
                    <span className="text-[14px] font-bold text-blue-900 truncate leading-none">
                      {selectedLead.businessType || "Not Available"}
                    </span>
                  </div>
                  {/* Source */}
                  <div className="bg-violet-50/40 border border-violet-100/60 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-violet-50/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-violet-500/80 uppercase tracking-wider leading-none">
                      Source
                    </span>
                    <span className="text-[14px] font-bold text-violet-900 capitalize leading-none">
                      {selectedLead.source || "Not Available"}
                    </span>
                  </div>
                  {/* Status */}
                  <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-emerald-50/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-emerald-500/80 uppercase tracking-wider leading-none">
                      Status
                    </span>
                    <div className="flex">
                      <Badge
                        status={selectedLead.status}
                        className="px-2.5 py-0.5 text-[11px] leading-none"
                      />
                    </div>
                  </div>
                  {/* Lead Score */}
                  <div className="bg-amber-50/40 border border-amber-100/60 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-amber-50/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-amber-500/80 uppercase tracking-wider leading-none">
                      Lead Score
                    </span>
                    <span className="text-[16px] font-black text-amber-700 tracking-tight leading-none">
                      {selectedLead.leadScore}
                    </span>
                  </div>
                  {/* Created Date */}
                  <div className="bg-slate-50/60 border border-slate-100/80 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-slate-100/50 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                      Created Date
                    </span>
                    <span className="text-[13px] font-bold text-slate-800 leading-none">
                      {selectedLead.createdDate
                        ? formatDate(selectedLead.createdDate)
                        : "Not Available"}
                    </span>
                  </div>
                  {/* Last Activity */}
                  <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-[12px] p-3.5 h-[72px] flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-indigo-50/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="text-[11px] font-semibold text-indigo-500/80 uppercase tracking-wider leading-none">
                      Last Activity
                    </span>
                    <span className="text-[13px] font-bold text-indigo-900 leading-none">
                      {selectedLead.lastContactTime
                        ? formatDate(selectedLead.lastContactTime)
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4, 5, 6: LEAD INTELLIGENCE */}
              <div className="bg-white border border-slate-200/60 rounded-[16px] overflow-hidden shadow-sm flex flex-col mb-4">
                {/* Header Section */}
                <div
                  className="py-6 pr-6 border-b border-slate-100 bg-slate-50/50"
                  style={{ paddingLeft: "40px" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">
                      Lead Intelligence
                    </h3>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">
                    AI-powered analysis of CRM activity, qualification signals,
                    and engagement history.
                  </p>
                </div>

                <div className="p-6 flex flex-col gap-8">
                  {/* Health Score + AI Insights combined area */}
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Integrated Health Score */}
                    <div
                      className="flex-shrink-0 flex flex-col items-center justify-center p-2"
                      style={{ marginLeft: "40px" }}
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                        <svg
                          className="w-full h-full -rotate-90 drop-shadow-sm"
                          viewBox="0 0 36 36"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-slate-100"
                            strokeWidth="3"
                          ></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className={cn(
                              "stroke-current transition-all duration-1000",
                              selectedLead.leadScore >= 8
                                ? "text-emerald-500"
                                : selectedLead.leadScore >= 5
                                  ? "text-amber-500"
                                  : "text-rose-500",
                            )}
                            strokeWidth="3"
                            strokeDasharray={`${(selectedLead.leadScore / 10) * 100}, 100`}
                            strokeLinecap="round"
                          ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className={cn(
                              "text-[28px] font-black leading-none tracking-tight",
                              selectedLead.leadScore >= 8
                                ? "text-emerald-600"
                                : selectedLead.leadScore >= 5
                                  ? "text-amber-600"
                                  : "text-rose-600",
                            )}
                          >
                            {selectedLead.leadScore}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Health Score
                      </span>
                    </div>

                    {/* AI Insights Mini-cards */}
                    <div className="flex-grow grid grid-cols-1 gap-3 w-full">
                      {/* Qualification */}
                      <div className="flex items-center gap-3.5 p-4 rounded-[12px] border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            selectedLead.leadScore >= 8
                              ? "bg-emerald-50"
                              : selectedLead.leadScore >= 5
                                ? "bg-amber-50"
                                : "bg-blue-50",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "h-4 w-4",
                              selectedLead.leadScore >= 8
                                ? "text-emerald-600"
                                : selectedLead.leadScore >= 5
                                  ? "text-amber-600"
                                  : "text-blue-600",
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-grow">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Qualification
                          </span>
                          <p className="text-[13px] text-slate-600 font-medium">
                            {getQualificationLevel(selectedLead.leadScore)}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-28 text-left">
                          <span
                            className={cn(
                              "text-[13px] font-bold",
                              selectedLead.leadScore >= 8
                                ? "text-emerald-700"
                                : selectedLead.leadScore >= 5
                                  ? "text-amber-700"
                                  : "text-blue-700",
                            )}
                          >
                            {getQualificationLevel(selectedLead.leadScore)}
                          </span>
                        </div>
                      </div>

                      {/* Intent Level */}
                      <div className="flex items-center gap-3.5 p-4 rounded-[12px] border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            getDerivedIntent(selectedLead) === "high" ||
                              getDerivedIntent(selectedLead) === "urgent"
                              ? "bg-orange-50"
                              : getDerivedIntent(selectedLead) === "medium"
                                ? "bg-amber-50"
                                : "bg-blue-50",
                          )}
                        >
                          <Activity
                            className={cn(
                              "h-4 w-4",
                              getDerivedIntent(selectedLead) === "high" ||
                                getDerivedIntent(selectedLead) === "urgent"
                                ? "text-orange-600"
                                : getDerivedIntent(selectedLead) === "medium"
                                  ? "text-amber-600"
                                  : "text-blue-600",
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-grow">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Intent Level
                          </span>
                          <p className="text-[13px] text-slate-600 font-medium capitalize">
                            {getDerivedIntent(selectedLead).replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-28 text-left">
                          <span
                            className={cn(
                              "text-[13px] font-bold capitalize",
                              getDerivedIntent(selectedLead) === "high" ||
                                getDerivedIntent(selectedLead) === "urgent"
                                ? "text-orange-700"
                                : getDerivedIntent(selectedLead) === "medium"
                                  ? "text-amber-700"
                                  : "text-blue-700",
                            )}
                          >
                            {getDerivedIntent(selectedLead).replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center gap-3.5 p-4 rounded-[12px] border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            getDerivedPriority(selectedLead.leadScore) ===
                              "High"
                              ? "bg-rose-50"
                              : getDerivedPriority(selectedLead.leadScore) ===
                                  "Medium"
                                ? "bg-amber-50"
                                : "bg-blue-50",
                          )}
                        >
                          <AlertCircle
                            className={cn(
                              "h-4 w-4",
                              getDerivedPriority(selectedLead.leadScore) ===
                                "High"
                                ? "text-rose-600"
                                : getDerivedPriority(selectedLead.leadScore) ===
                                    "Medium"
                                  ? "text-amber-600"
                                  : "text-blue-600",
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-grow">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Priority
                          </span>
                          <p className="text-[13px] text-slate-600 font-medium">
                            {getDerivedPriority(selectedLead.leadScore) ===
                            "High"
                              ? "Immediate action required by SLA."
                              : "Standard follow-up timeframe."}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-28 text-left">
                          <span
                            className={cn(
                              "text-[13px] font-bold",
                              getDerivedPriority(selectedLead.leadScore) ===
                                "High"
                                ? "text-rose-700"
                                : getDerivedPriority(selectedLead.leadScore) ===
                                    "Medium"
                                  ? "text-amber-700"
                                  : "text-blue-700",
                            )}
                          >
                            {getDerivedPriority(selectedLead.leadScore)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </PageContainer>
  );
}
