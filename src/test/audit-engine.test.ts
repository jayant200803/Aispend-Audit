import { describe, it, expect } from "vitest";
import { runAudit, generateFallbackSummary } from "@/lib/audit-engine";
import type { AuditInput } from "@/types";

describe("Audit Engine", () => {
  // ── Test 1: Optimal spend — should return 'keep' with zero savings ──
  it("returns 'keep' when user is on an appropriately-priced plan", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-pro",
          seats: 3,
          monthlySpend: 60, // $20 × 3 = correct
        },
      ],
      teamSize: 3,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].action).toBe("keep");
    expect(result.recommendations[0].monthlySavings).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  // ── Test 2: Team plan overkill for small team → downgrade ──
  it("recommends downgrade when team plan is used with too few seats", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-business",
          seats: 2,
          monthlySpend: 80, // $40 × 2 = 80
        },
      ],
      teamSize: 2,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe("downgrade");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.newSpend).toBeLessThan(80);
  });

  // ── Test 3: Ultra tier when Pro suffices → switch_plan ──
  it("suggests cheaper plan for unnecessarily expensive tiers", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-ultra",
          seats: 1,
          monthlySpend: 200,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(["switch_plan", "downgrade"]).toContain(rec.action);
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.newSpend).toBeLessThan(200);
  });

  // ── Test 4: Gemini Ultra → Pro downgrade (bundled perks inflating price) ──
  it("recommends Gemini AI Pro when Ultra is overkill", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "gemini",
          planId: "gemini-ultra",
          seats: 5,
          monthlySpend: 1250, // $250 × 5
        },
      ],
      teamSize: 5,
      primaryUseCase: "writing",
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe("switch_plan");
    expect(rec.recommendedPlan).toBe("AI Pro");
    expect(rec.monthlySavings).toBeGreaterThan(1000);
  });

  // ── Test 5: High API spend triggers credit recommendation ──
  it("recommends credit optimization for high API spend", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "anthropic-api",
          planId: "anthropic-api-direct",
          seats: 1,
          monthlySpend: 500,
        },
      ],
      teamSize: 10,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe("use_credits");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reason).toContain("Batch API");
  });

  // ── Test 6: Multiple tools — total savings calculated correctly ──
  it("correctly sums savings across multiple tools", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "gemini",
          planId: "gemini-ultra",
          seats: 2,
          monthlySpend: 500,
        },
        {
          toolId: "chatgpt",
          planId: "chatgpt-pro-200",
          seats: 2,
          monthlySpend: 400,
        },
      ],
      teamSize: 5,
      primaryUseCase: "mixed",
    };

    const result = runAudit(input);
    const expectedTotalSavings = result.recommendations.reduce(
      (sum, r) => sum + r.monthlySavings,
      0
    );
    expect(result.totalMonthlySavings).toBe(expectedTotalSavings);
    expect(result.totalAnnualSavings).toBe(expectedTotalSavings * 12);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  // ── Test 7: Credex savings estimate is calculated ──
  it("includes Credex savings estimate for tools with action items", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "gemini",
          planId: "gemini-ultra",
          seats: 3,
          monthlySpend: 750,
        },
      ],
      teamSize: 3,
      primaryUseCase: "research",
    };

    const result = runAudit(input);
    expect(result.credexSavingsEstimate).toBeGreaterThanOrEqual(0);
    // Should be calculated as ~15% of optimized spend for actionable items
    expect(result.credexSavingsEstimate).toBeLessThan(result.totalOptimizedSpend);
  });

  // ── Test 8: Unknown tool/plan gracefully handled ──
  it("handles unknown tools gracefully with 'keep' recommendation", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "nonexistent-tool",
          planId: "nonexistent-plan",
          seats: 1,
          monthlySpend: 50,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe("keep");
    expect(rec.reason).toContain("Unknown");
    expect(result.totalMonthlySavings).toBe(0);
  });

  // ── Test 9: Fallback summary generates without AI ──
  it("generates a meaningful fallback summary", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "gemini",
          planId: "gemini-ultra",
          seats: 2,
          monthlySpend: 500,
        },
      ],
      teamSize: 5,
      primaryUseCase: "writing",
    };

    const result = runAudit(input);
    const summary = generateFallbackSummary(result);
    expect(summary).toBeTruthy();
    expect(summary.length).toBeGreaterThan(50);
    expect(summary).toContain("5-person team");
  });

  // ── Test 10: Optimal stack generates encouraging fallback ──
  it("generates encouraging summary when stack is already optimal", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-pro",
          seats: 1,
          monthlySpend: 20,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    result.recommendations = result.recommendations.map((r) => ({
      ...r,
      action: "keep" as const,
      monthlySavings: 0,
    }));
    result.totalMonthlySavings = 0;
    result.totalAnnualSavings = 0;

    const summary = generateFallbackSummary(result);
    expect(summary).toContain("well-optimized");
  });
});
