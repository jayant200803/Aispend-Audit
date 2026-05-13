# Dev Log

A day-by-day journal of building StackAudit. Written in real time as decisions were made.

---

## Day 1 — 2026-05-07

**Hours worked:** 6

**What I did:**
Scaffolded the Next.js 14 App Router project with TypeScript (strict mode), Tailwind CSS, Vitest, and ESLint. Created the full directory structure, committed the empty scaffold, set up the GitHub Actions CI workflow (lint + test + build), and deployed a placeholder "coming soon" page to Vercel. Spent the bulk of the day on pricing research — went through every official pricing page for Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, Anthropic API, and OpenAI API. Documented every plan tier, per-seat price, and feature distinction in notes that would later become PRICING_DATA.md.

**What I learned:**
Several tools had recent pricing changes that weren't well-documented. GitHub Copilot is moving to usage-based billing June 1, 2026. Windsurf moved from a credit system to request quotas in March 2026. Getting pricing right upfront matters — if the audit engine has wrong numbers, every recommendation is wrong. Chose `uuid` over `crypto.randomUUID` after learning that Edge runtime compatibility is inconsistent with the native API. Chose Supabase over Firebase because Postgres lets us query leads in SQL without learning a new query model.

**Blockers / what I'm stuck on:**
GitHub Copilot pricing is genuinely in transition — the old per-seat model and new usage-based model coexist. Documented both in PRICING_DATA.md and decided to use the current per-seat pricing since usage-based hasn't launched yet.

**Plan for tomorrow:**
Define all TypeScript types, write `pricing-data.ts` with the full data structure, and build the `SpendForm` component with localStorage persistence.

---

## Day 2 — 2026-05-08

**Hours worked:** 7

**What I did:**
Defined the full TypeScript type system: `AITool`, `ToolPlan`, `ToolEntry`, `AuditInput`, `AuditResult`, `ToolRecommendation`, `LeadData`, `SharedAudit`. Wrote `pricing-data.ts` with all 8 tools and every plan tier priced to the current week. Built the `SpendForm` component — the most UX-critical piece of the app. Added localStorage persistence so users who close the tab don't lose their data, auto-calculated monthly spend from seats × plan price, manual override for custom-negotiated pricing, and plan reset when the tool selector changes.

**What I learned:**
Auto-calculating spend from plan × seats is a much better UX than asking users to type in a number they have to look up. Manual override is still needed because some teams negotiate enterprise pricing. The `localStorage` key should be a named constant (`stackaudit_form_state`) so any future developer knows exactly what it does. Select element styling in Tailwind is more painful than expected — native selects don't respect custom styling well cross-browser.

**Blockers / what I'm stuck on:**
The `select` element custom styling — ended up with a wrapper div and a custom chevron SVG as the only reliable cross-browser solution.

**Plan for tomorrow:**
Write the audit engine with 5 deterministic rules, then write unit tests covering each rule plus edge cases.

---

## Day 3 — 2026-05-09

**Hours worked:** 8

**What I did:**
Wrote the audit engine (`audit-engine.ts`) — 5 rules, deterministic, no AI involved. Rules evaluated in order of precedence: (1) team plan with too few seats → individual plan, (2) expensive tier when mid-tier suffices → cheaper same-vendor plan, (3) cross-tool alternative where a cheaper tool covers the use case, (4) Credex credit savings for qualifying spend levels, (5) API spend optimization via batching and prompt caching. Wrote 10 unit tests covering each rule, edge cases (unknown tools, empty inputs, already-optimal stack), and savings aggregation across multiple tools. All 10 pass.

**What I learned:**
Rules must be evaluated in strict precedence order — if you let multiple rules fire on the same tool, you get conflicting recommendations ("downgrade AND switch tool"). First matching rule wins. Cross-tool switches should have lower confidence because I can't know someone's workflow from a plan selection alone — honesty matters more than appearing thorough. The `keep` action is as important as any recommendation; an audit that always finds "savings" manufactures distrust.

**Blockers / what I'm stuck on:**
Nothing blocking. Test coverage gives confidence the engine is correct before building UI on top of it.

**Plan for tomorrow:**
Build the `AuditResults` UI component and integrate the Anthropic API for AI-generated summaries with a fallback.

---

## Day 4 — 2026-05-10

**Hours worked:** 7

**What I did:**
Built the `AuditResults` component — savings hero section with animated count-up, per-tool recommendation cards color-coded by action type, Credex CTA for high-savings users (>$500/mo threshold), and share button. Integrated the Anthropic API via `/api/summary` route. The prompt instructs the model to write a single paragraph, avoid bullet points, reference specific dollar figures from the audit, and name the single biggest saving opportunity. Added `generateFallbackSummary()` that produces a sensible paragraph from the audit data without any API call, used whenever the API is unavailable or returns an error.

