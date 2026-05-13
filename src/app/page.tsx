"use client";

import { useState } from "react";
import { SpendForm } from "@/components/forms/SpendForm";
import { AuditResults } from "@/components/results/AuditResults";
import { AuditResult } from "@/types";

const TOOLS_MARQUEE = [
  "⚡ Cursor", "🤖 Claude", "💬 ChatGPT", "🐙 GitHub Copilot",
  "🌊 Windsurf", "♊ Gemini", "🔷 Anthropic API", "🟢 OpenAI API",
];

const STEPS = [
  {
    number: "01",
    icon: "📋",
    title: "Add your tools",
    description: "List every AI tool your team pays for — plan, seats, and monthly spend.",
  },
  {
    number: "02",
    icon: "🔍",
    title: "Get your audit",
    description: "Our engine checks every plan against real pricing and usage patterns.",
  },
  {
    number: "03",
    icon: "💰",
    title: "Capture the savings",
    description: "See exactly what to switch, downgrade, or consolidate — with dollar figures.",
  },
];

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  return (
    <main id="main-content" className="relative min-h-screen bg-surface">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-surface-dark/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm">
              S
            </div>
            <span className="font-display text-xl text-white tracking-tight">StackAudit</span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-300 border border-brand-500/30">
              Free
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-white/50 font-body">by Credex</span>
            {!auditResult && (
              <a
                href="#audit-form"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30 font-body"
              >
                Start Free Audit →
              </a>
            )}
          </div>
        </div>
      </nav>

      {!auditResult && (
        <>
          {/* ── Hero Section ── */}
          <section className="noise-bg relative overflow-hidden bg-surface-dark text-white">
            {/* Background decorative orbs */}
            <div className="pointer-events-none absolute -left-60 -top-60 h-[500px] w-[500px] rounded-full bg-brand-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand-400/5 blur-2xl" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">

              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-body backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                </span>
                Free tool — no login required
              </div>

              {/* Headline */}
              <h1 className="font-display text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                Your AI stack is
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-300 via-emerald-300 to-brand-400 bg-clip-text text-transparent">
                    costing too much
                  </span>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 font-body leading-relaxed sm:text-xl">
                Most startups waste{" "}
                <span className="text-white/90 font-semibold">20–40%</span> of their AI budget on
                wrong plans, unused seats, and retail pricing.
                <br className="hidden sm:block" />
                Get a free audit in under 60 seconds.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="#audit-form"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand-600/30 transition-all hover:bg-brand-400 hover:shadow-brand-500/40 hover:-translate-y-0.5 font-body"
                  aria-label="Start your free audit"
                >
                  Audit My AI Spend
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
                <span className="text-sm text-white/40 font-body">No credit card. No login. Ever.</span>
              </div>

              {/* Trust signals */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/35 font-body">
                {["8 AI tools covered", "Current pricing data", "Instant results", "Shareable report URL"].map((s) => (
                  <span key={s} className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Scrolling tool marquee */}
            <div className="relative z-10 overflow-hidden border-t border-white/5 bg-white/[0.02] py-4">
              <div className="flex animate-marquee items-center gap-8 whitespace-nowrap">
                {[...TOOLS_MARQUEE, ...TOOLS_MARQUEE].map((tool, i) => (
                  <span key={i} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/50 font-body">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── How it works ── */}
          <section className="bg-surface py-20">
            <div className="mx-auto max-w-5xl px-6">
              <div className="mb-14 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 font-body">
                  How it works
                </p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">
                  From spend to savings in three steps
                </h2>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-ink/5 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
                        {step.icon}
                      </span>
                      <span className="font-mono text-2xl font-bold text-brand-200">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mb-2 font-display text-xl text-ink">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted font-body">{step.description}</p>
                    {i < STEPS.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-ink-light md:block text-2xl">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Divider ── */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

          {/* ── Form Section ── */}
          <section id="audit-form" className="bg-surface-muted py-20">
            <div className="mx-auto max-w-4xl px-6">
              <div className="mb-10 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 font-body">
                  Step 1 of 1
                </p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">
                  What AI tools does your team use?
                </h2>
                <p className="mt-3 text-ink-muted font-body max-w-xl mx-auto">
                  Add each tool below. We&apos;ll analyze your spend and surface real savings — no fluff, no manufactured numbers.
                </p>
              </div>
              <SpendForm onSubmit={setAuditResult} />
            </div>
          </section>
        </>
      )}

      {/* ── Results Section ── */}
      {auditResult && (
        <AuditResults
          result={auditResult}
          onReset={() => setAuditResult(null)}
        />
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-ink/5 bg-surface-dark">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-xs">
                S
              </div>
              <div>
                <span className="font-display text-lg text-white">StackAudit</span>
                <span className="ml-2 text-sm text-white/30 font-body">
                  by{" "}
                  <a
                    href="https://credex.rocks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 underline underline-offset-2 transition-colors hover:text-white/80"
                  >
                    Credex
                  </a>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-end">
              <p className="text-sm text-white/30 font-body">
                Pricing data updated weekly. Not financial advice.
              </p>
              <p className="text-xs text-white/20 font-body">
                Credex — discounted AI infrastructure credits for startups
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
