"use client";

import { useState, useEffect } from "react";
import { AI_TOOLS } from "@/lib/pricing-data";
import { runAudit, generateFallbackSummary } from "@/lib/audit-engine";
import type { AuditInput, AuditResult, ToolEntry, UseCase } from "@/types";

interface SpendFormProps {
  onSubmit: (result: AuditResult) => void;
}

const USE_CASES: { value: UseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Coding & Development", icon: "💻" },
  { value: "writing", label: "Writing & Content", icon: "✍️" },
  { value: "data", label: "Data Analysis", icon: "📊" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "mixed", label: "Mixed / Multiple", icon: "🔀" },
];

const STORAGE_KEY = "stackaudit_form_state";

interface FormState {
  entries: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

function getDefaultEntry(): ToolEntry {
  return {
    toolId: AI_TOOLS[0].id,
    planId: AI_TOOLS[0].plans[0].id,
    seats: 1,
    monthlySpend: 0,
  };
}

export function SpendForm({ onSubmit }: SpendFormProps) {
  const [entries, setEntries] = useState<ToolEntry[]>([getDefaultEntry()]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [isLoading, setIsLoading] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: FormState = JSON.parse(saved);
        if (state.entries?.length > 0) {
          setEntries(state.entries);
          setTeamSize(state.teamSize || 5);
          setUseCase(state.useCase || "coding");
          setRestored(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    try {
      const state: FormState = { entries, teamSize, useCase };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [entries, teamSize, useCase]);

  const addTool = () => {
    setEntries((prev) => [...prev, getDefaultEntry()]);
  };

  const removeTool = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, updates: Partial<ToolEntry>) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const updated = { ...entry, ...updates };

        if (updates.toolId || updates.planId || updates.seats) {
          const tool = AI_TOOLS.find((t) => t.id === updated.toolId);
          const plan = tool?.plans.find((p) => p.id === updated.planId);
          if (plan && plan.pricePerSeat > 0) {
            updated.monthlySpend = plan.pricePerSeat * updated.seats;
          }
        }

        if (updates.toolId) {
          const newTool = AI_TOOLS.find((t) => t.id === updates.toolId);
          if (newTool) {
            updated.planId = newTool.plans[0].id;
            const plan = newTool.plans[0];
            updated.monthlySpend = plan.pricePerSeat * updated.seats;
          }
        }

        return updated;
      })
    );
  };

  const totalMonthlySpend = entries.reduce((sum, e) => sum + (e.monthlySpend || 0), 0);

  const handleSubmit = async () => {
    setIsLoading(true);

    const input: AuditInput = {
      tools: entries.filter((e) => e.monthlySpend > 0 || e.toolId),
      teamSize,
      primaryUseCase: useCase,
    };

    try {
      const result = runAudit(input);

      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
        if (res.ok) {
          const data = await res.json();
          result.aiSummary = data.summary;
        } else {
          result.aiSummary = generateFallbackSummary(result);
        }
      } catch {
        result.aiSummary = generateFallbackSummary(result);
      }

      try {
        await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
      } catch {
        // Non-blocking
      }

      onSubmit(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {restored && (
        <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 font-body">
          <svg className="h-4 w-4 flex-shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Previous session restored — pick up where you left off.
        </div>
      )}

      {/* ── Team Info ── */}
      <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-dark text-white text-xs font-bold font-body">
            1
          </div>
          <h3 className="text-base font-semibold text-ink font-body">Your team</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="team-size" className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5 font-body">
              Team size
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              max={10000}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="use-case" className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5 font-body">
              Primary use case
            </label>
            <select
              id="use-case"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
              className="select-field"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>
                  {uc.icon} {uc.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Tool Entries ── */}
      <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-dark text-white text-xs font-bold font-body">
            2
          </div>
          <h3 className="text-base font-semibold text-ink font-body">AI tools you pay for</h3>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => {
            const selectedTool = AI_TOOLS.find((t) => t.id === entry.toolId);
            return (
              <div
                key={index}
                className="group relative rounded-xl border border-ink/8 bg-surface-muted p-5 transition-all hover:border-brand-200 hover:shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700 font-body">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-ink font-body">
                      {selectedTool ? `${selectedTool.icon} ${selectedTool.name}` : `Tool ${index + 1}`}
                    </span>
                    {entry.monthlySpend > 0 && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink-muted font-body">
                        ${entry.monthlySpend.toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                  {entries.length > 1 && (
                    <button
                      onClick={() => removeTool(index)}
                      className="rounded-lg p-1.5 text-ink-light opacity-0 transition-all hover:bg-red-50 hover:text-accent-red group-hover:opacity-100"
                      aria-label={`Remove tool ${index + 1}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor={`tool-${index}`} className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1 font-body">
                      Tool
                    </label>
                    <select
                      id={`tool-${index}`}
                      value={entry.toolId}
                      onChange={(e) => updateEntry(index, { toolId: e.target.value })}
                      className="select-field text-sm"
                    >
                      {AI_TOOLS.map((tool) => (
                        <option key={tool.id} value={tool.id}>
                          {tool.icon} {tool.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`plan-${index}`} className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1 font-body">
                      Plan
                    </label>
                    <select
                      id={`plan-${index}`}
                      value={entry.planId}
                      onChange={(e) => updateEntry(index, { planId: e.target.value })}
                      className="select-field text-sm"
                    >
                      {selectedTool?.plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                          {plan.pricePerSeat > 0 ? ` — $${plan.pricePerSeat}/seat` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`seats-${index}`} className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1 font-body">
                      Seats
                    </label>
                    <input
                      id={`seats-${index}`}
                      type="number"
                      min={1}
                      max={10000}
                      value={entry.seats}
                      onChange={(e) =>
                        updateEntry(index, { seats: Math.max(1, parseInt(e.target.value) || 1) })
                      }
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor={`spend-${index}`} className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1 font-body">
                      Monthly ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted font-body">$</span>
                      <input
                        id={`spend-${index}`}
                        type="number"
                        min={0}
                        step={1}
                        value={entry.monthlySpend}
                        onChange={(e) =>
                          updateEntry(index, { monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })
                        }
                        className="input-field pl-7 text-sm"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={addTool}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/10 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 font-body"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add another tool
        </button>
      </div>

      {/* ── Live Spend Total + Submit ── */}
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-muted font-body mb-1">Total monthly AI spend</p>
            <p className="font-display text-4xl text-ink">
              ${totalMonthlySpend.toLocaleString()}
              <span className="text-xl text-ink-muted font-body font-normal">/mo</span>
            </p>
            {totalMonthlySpend > 0 && (
              <p className="text-sm text-ink-muted font-body mt-1">
                ${(totalMonthlySpend * 12).toLocaleString()} per year
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || entries.length === 0}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 hover:shadow-brand-500/35 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-body"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing your stack...
              </>
            ) : (
              <>
                Get My Free Audit
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-light font-body">
          Free forever · No account needed · Instant results
        </p>
      </div>
    </div>
  );
}
