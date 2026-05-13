# Reflection

---

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was a Tailwind CSS build failure that blocked the entire app from rendering on day one of local setup. The error was: `The 'bg-surface-DEFAULT' class does not exist`. The entire CSS file failed to process, which meant the app threw a 500 on every route.

My first hypothesis was that the Tailwind config was wrong — that the `surface` color key hadn't been defined. I checked `tailwind.config.ts` and it was there: `surface: { DEFAULT: '#fafaf9', dark: '#0c0a09', card: '#ffffff', muted: '#f5f5f4' }`. So the color was defined. That ruled out a missing config entry.

My second hypothesis was a PostCSS version conflict. I checked `postcss.config.js` and the Node/package versions — nothing obviously wrong. This was a dead end.

The third hypothesis turned out to be correct: I misunderstood how Tailwind handles `DEFAULT` keys. In Tailwind v3, a color key named `DEFAULT` maps to the base class *without* the `-DEFAULT` suffix. So `surface.DEFAULT` generates `bg-surface`, not `bg-surface-DEFAULT`. The `globals.css` file was using `@apply bg-surface-DEFAULT` which Tailwind correctly rejected because that class does not exist.

The fix was a one-line change: `@apply font-body text-ink bg-surface-DEFAULT` → `@apply font-body text-ink bg-surface`. I also found the same pattern in `layout.tsx` and fixed that too.

What I learned: Tailwind's `DEFAULT` key behavior is a common footgun. It's unintuitive that `colors.surface.DEFAULT` doesn't generate a `bg-surface-DEFAULT` class. Reading the Tailwind v3 docs on color configuration rather than assuming the naming pattern would have saved an hour.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I originally built the Resend integration to send emails `from: "StackAudit <audit@credex.rocks>"`. This looked right — professional, branded, matches the product name. It worked in code review. It was committed.

When I tested end-to-end on day five, no emails arrived. I checked the Resend dashboard and saw that every send attempt was being silently rejected. The reason: `credex.rocks` is not a domain I own or have verified in Resend. Resend's free tier requires you to verify domain ownership via DNS records before sending from that domain. Without verification, the API returns 200 but drops the email.

I reversed the decision and changed the sender to `onboarding@resend.dev` — Resend's default test sender that works without domain verification. This is correct for development and staging. For production, the fix is to verify a domain I own and switch the `from` address accordingly.

The lesson: test the full email delivery path on day one, not day five during final QA. A 200 response from the email API does not mean the email was delivered. I should have verified receipt immediately after wiring up Resend, not assumed it worked because the API call succeeded.

---

## 3. What you would build in week 2 if you had it

**Priority 1: Benchmark Mode.** This is the feature I cut with the most regret. Currently, StackAudit tells you what you're spending and whether it's optimal relative to plan pricing. It doesn't tell you how your spend compares to similar companies. If you knew "Series A SaaS teams at your headcount spend a median of $47/developer/month on AI tools" — and you're at $120/dev/month — that number alone would make you act immediately. It's a stronger motivator than "you could save $300/mo."

The data to build this is collected in the `audits` table from day one. After 300–500 real audits, a simple percentile query gives meaningful benchmarks by company size and use case. The UI change is a single card: "Your team spends $X/developer/month. Median for teams your size: $Y."

**Priority 2: Email nurture sequence.** The current flow sends one email — the audit report. A three-email drip sequence spaced a week apart would meaningfully increase consultation bookings: email 1 is the audit report, email 2 is "here's what companies your size typically do about AI spend," email 3 is a soft CTA to book a Credex call. Resend supports sequences with minimal configuration.

**Priority 3: Saved audit history.** If you close the tab and lose the share URL, your audit is inaccessible. A lightweight "save to account" flow using email magic links — no password — would increase return visits and give Credex a second touchpoint with unconverted users.

---

## 4. How you used AI tools

I used Claude (via Claude Code) as the primary AI tool throughout the week.

**What I used it for:** Initial project scaffolding (directory structure, config files, TypeScript type definitions), boilerplate for Next.js API routes, the Anthropic API integration code, UI component structure for the form and results pages, and first drafts of the entrepreneurial documentation (GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md).

**What I didn't trust it with:** The audit engine logic. The 5 rules in `audit-engine.ts` and all pricing data in `pricing-data.ts` were written and verified by hand. AI cannot reliably know current pricing — Cursor's Business plan, Windsurf's March 2026 quota model change, GitHub Copilot's transition timeline. Getting these numbers wrong means every recommendation is wrong. I verified every number against official vendor pricing pages and cited sources in PRICING_DATA.md.

I also did not trust AI with the user interview notes. Those conversations happened with real people and the notes reflect what was actually said, including the contradictions and surprising moments that AI-generated fake interviews always lack.

**One specific time the AI was wrong:** When scaffolding the lead capture API route, Claude generated code that called `supabase.auth.getUser()` to retrieve a session before inserting the lead — a pattern appropriate for authenticated flows, but wrong here since the lead API is intentionally unauthenticated. The generated code would have thrown a null reference on every request because there is no session to read. I caught it during code review before it was executed, removed the auth check, and replaced it with Zod input validation at the API boundary instead.

---

## 5. Self-rating 1–10 with one-sentence reason for each

**Discipline: 6/10**
I worked on the project every day of the 7-day window, but days 3 and 6 were lighter than planned and I left mobile responsiveness testing until too late to address properly.

**Code quality: 7/10**
The audit engine, API routes, and TypeScript types are clean, well-structured, and covered by tests; some UI components grew longer than I would accept in a production codebase and would benefit from decomposition into smaller pieces.

**Design sense: 7/10**
The final UI achieves a professional, intentional look — the dark hero, green brand color, Instrument Serif + DM Sans type pairing, and savings hero all work well together — but I did not run formal mobile testing and haven't validated Lighthouse scores on the live deployed URL.

**Problem-solving: 8/10**
I debugged the Tailwind DEFAULT class issue, the Resend domain rejection, the Supabase RLS policies, and the environment variable spacing issue without getting stuck longer than a couple of hours on any single problem — I formed hypotheses, tested them systematically, and moved on.

**Entrepreneurial thinking: 7/10**
The GTM, economics, and user interview documents are specific and grounded rather than generic — I did the actual user conversations and worked through the unit economics math — but I would have liked to attempt at least one bonus feature (PDF export or the benchmark widget) to demonstrate range.
