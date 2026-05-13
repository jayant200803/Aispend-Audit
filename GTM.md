# Go-to-Market Strategy

## The Core GTM Insight

StackAudit is not a product looking for a market. It's a marketing channel that also happens to be useful. The audit tool is valuable on its own, and a subset of users who find it valuable will become Credex customers. This is the same motion as HubSpot's Website Grader, Buffer's social analytics tools, or Ahrefs' free SEO tools — free utilities that attract the exact audience you want to sell to.

The GTM strategy is built around this insight: **maximize the quality of leads, not just the quantity.** A user who runs an audit and finds $500/mo in savings is a 10x better lead than a user who typed in one $20/mo tool and saw no savings.

---

## Target Audience

**Primary:** Engineering managers and CTOs at Series A–B startups (10–200 employees) who are deploying AI tools across their engineering teams.

**Why this segment:**
- They have enough AI tooling to have a meaningful spend ($500+/mo)
- They're responsible for the budget and can take action on recommendations
- They're technical enough to understand the recommendations but busy enough to appreciate automation
- They are already in the market for AI cost optimization (this is a new category, but CFOs are starting to ask questions)

**Secondary:** Heads of Growth / Operations at AI-native companies where every employee uses AI tools.

**Not our user (right now):** Solo developers spending $20/mo on one tool. They'll use the audit, find nothing to save, and move on. That's fine — word of mouth is still valuable.

---

## Acquisition Channels

### Channel 1: Developer Communities (Primary, Week 1)

**Where:** Hacker News (Show HN), r/webdev, r/programming, r/MachineLearning, IndieHackers, dev.to

**Approach:** Post "Show HN: I built a free AI spend audit tool — finds savings in your Cursor/Copilot/Claude stack." Honest framing, no marketing language. The HN audience hates sales copy but loves genuinely useful free tools.

**Expected outcome:** 500–2000 visits from a well-received Show HN post. ~2–5% audit completion rate = 10–100 audits. ~10–20% email capture = 2–20 leads.

**Why this works:** The target audience is heavily represented on HN. And a free audit tool is news-worthy — there's a real hook ("wait, am I overpaying for Cursor?").

### Channel 2: LinkedIn Content (Weeks 2–4)

**Who posts:** Founders and developers in the Credex network share the tool with their audience.

**Content angle:** "We audited our AI tool spend and found $800/mo we were wasting." Specific, personal, shareable. Tag the tools mentioned.

**Expected outcome:** 1–3 posts from authentic voices, each reaching 5K–50K impressions in the target demographic.

### Channel 3: Embedded in Credex Sales Process (Ongoing)

Every Credex prospect conversation should start with a StackAudit link. "Before we talk about our pricing, here's a free audit of what you're currently spending. Let's start there."

This converts a cold sales call into a diagnostic session. The audit becomes a trust-builder, not a pitch.

### Channel 4: Shareable Result URLs (Viral Loop)

Every audit result has a one-click share URL. When someone shares their audit on Twitter/LinkedIn ("we were overpaying for AI tools by $2K/month"), each share is an organic impression from a credible source.

To encourage sharing: add a "Share this audit" CTA prominently in the results, and make the shared page clean and screenshot-worthy.

---

## Activation + Conversion Funnel

```
Visitor → Fills Form → Views Results → Submits Email → Credex Consultation
  100%      30%           20%            8%              1–2%
```

**Estimated funnel at 1,000 visits:**
- 300 start the form
- 200 complete the audit
- 16 submit emails
- 2–4 book Credex consultations

**Conversion rate to consultation:** 1–2% of form completers is the baseline assumption. At $5K–50K ACV for a Credex customer, even 2 new customers per 1,000 visitors is strong unit economics (see ECONOMICS.md).

---

## The Lead Quality Filter

Not all leads are created equal. The tool already implements one filter: the Credex CTA is only shown to users with >$500/mo in identified savings. This is the right segment — they have enough pain to be motivated.

Additional segmentation from the lead form:
- **Company size** (entered in the form) filters for startups vs. enterprises vs. freelancers
- **Monthly savings amount** stored with the lead — sort by this in Credex's CRM
- **Tools used** — teams using Anthropic API or OpenAI API directly are the best Credex leads (that's exactly what Credex helps with)

---

## 30-Day Launch Plan

| Week | Action |
|------|--------|
| Week 1 | Deploy to Vercel, confirm end-to-end flow. Post Show HN. Share in 3 developer Slacks. |
| Week 2 | Publish 1 LinkedIn post on AI tool spend findings from beta audits. Follow up with top 5 leads from Week 1. |
| Week 3 | Iterate based on first 100 audits. What's the most common savings recommendation? Write a blog post about it. |
| Week 4 | Start building benchmark mode (median spend by company size) — the data exists after 100+ audits. |
