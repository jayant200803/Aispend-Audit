# Economics

## Business Model Overview

StackAudit is a free tool — there is no paywall, no premium tier, and no pricing. The economic model is indirect: StackAudit generates qualified leads for Credex (a company that sells discounted AI infrastructure credits). Every user who discovers savings and submits their email is a potential Credex customer.

---

## Unit Economics Per 1,000 Visitors

### Cost to Serve 1,000 Visitors

| Cost | Monthly | Basis |
|------|---------|-------|
| Hosting (Vercel Pro) | ~$5 | 1,000 visits is trivial for Vercel |
| Supabase | $0 | Free tier (500MB, 2GB bandwidth) |
| Anthropic API | ~$2 | ~200 audits × ~500 tokens × $3/MTok |
| Resend | $0 | Free tier (3,000 emails/month) |
| **Total** | **~$7** | |

**Cost per audit:** $0.035 (3.5 cents)  
**Cost per lead (email submitted):** $0.44 (at 8% email capture)  
**Cost per Credex consultation:** $3.50 (at 1% of audits → consultation)

### Revenue Per Credex Customer

Credex sells discounted AI credits — the economics depend on their margin, but for this analysis we use conservative estimates:

| Metric | Conservative | Optimistic |
|--------|-------------|------------|
| Average contract value (ACV) | $5,000/year | $25,000/year |
| Customer lifetime (years) | 1.5 | 3 |
| LTV | $7,500 | $75,000 |

At 1% consultation rate and 50% close rate from consultation:
- **Revenue per 1,000 audit visitors:** $37.50 (conservative) — $375 (optimistic)
- **ROI:** 5× — 50×+ on hosting costs

These are rough numbers, but the unit economics are clearly viable. The tool pays for itself with a single closed deal per ~20,000 visitors.

---

## Sensitivity Analysis

The metric that matters most is **lead quality**, not lead volume. Changing the conversion assumptions:

| Scenario | Audits/1K visitors | Email capture | Consult rate | Close rate | Revenue |
|----------|-------------------|---------------|-------------|------------|---------|
| Pessimistic | 100 | 5% | 0.5% | 30% | $11 |
| Base | 200 | 8% | 1% | 50% | $75 |
| Optimistic | 300 | 15% | 2% | 60% | $225 |

Even the pessimistic scenario generates positive ROI at $11 revenue per $7 cost. The floor is high because the cost to serve is so low.

---

## What Improves the Economics

**1. Better lead filtering (biggest lever)**  
Currently, all email submissions go into the same CRM queue. Adding `totalMonthlySavings` as the primary sort key means the sales team works highest-value leads first. A company with $5K/mo in AI savings is a 10x better Credex prospect than one with $200/mo.

**2. Benchmark mode**  
Users who discover they're spending 3× the median for their company size are more motivated to act. This increases audit → email capture rate.

**3. Shareable URLs (viral coefficient)**  
Every share is a free acquisition. If 5% of audit completers share their result, and each share generates 10 visits, the effective cost per audit visitor drops from organic channels' CPMs to near zero.

**4. Email nurture sequence**  
Currently, Credex sends one email (the audit report). A 3-email sequence ("here's what companies at your stage do about AI costs") would increase consultation booking rate without additional acquisition spend.

---

## Pricing Data as Moat

The audit engine is only as good as the pricing data backing it. Manual verification takes ~2 hours/week to keep current. As the tool scales, this becomes a meaningful moat: competitors would need to replicate both the product and the pricing database to match quality. Automating the pricing verification (web scrapers + manual review for changes) would strengthen this moat.

---

## Path to $1M ARR in 18 Months

Working backward from $1M ARR:

**What does $1M ARR mean in customers?**
- At $5,000 ACV (conservative): 200 Credex customers
- At $10,000 ACV (mid): 100 Credex customers
- At $25,000 ACV (optimistic): 40 Credex customers

Using the mid-case ($10,000 ACV), we need **100 new Credex customers in 18 months** — roughly 6 new customers per month.

**Funnel math to get there:**

| Stage | Rate | Monthly Volume Needed |
|-------|------|-----------------------|
| Credex customers (goal) | — | 6/month |
| Consultations booked | 50% close rate | 12/month |
| Qualified leads (>$500/mo savings) | 15% book consultation | 80/month |
| Email captures | 8% are qualified | 1,000/month |
| Audit completions | 40% submit email | 2,500/month |
| Unique visitors | 25% complete audit | **10,000/month** |

**So the question is: can StackAudit reach 10,000 unique monthly visitors by month 6?**

Month 1–2: Show HN launch + developer community seeding → 2,000–5,000 visitors (one-time spike)
Month 3–6: Content (pricing comparison posts), SEO on "Cursor vs Copilot cost" queries, Credex's existing customer base → 3,000–6,000/month steady
Month 6–18: Word-of-mouth from shared audit URLs, referral mechanic, partner distribution → 8,000–15,000/month

**What has to be true for this to work:**
1. The audit is compelling enough that 8%+ of completers submit email (current assumption; needs validation in first 30 days)
2. High-savings audits (>$500/mo) convert to consultations at 15%+ — this requires a good follow-up sequence, not just one email
3. Credex's sales team can close 50% of consultations at $10K ACV — this is a Credex execution question, not a StackAudit question
4. Visitor growth compounds via sharing — every shareable result URL is a free distribution mechanism

**Sensitivity check:** If consultation close rate drops from 50% to 25%, we need 200 consultations instead of 100 — meaning 20,000 monthly visitors instead of 10,000. Still achievable by month 12 with consistent distribution. The model is robust to a 50% miss on close rate if visitor volume holds.

---

## Comparison: Build vs. Buy Lead Gen

| Approach | Cost/Lead | Lead Quality | Brand Equity |
|----------|-----------|-------------|--------------|
| Google Ads | $50–$200 | Low (intent unclear) | None |
| LinkedIn Ads | $30–$150 | Medium | None |
| Cold outbound | $15–$50 | Medium | Negative |
| StackAudit | $0.44 | High (pain identified) | Positive |

The lead quality advantage is the key insight. A user who just discovered they're overpaying $800/mo for AI tools has already done the discovery work that a sales rep would normally spend an hour on. The audit converts a cold lead into a warm one with a specific, quantified problem.