**What I learned:**
API failures need to be silent from the user's perspective — the fallback must be good enough that users can't tell the difference. Tested multiple gradient color combinations for the savings hero; `brand-600 → emerald-400` was the most distinctive without feeling like a generic "money app" green. Decided to gate the Credex CTA at $500/mo because below that threshold it reads as pushy rather than helpful.

**Blockers / what I'm stuck on:**
Anthropic API requires billing to be set up even for free-tier usage. Documenting this in the README for anyone who clones the repo.

**Plan for tomorrow:**
Build the shareable URL system (`/share/[id]`) with OG tags, the `LeadCapture` component with honeypot anti-bot protection, the `/api/lead` route with rate limiting, and Resend email integration.

---

## Day 5 — 2026-05-11

**Hours worked:** 8

**What I did:**
Built the `/share/[id]` page with server-side OG metadata generation so link previews work on Twitter and Slack. The API layer strips PII before returning the shared audit — email, company name, and role are never included in the public version; only tool names, savings figures, and the AI summary. Built the `LeadCapture` component with honeypot field (CSS-hidden, not `type="hidden"`), Zod validation, and proper error messaging. Built `/api/lead` with in-memory rate limiting (5 per IP per hour) and Resend transactional email — high-savings users get a note about Credex advisor outreach in the email body.

**What I learned:**
Honeypot fields should be hidden via CSS (`display: none` on a wrapper), not via `type="hidden"` — some bots specifically look for hidden inputs. Email HTML must be fully inline-styled because most email clients strip external CSS. Supabase RLS policies are straightforward but the distinction between anon INSERT and anon SELECT took time to get right — leads need to be writable by anyone but readable by no one except the service role.

**Blockers / what I'm stuck on:**
Supabase RLS policies for the `leads` table — resolved by setting INSERT to `WITH CHECK (true)` and having no SELECT policy, so only the service role key can read lead data.

**Plan for tomorrow:**
Conduct 3 user interviews, write the entrepreneurial docs (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS).

---

## Day 6 — 2026-05-12

**Hours worked:** 6

**What I did:**
Conducted 3 user interviews — DMed founders on X and reached out through a startup Slack. Each conversation was 10–15 minutes, focused on how they currently think about AI tool spend and what would make them trust a free audit tool. Detailed notes in USER_INTERVIEWS.md. Used the interview findings to make one concrete product change: the `reason` field in each tool recommendation is now the most prominent text on the card, not collapsed or secondary. Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md, and METRICS.md.

**What I learned:**
The most surprising finding from interviews: nobody audits their AI spend because they assume it's just a cost of doing business, like SaaS subscriptions. The frame of "you might be on the wrong plan" is more actionable than "you're overpaying." Writing ECONOMICS.md forced me to think through the unit economics carefully — even at a 1% conversion from audit → Credex customer, the math works at moderate traffic. Changed the Credex CTA copy from "Learn More" to "Book a Consultation" based on the principle that vague CTAs convert worse than specific ones.

**Blockers / what I'm stuck on:**
Getting a third user interview on a tight timeline required messaging 8 people to get 3 responses. Worth doing — the insights were specific and changed the product.

**Plan for tomorrow:**
Performance pass (Lighthouse), final UI polish, complete REFLECTION.md, finalize DEVLOG.md, verify all 12 required files, confirm CI is green, submit.

---

## Day 7 — 2026-05-13

**Hours worked:** 5

**What I did:**
UI polish pass: rebuilt the landing page with a sticky navbar, animated tool marquee, and "How it works" section. Improved the results page with a spend comparison progress bar, better savings percentage display, and redesigned tool recommendation cards. Added `display=swap` to the Google Fonts import for better LCP scores. Ran Lighthouse — final scores: Performance 88, Accessibility 94, Best Practices 92 (all meet the required thresholds). Completed REFLECTION.md. Verified all 12 required markdown files are present at repo root. Confirmed CI is green on latest commit. Deployed final build to Vercel. Submitted.

**What I learned:**
The Google Fonts `display=swap` parameter has a meaningful impact on Lighthouse LCP. Small UI details — like showing the spend comparison bar on the results page — make the audit feel like a real product and not just a table of numbers. Writing the REFLECTION honestly was harder than writing the code; it forces you to be specific about what went wrong and why, which requires actually remembering and thinking rather than summarizing.

**Blockers / what I'm stuck on:**
Nothing blocking at submission. The in-memory rate limiter is documented as an MVP limitation (would need Redis in production for multi-instance deployments).

**Plan for tomorrow:**
N/A — submission day.
