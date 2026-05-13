# Architecture

## System Overview

StackAudit is a Next.js 14 App Router application deployed on Vercel. It has three distinct layers: a static-first frontend, a set of lightweight API routes, and two external services (Supabase and Anthropic).

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Landing Page │  │ Audit Form   │  │ Results Page │  │
│  │ (server RSC) │  │ (client CSR) │  │ (client CSR) │  │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────────────────────────────────────────────────────┘
                            │ POST                │ GET
                ┌───────────▼────────────────────▼───────┐
                │           Next.js API Routes            │
                │  /api/summary  /api/audit  /api/lead    │
                └─────┬────────────────────┬─────────────┘
                      │                    │
            ┌─────────▼────────┐  ┌────────▼──────────┐
            │  Anthropic API   │  │     Supabase       │
            │  (AI summaries)  │  │  (audits + leads)  │
            └──────────────────┘  └───────────────────┘
```

## Key Design Decisions

### 1. Rule-based audit engine, not AI-first

The audit engine (`src/lib/audit-engine.ts`) uses deterministic rules, not an LLM. This was a deliberate choice:

- **Trustworthiness**: Users need to understand *why* they're being told to switch plans. Deterministic rules produce auditable, defensible recommendations.
- **Cost**: Running every audit through an LLM would cost ~$0.01–0.05 per audit. At scale, rule-based is free.
- **Speed**: The audit runs synchronously in the browser — no round-trip needed.
- **Testability**: Rules can be unit-tested. LLM outputs can't be deterministically tested.

AI is used only for the natural language summary — a cosmetic enhancement, not the core logic.

### 2. Client-side audit, server-side persistence

The audit runs entirely in the browser. The API routes (`/api/audit`, `/api/lead`) are write-only — they persist data for shareability and lead tracking, but the audit result is already rendered before either call completes.

This means:
- The tool works even if Supabase/Resend are down or not configured
- No round-trip latency before showing results
- Simpler failure modes

### 3. localStorage for form state persistence

The spend form saves its state to localStorage on every change. If a user closes the tab mid-form and returns, they pick up where they left off. This was the highest-impact UX improvement from user interviews (see USER_INTERVIEWS.md).

### 4. Share URLs load from Supabase

`/share/[id]` is a Next.js App Router page that renders a `ShareClient` component. The client component fetches the audit from `/api/audit?id=...`, which queries Supabase. PII is stripped at the API layer — the share page never contains email, company name, or any personal details.

OG meta is generated at the server component level (page.tsx) for social sharing previews.

### 5. Rate limiting at the API route level

The lead capture endpoint uses a simple in-memory rate limit (5 submits per IP per hour). This is intentionally lightweight — in production, Redis would be appropriate, but in-memory works for the MVP and avoids adding an infrastructure dependency. The honeypot field (`<input type="text" aria-hidden="true" />`) catches the majority of bot submissions before the rate limiter is needed.

## Data Flow

### Audit submission:

```
User fills form
  → SpendForm.tsx calls runAudit(input)  [synchronous, client-side]
  → AuditResult rendered immediately
  → POST /api/summary  → Anthropic API  → aiSummary string
  → POST /api/audit    → Supabase       → persists audit with ID
```

### Lead capture:

```
User submits email
  → POST /api/lead  → validate (Zod)
                    → rate limit check
                    → INSERT leads (Supabase)
                    → POST /emails (Resend)
```

### Share URL:

```
/share/[id] renders
  → page.tsx (server): generateMetadata() for OG tags
  → ShareClient (client): GET /api/audit?id=
                         → SELECT audits WHERE id = ? (Supabase)
                         → render stripped audit data
```

## Database Schema

Two tables in Supabase Postgres:

**audits**
```sql
id UUID PRIMARY KEY
input JSONB             — tool entries, team size, use case
recommendations JSONB   — per-tool recommendation array
total_current_spend NUMERIC
total_optimized_spend NUMERIC
total_monthly_savings NUMERIC
total_annual_savings NUMERIC
credex_savings_estimate NUMERIC
ai_summary TEXT
created_at TIMESTAMPTZ
```

**leads**
```sql
id UUID PRIMARY KEY
email TEXT
company_name TEXT (nullable)
role TEXT (nullable)
audit_id UUID → audits.id
total_monthly_savings NUMERIC
created_at TIMESTAMPTZ
```

Row-Level Security is enabled on both tables. The `audits` table allows anon inserts and selects (public read, since audits are shareable). The `leads` table allows anon inserts only.

## Performance Targets

- Lighthouse Performance: ≥85
- Lighthouse Accessibility: ≥90
- Lighthouse Best Practices: ≥90
- Time to First Contentful Paint: <1.5s
- Time to Interactive: <2.5s

Techniques used:
- Google Fonts via `@import` with `display=swap`
- No third-party JavaScript except Supabase client (lazy-loaded)
- CSS animations preferred over JS animations for micro-interactions
- Static landing page HTML above the fold; dynamic form below

## Trade-offs and Future Work

| Trade-off | Why | What to do next |
|-----------|-----|-----------------|
| In-memory rate limiting | Simple, no Redis needed for MVP | Migrate to Upstash Redis on growth |
| No auth | Reduces friction massively | Add optional auth for saved audit history |
| Manual pricing data | Current and accurate for launch | Cron job to scrape/verify weekly |
| Single Resend template | Fast to ship | A/B test email variants |
| No streaming for AI summary | Simpler implementation | Add streaming for faster perceived load |
