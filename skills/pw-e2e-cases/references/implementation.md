# Implementation

Apply this when writing or extending Playwright tests. The E2E contract, linked from the skill, still governs execution.

- Use verified user-facing locators (`getByRole`, `getByLabel`) or explicit test IDs. Scope and use exact matching where needed. CSS is acceptable when evidenced and stable. Do not use arbitrary `first()` or `nth()` to hide an ambiguous match.
- Use web-first assertions and observable readiness. Pair important actions with their specified outcomes. Preserve each meaningful expected result. Avoid fixed sleeps, force clicks, swallowed errors, and conditional assertions that turn missing behavior into a pass.
- Keep one coherent journey in one test, with `test.step` where it helps. Give independent scenarios their own starting state. Include case IDs in test names or annotations. Parameterize only when each outcome stays traceable.
- Reuse fixtures and helpers. Add a page or component object when actual reuse justifies it. Do not restructure the suite for a small addition.
- Isolate backend records as well as browser storage. Use fixture-owned data and clean up only records the run created. Shared auth is suitable only when tests do not interfere with each other's server state. Keep a real login flow for login cases even if other tests reuse auth.
- Retain existing browser projects and CI behavior. Add only necessary configuration. Start a new suite with one supported browser. Parallelize after account and data isolation is established. Read the installed version's help before adopting an unfamiliar API.
