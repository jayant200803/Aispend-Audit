import { NextRequest, NextResponse } from "next/server";
import type { AuditResult } from "@/types";

/**
 * POST /api/summary
 * Generates a ~100-word personalized audit summary using the Anthropic API.
 * Falls back to a rule-based summary if the API key is missing or the call fails.
 */
export async function POST(req: NextRequest) {
  try {
    const result: AuditResult = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { summary: "", fallback: true },
        { status: 200 }
      );
    }

    const actionableRecs = result.recommendations.filter(
      (r) => r.action !== "keep"
    );
    const toolSummary = result.recommendations
      .map(
        (r) =>
          `${r.toolName} (${r.currentPlan}, $${r.currentSpend}/mo): ${r.action} → ${r.reason}`
      )
      .join("\n");

    const prompt = `You are a concise, friendly AI cost advisor for startups. A ${result.input.teamSize}-person team primarily uses AI for "${result.input.primaryUseCase}".

Their current monthly AI spend is $${result.totalCurrentSpend}. After audit, we found $${result.totalMonthlySavings}/mo in potential savings ($${result.totalAnnualSavings}/year).

Tool breakdown:
${toolSummary}

Write a ~100-word personalized summary paragraph. Be specific about their stack. If savings are minimal (<$100/mo), praise their setup and suggest monitoring for pricing changes. If savings are significant, lead with the dollar amount and the #1 biggest opportunity. Mention Credex only if savings exceed $500/mo. Tone: direct, helpful, zero buzzwords. Do NOT use bullet points or headers — just one paragraph.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return NextResponse.json(
        { summary: "", fallback: true },
        { status: 200 }
      );
    }

    const data = await response.json();
    const summary =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return NextResponse.json({ summary, fallback: false });
  } catch (error) {
    console.error("Summary generation failed:", error);
    return NextResponse.json(
      { summary: "", fallback: true },
      { status: 200 }
    );
  }
}
