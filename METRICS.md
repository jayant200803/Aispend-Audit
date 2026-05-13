# Metrics

How to measure whether StackAudit is working — for the tool itself and for Credex's business goals.

---

## North Star Metric

**Qualified Leads Generated Per Month**

Definition: email submissions from users with >$500/mo in identified savings.

This is the single metric that connects StackAudit's usage to Credex's business. Everything else is in service of this number.

Current target: 10 qualified leads/month in Month 1, 50/month by Month 3.

---

## Funnel Metrics

| Stage | Metric | Current Target | Measurement |
|-------|--------|----------------|-------------|
| Acquisition | Unique visitors | 1,000/month | Vercel Analytics |
| Activation | Audit form completions | 200/month (20%) | Custom event |
| Engagement | Email submissions | 16/month (8% of audits) | Supabase leads count |
| Quality | Qualified leads (>$500/mo savings) | 4/month (25% of emails) | Supabase query |
| Revenue | Credex consultations booked | 1/month (25% of qualified leads) | CRM |

---

## Product Health Metrics

These tell you if the tool is working correctly, not just that people are using it.

### Audit Quality
- **% of audits with at least one actionable recommendation** — target: >60%
  - Too low means the tool isn't finding real savings; too high means it's recommending unnecessary changes
- **Average savings per audit** — target: track month-over-month
  - Rising average = either better rule detection or self-selection bias (users with more tools coming)

### Tool Coverage
- **Distribution of tools used in audits** — which tools are most common?
  - Informs which pricing data to verify most urgently
  - If 80% of audits include Cursor but only 20% include Windsurf, prioritize Cursor data accuracy

### Form Abandonment
- **Drop-off rate between "Add Tool" and "Submit"** — target: <50%
  - Measures form complexity/friction
  - If high, simplify the form (fewer required fields, better defaults)

---

## Lead Quality Metrics

| Metric | Definition | Why It Matters |
|--------|-----------|----------------|
| Average savings per lead | Total savings across all email submissions / count | Higher = better Credex fit |
| Lead-to-consultation rate | Consultations booked / qualified leads | Measures email quality |
| Consultation-to-close rate | Closed deals / consultations | Credex sales effectiveness |
| Top tool in high-savings leads | Which tool produces the most savings findings | Informs which partnerships to pursue |

---

## Operational Metrics

### Pricing Data Freshness
- **Days since last pricing verification** — alert when >7 days for any tool
- **Pricing discrepancy detection** — if real-world complaints suggest data is stale

### Technical Health
- **API summary success rate** — % of audits that receive an AI summary vs. fallback
  - Target: >95% when Anthropic API key is configured
- **Lead save rate** — % of email submissions successfully stored in Supabase
  - Target: >99% (failures should never be user-visible)
- **Share URL load success rate** — % of share page loads that successfully fetch the audit
  - Target: >99%

---

## Measurement Setup

### Vercel Analytics (built-in)
- Unique visitors, page views, geographic distribution
- Zero configuration; enabled by default on Vercel Pro

### PostHog (recommended for Month 2)
Custom events to track:
```
audit_started            — form rendered
tool_added               — user clicks "Add another tool"
audit_submitted          — "Get My Free Audit" clicked
audit_completed          — results page rendered
email_submitted          — lead capture form submitted
share_clicked            — share button clicked
```

Event properties to capture with each event:
- `num_tools` — number of tools in the audit
- `total_spend` — total monthly spend entered
- `has_savings` — boolean
- `total_savings` — if has_savings is true

### Supabase Queries (operational)

Weekly qualified leads:
```sql
SELECT COUNT(*) 
FROM leads 
WHERE total_monthly_savings > 500
  AND created_at > NOW() - INTERVAL '7 days';
```

Average savings per audit:
```sql
SELECT AVG(total_monthly_savings) 
FROM audits 
WHERE created_at > NOW() - INTERVAL '30 days';
```

Most common tools in high-savings audits:
```sql
SELECT jsonb_array_elements(input->'tools')->>'toolId' as tool,
       COUNT(*) as count
FROM audits
WHERE total_monthly_savings > 500
GROUP BY tool
ORDER BY count DESC;
```

---

## Weekly Review Checklist

Every Monday morning:
1. Check total audits this week vs. last week
2. Check qualified leads (>$500 savings) this week
3. Verify pricing data for any tool that changed plans recently
4. Check API error logs (Supabase edge function logs)
5. Review any user emails/feedback

First sign that something needs fixing:
- Audit completion rate drops below 15% → form is too long or broken
- Qualified lead rate drops below 2% of visitors → targeting wrong audience or audit quality degraded
- API summary success drops below 90% → check Anthropic billing
