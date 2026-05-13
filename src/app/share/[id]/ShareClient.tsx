"use client";

import { useEffect, useState } from "react";
import type { ToolRecommendation } from "@/types";

interface SharedData {
  id: string;
  recommendations: ToolRecommendation[];
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  keep: { label: "✓ Optimal", color: "text-brand-600 bg-brand-50" },
  downgrade: { label: "↓ Downgrade", color: "text-amber-700 bg-amber-50" },
  switch_plan: { label: "↔ Switch Plan", color: "text-amber-700 bg-amber-50" },
  switch_tool: { label: "⇄ Switch Tool", color: "text-red-600 bg-red-50" },
  use_credits: { label: "💰 Use Credits", color: "text-sky-700 bg-sky-50" },
  consolidate: { label: "🔗 Consolidate", color: "text-purple-700 bg-purple-50" },
};

export default function ShareClient({ auditId }: { auditId: string }) {
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/audit?id=${auditId}`);
        if (!res.ok) {
          setError("Audit not found or expired.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load audit. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [auditId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="text-ink-muted font-body">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-ink mb-4">Audit Not Found</h1>
          <p className="text-ink-muted font-body mb-6">
            {error || "This audit link may be invalid or expired."}
          </p>
          <a href="/" className="btn-primary">
            Run Your Own Audit →
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <a href="/" className="font-display text-2xl text-ink hover:text-brand-600 transition-colors">
          StackAudit
        </a>
        <p className="text-sm text-ink-light font-body mt-1">
          Shared audit result
        </p>
      </div>

      {/* Savings hero */}
      <div className="savings-hero noise-bg mb-10">
        <div className="relative z-10">
          {data.totalMonthlySavings < 100 ? (
            <>
              <div className="text-white/80 text-sm font-body uppercase tracking-wider mb-2">
                AI Stack Status
              </div>
              <h2 className="font-display text-4xl sm:text-5xl">
                Well-optimized stack 👏
              </h2>
            </>
          ) : (
            <>
              <div className="text-white/80 text-sm font-body uppercase tracking-wider mb-2">
                Potential Savings
              </div>
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <span className="font-display text-5xl sm:text-6xl">
                    ${data.totalMonthlySavings.toLocaleString()}
                  </span>
                  <span className="text-white/70 font-body ml-2">/month</span>
                </div>
                <div>
                  <span className="font-display text-3xl text-white/90">
                    ${data.totalAnnualSavings.toLocaleString()}
                  </span>
                  <span className="text-white/70 font-body ml-2">/year</span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* AI Summary */}
      {data.aiSummary && (
        <div className="card mb-8 bg-surface-muted border-brand-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧠</span>
            <p className="text-ink-muted font-body leading-relaxed">
              {data.aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <h3 className="font-display text-2xl text-ink mb-6">Recommendations</h3>
      <div className="space-y-4 mb-10">
        {data.recommendations.map((rec, i) => {
          const meta = ACTION_LABELS[rec.action] || ACTION_LABELS.keep;
          return (
            <div key={i} className="tool-card" data-action={rec.action}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-xl text-ink">{rec.toolName}</h4>
                  <p className="text-sm text-ink-muted font-body">
                    {rec.currentPlan} — ${rec.currentSpend}/mo
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
              {rec.action !== "keep" && (
                <div className="flex flex-wrap items-center gap-3 text-sm font-body">
                  <span className="text-ink-muted line-through">${rec.currentSpend}/mo</span>
                  <span className="text-ink font-semibold">→</span>
                  <span className="text-brand-700 font-semibold">${rec.newSpend}/mo</span>
                  <span className="ml-auto font-mono text-brand-600 font-semibold">
                    Save ${rec.monthlySavings}/mo
                  </span>
                </div>
              )}
              <p className="text-sm text-ink-muted font-body leading-relaxed">{rec.reason}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center">
        <a href="/" className="btn-primary text-lg">
          Run Your Own Free Audit →
        </a>
        <p className="mt-4 text-sm text-ink-light font-body">
          Powered by <a href="https://credex.rocks" className="underline underline-offset-2 hover:text-ink">Credex</a>
        </p>
      </div>
    </main>
  );
}
