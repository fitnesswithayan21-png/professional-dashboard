/* eslint-disable */
"use client";

import { useState, useMemo } from "react";
import { useCRMStore } from "@/store/crm-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDateTime, cn } from "@/lib/utils";
import {
  List,
  Search,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Zap,
  Play,
  Plus,
  Sliders,
  TrendingUp,
  CheckCheck,
  Mail,
  Smartphone,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { DashboardGrid } from "@/components/ui/DashboardGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";

export default function FollowUpsPage() {
  const { followUps } = useCRMStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...followUps];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.leadName.toLowerCase().includes(s) ||
          f.followUpMessage.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((f) => f.status === statusFilter);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.scheduledTime).getTime();
      const timeB = new Date(b.scheduledTime).getTime();
      return sortDir === "asc" ? timeA - timeB : timeB - timeA;
    });
    return result;
  }, [followUps, search, statusFilter, sortDir]);

  const stats = useMemo(() => {
    const total = followUps.length;
    const pending = followUps.filter((f) => f.status === "pending").length;
    const completed = followUps.filter(
      (f) => f.status === "completed" || f.status === "sent",
    ).length;
    const responseRate =
      total > 0
        ? Math.round(
            (followUps.filter((f) => f.responseReceived).length / total) * 100,
          )
        : 0;

    return { total, pending, completed, responseRate };
  }, [followUps]);

  return (
    <PageContainer>
      <SectionHeader
        title="Follow-ups & Outreach"
        description="Monitor automated sequences, delivery states, and dispatch outbound outreach campaigns."
        action={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-9 text-sm font-medium">
            New Sequence
          </Button>
        }
      />

      <DashboardGrid columns={4}>
        <MetricCard
          label="Total Queue"
          value={stats.total.toString()}
          sub="100% Automated"
          icon={List}
        />
        <MetricCard
          label="Outbox Pending"
          value={stats.pending.toString()}
          sub="Auto-dispatching"
          icon={Clock}
        />
        <MetricCard
          label="Delivered Outreach"
          value={stats.completed.toString()}
          sub="99.8% Success"
          icon={Send}
        />
        <MetricCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          trend={{ value: "2", type: "up" }}
          sub="Above Benchmark"
          icon={MessageSquare}
        />
      </DashboardGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Queue Timeline */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full sm:w-auto">
              {["all", "pending", "sent", "completed", "failed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5",
                      statusFilter === status
                        ? "bg-slate-900 border-slate-950 text-white"
                        : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <span>{status === "all" ? "All Queue" : status}</span>
                    <span
                      className={cn(
                        "px-1 py-0.25 rounded text-[9px] font-bold",
                        statusFilter === status
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {status === "all"
                        ? followUps.length
                        : followUps.filter((f) => f.status === status).length}
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto shrink-0 ml-auto">
              <div className="relative flex-1 sm:w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border-none text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="text-xs font-semibold h-8 shrink-0 border-slate-200"
              >
                {sortDir === "desc" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>

          {/* Timeline Log */}
          <div className="relative pl-6 space-y-4">
            <span className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-slate-200" />

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-slate-400 bg-white border border-slate-200 rounded-xl">
                No outbound follow-ups match parameters.
              </div>
            ) : (
              filtered.map((fu) => (
                <div key={fu.id} className="relative group">
                  <div className="absolute -left-[27px] top-1.5 z-10">
                    <Avatar
                      name={fu.leadName}
                      size="sm"
                      className="ring-4 ring-[#F8FAFC] shadow-sm border border-slate-200"
                    />
                  </div>

                  <Card className="bg-white border border-slate-200 p-4 relative overflow-hidden group hover:border-slate-350 transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {fu.leadName}
                          </h4>
                          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                            Step #{fu.followUpNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{fu.id}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-650 leading-relaxed font-light">
                          {fu.followUpMessage}
                        </p>
                      </div>

                      <div className="flex md:flex-col items-end justify-between shrink-0 gap-2 self-end md:self-auto">
                        <Badge status={fu.status} />
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          <span>{formatDateTime(fu.scheduledTime)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 mt-3 text-[10px] font-bold uppercase tracking-wider">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px]",
                          fu.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : fu.status === "failed"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-250",
                        )}
                      >
                        <Send className="h-3 w-3" />
                        <span>Status: {fu.status}</span>
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px]",
                          fu.messageSent
                            ? "bg-emerald-55 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200",
                        )}
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span>
                          Delivery: {fu.messageSent ? "Sent" : "Pending"}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px]",
                          fu.responseReceived
                            ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse"
                            : "bg-slate-50 text-slate-400 border-slate-200",
                        )}
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>
                          Engagement:{" "}
                          {fu.responseReceived ? "Replied" : "No reply"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Auto Sequence Template Manager */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-white border border-slate-200 p-4">
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              AI Outreach Sequences
            </h3>

            <div className="space-y-4">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-cyan-600" />
                    Day 1: Intro Cold Message
                  </span>
                  <Badge status="active" />
                </div>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  "Hi {"{Name}"}, noticed {"{Company}"} is scaling virtual
                  workflows. Our AI agent qualifies leads automatically in
                  real-time. Can I share a quick 2-min demo link?"
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1.5">
                  <span>98% Sent</span>
                  <span className="text-blue-600">42% Reply</span>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                    Day 3: SMS Follow-Up
                  </span>
                  <Badge status="active" />
                </div>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  "Hey {"{Name}"}, follow-up on my email. NexusAI overrides CRM
                  objection templates automatically to save 30 hrs/week. Do you
                  have 10 mins this Wed?"
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1.5">
                  <span>80% Sent</span>
                  <span className="text-blue-600">60% Reply</span>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2 opacity-65">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Day 7: Breakup Note
                  </span>
                  <Badge status="queued" />
                </div>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  "Name, closing this ticket for now. If you ever want to
                  automate sheet telemetry workflows, feel free to reactivate."
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4 text-[12px] font-semibold border-slate-250 text-slate-700 h-9"
            >
              Configure AI templates →
            </Button>
          </Card>

          <Card className="bg-white border border-slate-200 p-4 space-y-3.5">
            <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-rose-500" />
              Manual Outreach Trigger
            </h4>

            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Trigger instant CRM lead sequencing outbound alerts. Select active
              sheet lists and override default Grok templates.
            </p>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold gap-1.5 bg-[#2563EB] hover:bg-blue-700 shadow-xs h-9"
              >
                <Play className="h-3 w-3 fill-current text-white/90" />
                Dispatch Email Outreach
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-semibold border-slate-200 text-slate-700 hover:text-slate-900 h-9"
              >
                Schedule SMS Batch
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
