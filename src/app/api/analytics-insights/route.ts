import { NextRequest, NextResponse } from "next/server";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AnalyticsPayload {
  grokKey?: string;
  openaiKey?: string;
  analytics: {
    totalLeads: number;
    activeLeads: number;
    highQualityLeads: number;
    avgLeadScore: number;
    conversionRate: number;

    statusDistribution: Record<string, number>;
    sourceDistribution: Record<string, number>;
    scoreTiers: { hot: number; warm: number; cold: number; notInterested: number };
    intentDistribution: Record<string, number>;
    urgencyDistribution: Record<string, number>;
    businessTypeDistribution: Record<string, number>;

    appointments: {
      total: number;
      upcoming: number;
      completed: number;
      noShow: number;
      cancelled: number;
      showRate: number;
      reminderSuccessRate: number;
    };

    followUps: {
      total: number;
      pending: number;
      completed: number;
      overdue: number;
      completionRate: number;
    };

    conversations: {
      totalMessages: number;
      uniqueLeads: number;
      ownerMessages: number;
      aiMessages: number;
      avgMessagesPerLead: number;
    };

    revenue: {
      pipelineValue: number;
      avgBudget: number;
      qualifyingLeadCount: number;
    };

    todaySnapshot: {
      newLeads: number;
      conversationsToday: number;
      messagesToday: number;
      appointmentsToday: number;
      followUpsDueToday: number;
    };
  };
}

interface AIInsightsResponse {
  keyInsights: string[];
  opportunities: string[];
  recommendedActions: string[];
  attentionRequired: string[];
}

// ─── Prompt Builder ─────────────────────────────────────────────────────────

function buildPrompt(data: AnalyticsPayload["analytics"]): string {
  const {
    totalLeads,
    activeLeads,
    highQualityLeads,
    avgLeadScore,
    conversionRate,
    statusDistribution,
    sourceDistribution,
    scoreTiers,
    intentDistribution,
    urgencyDistribution,
    businessTypeDistribution,
    appointments,
    followUps,
    conversations,
    revenue,
    todaySnapshot,
  } = data;

  return `You are a business intelligence advisor for a CRM system. Analyze the following live CRM data and produce structured insights.

## CRM Data Summary

**Lead Overview:**
- Total Leads: ${totalLeads}
- Active Leads: ${activeLeads}
- High Quality Leads (score > 7): ${highQualityLeads}
- Average Lead Score: ${avgLeadScore.toFixed(1)} / 10
- Conversion Rate: ${conversionRate.toFixed(1)}%

**Lead Status Pipeline:**
${Object.entries(statusDistribution).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**Lead Sources:**
${Object.entries(sourceDistribution).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**Lead Score Tiers:**
- Hot (8-10): ${scoreTiers.hot}
- Warm (6-7): ${scoreTiers.warm}
- Cold (3-5): ${scoreTiers.cold}
- Not Interested (0-2): ${scoreTiers.notInterested}

**Intent Distribution:**
${Object.entries(intentDistribution).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**Urgency Distribution:**
${Object.entries(urgencyDistribution).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**Business Types:**
${Object.entries(businessTypeDistribution).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**Appointments:**
- Total Booked: ${appointments.total}
- Upcoming: ${appointments.upcoming}
- Completed: ${appointments.completed}
- No-Shows: ${appointments.noShow}
- Cancelled: ${appointments.cancelled}
- Show Rate: ${appointments.showRate.toFixed(1)}%
- Reminder Success Rate: ${appointments.reminderSuccessRate.toFixed(1)}%

**Follow-Ups:**
- Pending: ${followUps.pending}
- Completed: ${followUps.completed}
- Overdue: ${followUps.overdue}
- Completion Rate: ${followUps.completionRate.toFixed(1)}%

**Conversations:**
- Total Messages: ${conversations.totalMessages}
- Unique Leads in Conversation: ${conversations.uniqueLeads}
- Owner Messages: ${conversations.ownerMessages}
- AI Messages: ${conversations.aiMessages}
- Avg Messages Per Lead: ${conversations.avgMessagesPerLead.toFixed(1)}

**Revenue Potential (Qualifying Leads Only):**
- Pipeline Value: $${revenue.pipelineValue.toLocaleString()}
- Average Budget: $${revenue.avgBudget.toLocaleString()}
- Qualifying Leads: ${revenue.qualifyingLeadCount}

**Today's Snapshot:**
- New Leads Today: ${todaySnapshot.newLeads}
- Conversations Today: ${todaySnapshot.conversationsToday}
- Messages Today: ${todaySnapshot.messagesToday}
- Appointments Today: ${todaySnapshot.appointmentsToday}
- Follow-Ups Due Today: ${todaySnapshot.followUpsDueToday}

---

## Instructions

Based on this data, generate business insights in the following JSON format. Each item must be 1–2 short sentences, written in plain business language. No technical terms. No AI jargon. Be specific using the numbers above.

Return ONLY valid JSON — no markdown fences, no extra text:

{
  "keyInsights": ["...", "...", "..."],
  "opportunities": ["...", "...", "..."],
  "recommendedActions": ["...", "...", "..."],
  "attentionRequired": ["...", "...", "..."]
}

Rules:
- keyInsights: 3-4 facts about current business performance (use real numbers)
- opportunities: 3 growth or revenue opportunities you spot in the data
- recommendedActions: 3-4 specific actions the owner should take TODAY or this week
- attentionRequired: 2-4 urgent issues that need immediate attention
- Never say "I" or "As an AI". Write directly to the business owner.
- Keep each item under 25 words.`;
}

// ─── AI Call Helpers ────────────────────────────────────────────────────────

async function callGrok(
  apiKey: string,
  prompt: string
): Promise<AIInsightsResponse | null> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content:
            "You are a business intelligence advisor. Always respond with valid JSON only. No markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseInsights(text);
}

async function callOpenAI(
  apiKey: string,
  prompt: string
): Promise<AIInsightsResponse | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a business intelligence advisor. Always respond with valid JSON only. No markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseInsights(text);
}

function parseInsights(raw: string): AIInsightsResponse | null {
  try {
    // Strip markdown fences if model adds them despite instructions
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (
      Array.isArray(parsed.keyInsights) &&
      Array.isArray(parsed.opportunities) &&
      Array.isArray(parsed.recommendedActions) &&
      Array.isArray(parsed.attentionRequired)
    ) {
      return parsed as AIInsightsResponse;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsPayload = await request.json();
    const { grokKey, openaiKey, analytics } = body;

    if (!analytics) {
      return NextResponse.json(
        { error: "Analytics data is required" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(analytics);
    let insights: AIInsightsResponse | null = null;

    // Priority 1: Grok
    if (grokKey) {
      insights = await callGrok(grokKey, prompt);
    }

    // Priority 2: OpenAI fallback
    if (!insights && openaiKey) {
      insights = await callOpenAI(openaiKey, prompt);
    }

    // No provider available
    if (!insights) {
      return NextResponse.json(
        {
          error: "no_provider",
          message:
            "Configure an AI provider in Settings to enable Analytics Insights.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("Analytics insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
