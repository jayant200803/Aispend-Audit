# Tests

## Strategy

Testing focus is on the audit engine — the deterministic business logic that all recommendations flow through. The UI components and API routes are not unit tested (coverage there belongs to integration/E2E tests with Playwright or Cypress, which are outside the MVP scope).

## Test Framework

**Vitest** — chosen over Jest because:
- ESM-native (Next.js 14 uses ESM)
- ~10x faster cold start than Jest
- 100% compatible with Jest APIs (`describe`, `it`, `expect`)
- First-class TypeScript support without Babel

## Running Tests

```bash
npm run test          # Single run (used in CI)
npm run test:watch    # Watch mode (used during development)
```

## Test File

`src/test/audit-engine.test.ts` — 10 tests

## Test Cases

| # | Test | What It Verifies | Rule Tested |
|---|------|-----------------|-------------|
| 1 | Optimal spend returns 'keep' | No phantom savings on well-priced plans | Baseline |
| 2 | Team plan with few seats → downgrade | Rule 1: team plan overkill | Rule 1 |
| 3 | Ultra tier → switch_plan | Rule 2: cheaper same-vendor plan | Rule 2 |
| 4 | Gemini Ultra → AI Pro | Rule 2 (bundled extras inflating cost) | Rule 2/3 |
| 5 | High API spend → use_credits | Rule 5: API optimization | Rule 5 |
| 6 | Multi-tool savings aggregation | Savings sum correctly across tools | Aggregation |
| 7 | Credex estimate calculation | Credex savings are computed | Credex |
| 8 | Unknown tool → graceful keep | Error handling | Edge case |
| 9 | Fallback summary generation | generateFallbackSummary() produces content | Summary |
| 10 | Optimal stack → encouraging summary | Correct fallback when no savings found | Summary |

## CI Integration

Tests run in GitHub Actions on every push to `main` and every pull request:

```yaml
- name: Run tests
  run: npm run test
```

The pipeline fails if any test fails. The build step runs only after tests pass.

## Coverage Notes

What's tested:
- All 5 rule types (downgrade, switch_plan, switch_tool, use_credits, keep)
- Savings calculation arithmetic
- Multi-tool aggregation
- Error handling for unknown tools/plans
- Both summary generation paths (with and without AI)

What's not tested (and why):
- **API routes**: These require a running database and would need mocking. The logic in each route is thin — validation (Zod), a database write, and an email send. The risk of bugs here is low; the audit engine logic is where complexity lives.
- **React components**: UI tests with Testing Library would catch rendering bugs, but the component logic is mostly presentation. Snapshot tests would just add noise.
- **Anthropic API integration**: External API calls are not unit tested. The contract is: if the API fails, return the fallback. This is tested indirectly via the fallback summary tests.

## Adding New Tests

When adding a new audit rule, add at least two tests:
1. A case where the rule fires and produces the expected action
2. A case where the rule should NOT fire (near-threshold input)

```typescript
// Example: new rule for "AI Plus tier is overkill for solo users"
it("recommends AI Plus for solo users on Pro", () => {
  // Rule should NOT fire — Pro is already reasonable for a solo user
});

it("recommends downgrade from Pro to Plus for solo users with light usage", () => {
  // Rule SHOULD fire
});
```
