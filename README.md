# StackAudit — Free AI Spend Audit for Startups

> Stop overpaying for AI tools. Get a free, instant audit of your Cursor, Copilot, Claude, ChatGPT, Gemini & API spend — with real savings recommendations.

**Live:** [https://aispend-audit.vercel.app](https://aispend-audit.vercel.app)

---

## What It Does

StackAudit is a free web tool that helps startups figure out if they're overspending on AI tools. A user inputs their current tools (plans, seats, monthly spend), and StackAudit runs a rule-based audit that checks for plan/team-size mismatches, cheaper same-vendor alternatives, cross-tool substitutes, and bulk credit savings through Credex.

The result: a per-tool breakdown with specific, defensible recommendations and a total savings figure. High-savings users get nudged toward a Credex consultation. Every result is shareable via a unique URL with OG tags.

## Core Flow

1. **Input** → User adds AI tools (8+ supported), selects plans, enters seats & spend
2. **Audit** → Rule-based engine evaluates each tool against 5 optimization rules
3. **Results** → Savings hero, per-tool recommendations, AI-generated summary, Credex CTA
4. **Lead capture** → Email collection with Supabase storage, transactional email via Resend
5. **Share** → Unique URL with OG meta, PII stripped, public-safe

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR for OG tags, API routes, zero-config deploy |
| Language | TypeScript (strict) | Catches bugs before users do |
| Styling | Tailwind CSS | Fast iteration, consistent design tokens |
| Database | Supabase (Postgres) | Free tier, instant REST API, RLS |
| AI Summary | Anthropic API (Sonnet 4.6) | Fast, cheap, good at structured summaries |
| Email | Resend | Free tier, good DX, HTML templates |
| Testing | Vitest | Fast, ESM-native, Jest-compatible |
| CI | GitHub Actions | Lint + test + build on every push |
| Deploy | Vercel | Zero-config Next.js hosting |

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/aispend-audit.git
cd aispend-audit
npm install
cp env.example .env.local  # Fill in your keys
npm run dev                 # → http://localhost:3000
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon/public key
ANTHROPIC_API_KEY             — For AI-generated summaries (optional; fallback exists)
RESEND_API_KEY                — For transactional emails (optional)
NEXT_PUBLIC_APP_URL           — Your deployed URL
```

## Running Tests

```bash
npm run test        # Run all tests once
npm run test:watch  # Watch mode
```

10 tests covering: optimal spend detection, plan downgrades, cross-tool alternatives, API spend optimization, multi-tool aggregation, Credex savings, error handling, and fallback summary generation.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── audit/route.ts    — Save/retrieve audits (Supabase)
│   │   ├── lead/route.ts     — Lead capture + email + rate limiting
│   │   └── summary/route.ts  — Anthropic API summary with fallback
│   ├── share/[id]/           — Public shareable result page
│   ├── layout.tsx            — Root layout with OG meta
│   ├── page.tsx              — Landing + form + results
│   └── globals.css           — Tailwind + custom design system
├── components/
│   ├── forms/SpendForm.tsx   — Multi-tool input with localStorage
│   └── results/
│       ├── AuditResults.tsx  — Savings breakdown + share
│       └── LeadCapture.tsx   — Email capture with honeypot
├── lib/
│   ├── audit-engine.ts       — 5-rule optimization engine
│   ├── pricing-data.ts       — All 8 tools, all plans, verified prices
│   └── supabase.ts           — Client + schema
├── types/index.ts            — Full TypeScript types
└── test/
    ├── setup.ts
    └── audit-engine.test.ts  — 10 tests
```

## Supported Tools

Cursor · GitHub Copilot · Windsurf · Claude · ChatGPT · Google Gemini · Anthropic API · OpenAI API

All pricing data verified against official vendor pages in May 2026. See [PRICING_DATA.md](./PRICING_DATA.md) for sources.

## Documentation

| File | Contents |
|------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, trade-offs |
| [DEVLOG.md](./DEVLOG.md) | 7 daily development entries |
| [REFLECTION.md](./REFLECTION.md) | Answers to 5 reflection questions |
| [TESTS.md](./TESTS.md) | Testing strategy and coverage |
| [PRICING_DATA.md](./PRICING_DATA.md) | All pricing with source URLs and dates |
| [PROMPTS.md](./PROMPTS.md) | AI prompt design and iteration |
| [GTM.md](./GTM.md) | Go-to-market strategy |
| [ECONOMICS.md](./ECONOMICS.md) | Unit economics and business model |
| [USER_INTERVIEWS.md](./USER_INTERVIEWS.md) | 3 real user conversations |
| [LANDING_COPY.md](./LANDING_COPY.md) | Landing page copy variations |
| [METRICS.md](./METRICS.md) | KPIs and measurement plan |

## Screenshots

> **TODO before submitting:** Add 3 screenshots or replace this section with a Loom/YouTube screen recording link.
> Suggested captures: (1) landing page hero, (2) audit form with tools filled in, (3) results page showing savings breakdown.

**Screen recording:** [Add Loom or YouTube link here]

---

## Decisions

Five trade-offs made during the build and why:

**1. Rule-based audit engine over LLM-generated recommendations**
An LLM could hallucinate plan prices, invent features that don't exist, or recommend switching to plans it's confusing with others. The audit engine uses deterministic rules against hand-verified pricing data — testable, free per-request, and reproducible. AI is used only for the natural language summary, where a factual error is low-stakes.

**2. Supabase over Firebase**
Supabase gives a real Postgres database queryable with plain SQL — critical for the lead pipeline (sorting by `total_monthly_savings` to prioritize high-value leads is a one-liner). Firebase's Firestore would require learning a document query model with no benefit at this scale.

**3. In-memory rate limiting over Redis**
Redis adds a managed service dependency, a connection string, and monthly cost. For MVP traffic, 5 requests per IP per hour stored in-memory is sufficient and costs nothing. The documented trade-off: limits reset on server restart and don't work across multiple instances — acknowledged in ARCHITECTURE.md.

**4. Email shown after value, never before**
Gating email before showing results is a conversion killer for free tools. The audit is shown first; the email is requested after the user has seen their savings figure and is motivated. This reduces raw email volume but significantly increases lead quality.

**5. No login required for the core flow**
Login friction destroys top-of-funnel conversion for a free audit tool. Each audit is identified by a UUID embedded in a shareable URL — no account needed. The accepted trade-off: users who lose their share URL cannot retrieve previous audits. A magic-link account system is the first week-2 priority.

---

## License

MIT
