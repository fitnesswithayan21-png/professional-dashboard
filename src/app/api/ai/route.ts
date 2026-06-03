import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, provider, prompt, leadData } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Grok API (xAI) integration
    if (provider === "grok" || !provider) {
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
              content: `You are an AI sales analyst for a CRM system. Analyze lead data and provide actionable insights. Be concise and data-driven. Format your responses as JSON when requested.`,
            },
            {
              role: "user",
              content: leadData
                ? `${prompt}\n\nLead Data: ${JSON.stringify(leadData)}`
                : prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json(
          { error: `Grok API error: ${errorData}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        response: data.choices[0]?.message?.content || "No response generated",
        provider: "grok",
      });
    }

    // OpenAI integration
    if (provider === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are an AI sales analyst. Analyze lead data and provide actionable insights.",
              },
              {
                role: "user",
                content: leadData
                  ? `${prompt}\n\nLead Data: ${JSON.stringify(leadData)}`
                  : prompt,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: "OpenAI API error" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        response: data.choices[0]?.message?.content,
        provider: "openai",
      });
    }

    // Gemini integration
    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: leadData
                      ? `${prompt}\n\nLead Data: ${JSON.stringify(leadData)}`
                      : prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: "Gemini API error" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        response: data.candidates?.[0]?.content?.parts?.[0]?.text,
        provider: "gemini",
      });
    }

    // Claude integration
    if (provider === "claude") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: leadData
                ? `${prompt}\n\nLead Data: ${JSON.stringify(leadData)}`
                : prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Claude API error" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        response: data.content?.[0]?.text,
        provider: "claude",
      });
    }

    return NextResponse.json(
      { error: "Invalid provider specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
