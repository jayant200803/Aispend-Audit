# Prompts

Documentation of all AI prompt design decisions for StackAudit.

---

## Summary Generation Prompt

Used in `/api/summary/route.ts` to generate the ~100-word personalized audit paragraph.

### Final Prompt (v4)

```
You are a concise, friendly AI cost advisor for startups. A {teamSize}-person team 
primarily uses AI for "{useCase}".

Their current monthly AI spend is ${totalCurrentSpend}. After audit, we found 
${totalMonthlySavings}/mo in potential savings (${totalAnnualSavings}/year).

Tool breakdown:
{toolName} ({currentPlan}, ${currentSpend}/mo): {action} → {reason}
[...repeated for each tool]

Write a ~100-word personalized summary paragraph. Be specific about their stack. 
If savings are minimal (<$100/mo), praise their setup and suggest monitoring for 
pricing changes. If savings are significant, lead with the dollar amount and the 
#1 biggest opportunity. Mention Credex only if savings exceed $500/mo. 
Tone: direct, helpful, zero buzzwords. Do NOT use bullet points or headers — 
just one paragraph.
```

**Model:** `claude-sonnet-4-20250514`  
**Max tokens:** 300 (enforced to prevent runaway output)

### Iteration History

**v1 (initial):** Simple prompt asking for "a summary of their AI spending audit."

*Problem:* Produced generic advice that didn't reference specific tools, used bullet points, and occasionally invented plan features that didn't exist.

*Change:* Added structured tool breakdown data and explicit "no bullets/headers" instruction.

---

**v2:** Added tool-by-tool breakdown but no tone instructions.

*Problem:* Outputs were formal and corporate ("It is recommended that your organization consider..."). Also started with "Certainly!" — a sycophantic opener.

*Change:* Added tone instruction: "direct, helpful, zero buzzwords." Added "Do not start with affirmations or filler phrases."

---

**v3:** Added savings threshold logic ("mention Credex only if > $500/mo").

*Problem:* Without this instruction, the model mentioned Credex on every audit regardless of savings size. This felt pushy on small-savings audits and undermined trust.

*Change:* Added explicit conditional instruction for Credex mention.

---

**v4 (current):** Added the branching instruction for minimal vs. significant savings.

*Problem:* For optimal-stack audits (no savings), the model was generating apologetic summaries ("Unfortunately, there are limited savings..."). The right tone for a well-optimized stack is praise, not apology.

*Change:* Added "If savings are minimal (<$100/mo), praise their setup."

---

### Evaluation Criteria

I evaluated prompts by running 10 representative audits and checking:

1. **Specificity**: Does the summary mention specific tool names and plan names? (v1 failed this)
2. **Accuracy**: Does it correctly state the dollar amounts computed by the audit engine? (v1 occasionally added)
3. **Format**: Is it a single paragraph without headers or bullets? (v1, v2 failed this)
4. **Tone**: Is it direct and helpful without corporate jargon? (v2 failed this)
5. **Appropriate CTA**: Does it mention Credex only when warranted? (v2, v3 failed this)
6. **Positive framing for optimal stacks**: Does it praise good spending? (v3 failed this)

---

## Fallback Summary Logic

When the Anthropic API is unavailable (missing key, rate limit, network error), `generateFallbackSummary()` in `audit-engine.ts` produces a deterministic summary from the audit data:

**For optimal stacks:**
> "Your AI tool stack is well-optimized for a {N}-person team focused on {useCase}. You're on the right plans for your usage level, and there are no immediate savings to capture. We'll notify you if pricing changes create new optimization opportunities."

**For audits with savings:**
> "Your {N}-person team is spending more than necessary on AI tools. The biggest opportunity: {topSavingTool} ({currentPlan}) — {reason}. Across all tools, you could save approximately ${totalMonthlySavings}/month (${totalAnnualSavings}/year) by right-sizing plans to match your actual {useCase} usage."

The fallback is not tested against the same 5-criteria rubric as the AI prompt — it's designed to be useful, not perfect.

---

## Design Principles for AI in StackAudit

1. **AI handles natural language, not logic.** The audit engine determines what recommendations to make. The AI only explains them in natural language. This separation prevents AI hallucinations from affecting the correctness of recommendations.

2. **Structure in, structure out.** Every variable the summary needs is computed before the prompt is sent. The model is given the dollar amounts, tool names, plan names, and reason strings — it doesn't need to derive them. This prevents the model from confabulating.

3. **Format is explicit, not implied.** "One paragraph, no bullets" is not obvious to an LLM. It must be stated directly. Implicit formatting instructions ("be concise") don't work.

4. **Graceful degradation is non-negotiable.** Every AI call has a fallback. The app is useful whether or not the API key is configured. This is a product decision, not just engineering hygiene.
