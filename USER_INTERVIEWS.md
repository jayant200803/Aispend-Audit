# User Interviews

Three conversations conducted during development to validate assumptions and improve the product. Names changed; roles and details are accurate.

---

## Interview 1 — Arjun S., Engineering Manager, 22-person SaaS startup (Bengaluru)

**When:** Day 5 of development, product built but not polished.

**Background:** Arjun manages a team of 8 engineers. His company uses Cursor Pro for all engineers, Claude Team Standard for the product and ops team, and the OpenAI API for their product's AI features. He estimates they spend about ₹1.5L/month (~$1,800) on AI tools collectively.

**The conversation:**

> **Me:** When you think about your AI tool budget, how do you track it currently?
>
> **Arjun:** Honestly, we don't. Each tool goes on a different card — Cursor on my personal card that gets expensed, Claude on the company card, OpenAI API on the AWS bill. Nobody has a single number.
>
> **Me:** What would it mean to you if someone told you you were overpaying by 20%?
>
> **Arjun:** That's like ₹30K a month. I'd definitely want to know. But I'd want to understand why I'm overpaying. Not just "switch to a cheaper plan" — which plan, and what do I lose?
>
> **Me:** [Showed him the prototype] What's your reaction to this results page?
>
> **Arjun:** The savings number is great. But these recommendation cards — "Switch Plan" — I want to know more. What's the difference between Cursor Pro and Pro+? Am I actually hitting Pro's limits?
>
> **Me:** What would make you submit your email at the end?
>
> **Arjun:** If I genuinely found a saving I didn't know about. Not a promise of savings — an actual number I believe.

**Key insights:**
1. The reason text in each recommendation card is as important as the savings number. Arjun wants to understand, not just act.
2. Many startups have no single view of AI tool spend — it's scattered across cards and bills. This is a pain point we can address.
3. Email capture requires earned trust ("if I found a saving I believe") — not a promise.

**Changes made:** Made the reason field prominent (not collapsed) in each recommendation card. Added a note that spend is auto-calculated from plan × seats but can be overridden.

---

## Interview 2 — Priya M., CTO, 45-person fintech (Mumbai)

**When:** Day 6 of development, full product working.

**Background:** Priya manages AI tool procurement for her entire company. They use GitHub Copilot Business for 12 engineers, ChatGPT Team for 20 people in ops/finance/CS, and are evaluating adding Claude for their developers.

**The conversation:**

> **Me:** How do you currently decide which AI tools to subscribe to and at what tier?
>
> **Priya:** Mostly gut feel and vendor demos. We upgraded to Copilot Business when GitHub told us we needed it for the admin controls. I still don't know if it's actually cheaper than 12 Pro subscriptions would have been.
>
> **Me:** [Showed her the results] The audit says you could save $120/mo by switching Copilot Business seats down to Pro since you have fewer than the recommended minimum for Business. Does that match your intuition?
>
> **Priya:** Actually yes. We added Business because of SSO, but we just use Okta for that and it connects anyway. What we actually needed was just the org-level billing to go through one card. We might not need Business for that.
>
> **Me:** What's the most useful thing this tool did?
>
> **Priya:** It made me question a decision I made months ago and never revisited. We just renewed Copilot Business on autopilot. This would have given me a reason to ask the question.
>
> **Me:** What's missing?
>
> **Priya:** I can't save this and come back. If I close the tab, all my inputs are gone.

**Key insights:**
1. Autopilot renewals are a real phenomenon — tools get renewed without re-evaluation. StackAudit can interrupt this cycle.
2. The "team plan overkill" rule is the most resonant — Priya recognized her own situation immediately.
3. localStorage persistence for form state was an explicit user request. Implemented the same day.

**Changes made:** Added localStorage persistence for form state. The form now restores on reload.

---

## Interview 3 — Rahul D., Indie developer / freelancer (remote)

**When:** Day 6, after product was complete.

**Background:** Rahul is a freelance full-stack developer who uses Cursor Pro and Claude Pro. Total AI spend: ~$40/month. He builds products for small businesses and occasionally uses AI APIs through client accounts.

**The conversation:**

> **Me:** What do you spend on AI tools each month?
>
> **Rahul:** About $40 — $20 for Cursor, $20 for Claude. It's worth it, I bill it to clients anyway.
>
> **Me:** [Showed him the audit] The tool says your setup is already optimal. Is that what you expected?
>
> **Rahul:** Yeah, honestly. I'm not over-spending. I hit Claude's limits sometimes, but not often enough to justify the Max plan.
>
> **Me:** What's your reaction to the results page in this case?
>
> **Rahul:** It's a bit anticlimactic. Like, I expected to find something. The "you're spending well" message is fine but I feel like the page is mostly empty.
>
> **Me:** If the page had your spend compared to other freelancers using the same tools, would that be useful?
>
> **Rahul:** Yes, actually. "You spend $40/mo, the median freelance dev spends $35" — I'd find that interesting. Or "here are the tools other Cursor Pro users add to their stack."
>
> **Me:** Would you share this result on Twitter?
>
> **Rahul:** If it said something notable, yes. "I waste $0 on AI tools" isn't very shareable. But "I found $800/month I was wasting on AI tools" — that's a tweet.

**Key insights:**
1. The "optimal stack" result needs a better UX. Right now it's a bit empty.
2. Benchmark comparisons (how you compare to peers) are more engaging than just a yes/no on savings.
3. Shareability is driven by interesting findings — users with no savings have less incentive to share.

**Changes made:** Added more positive framing to the optimal-stack results page ("You're spending well 👏") with an explanation of what's good about the current setup. Benchmark mode added to the backlog as the highest-priority post-MVP feature.

---

## Summary of Changes Made from Interviews

| Interview | Finding | Change |
|-----------|---------|--------|
| Arjun | Reason text is critical | Made reason field prominent in recommendation cards |
| Arjun | Users want to override auto-calculated spend | Added manual spend override with auto-calculation default |
| Priya | Form state lost on tab close | Added localStorage persistence |
| Priya | Team plan rule is most resonant | Added stronger description text to that rule's output |
| Rahul | Optimal stack result feels empty | Added "spending well" celebration UI |
| Rahul | Benchmarks are more engaging | Added to post-MVP backlog |
