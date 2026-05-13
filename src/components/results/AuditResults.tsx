"use client";

import { useState } from "react";
import type { AuditResult, ToolRecommendation } from "@/types";
import { LeadCapture } from "./LeadCapture";

interface AuditResultsProps {
  result: AuditResult;
  onReset: () => void;
}

const ACTION_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  keep:        { label: "Optimal",       color: "text-brand-700",  bg: "bg-brand-50",  border: "border-brand-200", dot: "bg-brand-500" },
  downgrade:   { label: "Downgrade",     color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500" },
  switch_plan: { label: "Switch Plan",   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500" },
  switch_tool: { label: "Switch Tool",   color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-500"   },
  use_credits: { label: "Use Credits",   color: "text-sky-700",    bg: "bg-sky-50",    border: "border-sky-200",   dot: "bg-sky-500"   },
  consolidate: { label: "Consolidate",   color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",dot: "bg-purple-500" },
};

const ACTION_ICONS: Record<string, string> = {
  keep: "✓", downgrade: "↓", switch_plan: "↔", switch_tool: "⇄", use_credits: "💰", consolidate: "🔗",
};

export function AuditResults({ result, onReset }: AuditResultsProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  const hasSignificantSavings = result.totalMonthlySavings >= 500;
  const isOptimal = result.totalMonthlySavings < 100;
  const savingsPct = result.totalCurrentSpend > 0
    ? Math.round((result.totalMonthlySavings / result.totalCurrentSpend) * 100)
    : 0;

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${result.id}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopying(true);
      setTimeout(() => setCopying(false), 2500);
    } catch {
      // Fallback: just show the URL
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">

      {/* ── Back button ── */}
      <button
        onClick={onReset}
        className="mb-8 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-all hover:bg-surface-muted hover:text-ink font-body"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Run another audit
      </button>

      {/* ── Savings Hero ── */}
      <div className="savings-hero noise-bg mb-8 overflow-hidden">
        <div className="relative z-10">
          {isOptimal ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60 font-body">
                  Audit Result
                </div>
                <h2 className="font-display text-4xl sm:text-5xl">
                  You&apos;re spending well 👏
                </h2>
                <p className="mt-3 max-w-md text-white/75 font-body leading-relaxed">
                  Your current AI tool setup is close to optimal. No major savings to capture right now.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60 font-body">
                Potential Savings Found
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <div className="font-display text-6xl sm:text-7xl animate-count-up leading-none">
                    ${result.totalMonthlySavings.toLocaleString()}
                  </div>
                  <div className="mt-1 text-white/60 font-body text-sm">per month</div>
                </div>
                <div className="pb-1">
                  <div className="font-display text-3xl sm:text-4xl text-white/85 leading-none">
                    ${result.totalAnnualSavings.toLocaleString()}
                  </div>
                  <div className="mt-1 text-white/60 font-body text-sm">per year</div>
                </div>
                {savingsPct > 0 && (
                  <div className="pb-1">
                    <div className="font-display text-3xl sm:text-4xl text-emerald-300 leading-none">
                      {savingsPct}%
                    </div>
                    <div className="mt-1 text-white/60 font-body text-sm">of current spend</div>
                  </div>
                )}
              </div>
              {result.credexSavingsEstimate > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 font-body backdrop-blur-sm">
                  💰 +${result.credexSavingsEstimate}/mo additional via Credex discounted credits
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spend comparison bar */}
        {!isOptimal && result.totalCurrentSpend > 0 && (
          <div className="relative z-10 mt-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-2 flex justify-between text-xs text-white/60 font-body">
              <span>Current spend</span>
              <span>Optimized spend</span>
            </div>
            <div className="relative h-2 rounded-full bg-white/10">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-white/40"
                style={{ width: "100%" }}
              />
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-emerald-400 transition-all duration-1000"
                style={{ width: `${Math.max(5, 100 - savingsPct)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm font-semibold font-body">
              <span className="text-white/60 line-through">${result.totalCurrentSpend.toLocaleString()}/mo</span>
              <span className="text-emerald-300">${result.totalOptimizedSpend.toLocaleString()}/mo</span>
            </div>
          </div>
        )}

        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* ── AI Summary ── */}
      {result.aiSummary && (
        <div className="mb-8 rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-emerald-100 text-xl">
              🧠
            </div>
            <div>
              <h3 className="mb-2 font-display text-lg text-ink">
                AI-Powered Analysis
              </h3>
              <p className="text-ink-muted font-body leading-relaxed">
                {result.aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Per-Tool Breakdown ── */}
      <div className="mb-8">
        <h3 className="mb-5 font-display text-2xl text-ink">
          Per-Tool Breakdown
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <ToolCard key={i} rec={rec} />
          ))}
        </div>
      </div>

      {/* ── Credex CTA ── */}
      {hasSignificantSavings && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 to-emerald-600 p-6 text-white shadow-lg shadow-brand-600/20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70 font-body">
                High-savings alert
              </div>
              <h3 className="font-display text-2xl">
                Capture even more with Credex
              </h3>
              <p className="mt-2 max-w-sm text-white/80 font-body text-sm leading-relaxed">
                Credex sources discounted AI credits from companies that overforecast.
                Real savings, same tools — typically 15–30% off retail.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 whitespace-nowrap font-body"
            >
              Book a Consultation →
            </a>
          </div>
        </div>
      )}

      {/* ── Lead Capture ── */}
      <LeadCapture
        auditId={result.id}
        totalMonthlySavings={result.totalMonthlySavings}
        isOptimal={isOptimal}
      />

      {/* ── Share ── */}
      <div className="mt-8 rounded-2xl border border-ink/5 bg-surface-muted p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <h4 className="font-display text-lg text-ink">Share this audit</h4>
            <p className="mt-1 text-sm text-ink-muted font-body">
              Public link — company name and email are stripped.
            </p>
          </div>
          <button
            onClick={handleShare}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all font-body ${
              copying
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "border border-ink/10 bg-white text-ink hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {copying ? (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Audit
              </>
            )}
          </button>
        </div>
        {shareUrl && !copying && (
          <div className="mt-4 rounded-lg border border-ink/5 bg-white px-4 py-2">
            <p className="text-xs text-ink-light font-mono break-all">{shareUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tool Card ───────────────────────────────────────────────────────────────

function ToolCard({ rec }: { rec: ToolRecommendation }) {
  const meta = ACTION_META[rec.action] || ACTION_META.keep;
  const icon = ACTION_ICONS[rec.action] || "✓";

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-sm ${meta.border} bg-white`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm ${meta.bg} ${meta.color}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-display text-lg text-ink leading-tight">{rec.toolName}</h4>
            <p className="text-sm text-ink-muted font-body">
              {rec.currentPlan} · ${rec.currentSpend}/mo
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}>
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {rec.action !== "keep" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted px-4 py-3">
          <span className="font-mono text-sm text-ink-muted line-through">${rec.currentSpend}/mo</span>
          <svg className="h-4 w-4 text-ink-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-mono text-sm font-bold text-brand-700">${rec.newSpend}/mo</span>
          {(rec.recommendedPlan || rec.recommendedTool) && (
            <span className="rounded-md bg-white border border-ink/5 px-2 py-0.5 text-xs text-ink-muted font-body">
              {rec.recommendedPlan || rec.recommendedTool}
            </span>
          )}
          <span className="ml-auto font-mono text-sm font-bold text-brand-600">
            Save ${rec.monthlySavings}/mo
          </span>
        </div>
      )}

      <p className="mt-3 text-sm text-ink-muted font-body leading-relaxed">
        {rec.reason}
      </p>
    </div>
  );
}
