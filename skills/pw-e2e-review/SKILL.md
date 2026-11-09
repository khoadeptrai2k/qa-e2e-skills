---
name: pw-e2e-review
description: Review Playwright E2E code against source test cases and discovered scenarios for meaningful assertions, missing coverage and reliability. Use to audit existing or newly generated tests; report actionable findings without editing code unless requested.
---

# Review case-based E2E tests

Read applicable repository instructions, supplied test cases and requirements, relevant tests, helpers, fixtures, and config. Use `qa/project-context.md` if available. Reply in the user's language. Write test titles, code comments, and saved documents in English unless the repository already uses another language. No sibling skill is required. Read [E2E contract](references/e2e-contract.md) and treat a breach of it as a finding, including a breach inherited from fixtures or config.

## Check contract and execution

Map each in-scope case and meaningful expected outcome to a test, step, or assertion. Mark partial coverage and missing assertions explicitly. If case sources are unavailable, review code quality and state that business coverage cannot be established. Keep a discovered scenario separate when its expected behavior has no source.

Check for false passes: conditional assertions, empty bodies, swallowed exceptions, missing awaits, skips, and expectations copied from actual output without an independent oracle. Verify that the test would fail if its named behavior broke.

Check locators for verified intent and uniqueness, synchronization for observable readiness, and setup for both browser and backend isolation. Inspect fixture teardown ownership, shared auth mutations, order dependence, parallel collisions, and secret or artifact handling. Check the contract's test-quality list item by item, including cleanup that can stop early and `test.fail()` reported as a pass. Search the repo's existing fixtures and helpers and report new test code that duplicates one. Recommend an abstraction only when duplication or behavior justifies it.

Review existing execution evidence. When permitted and useful, run focused tests and relevant static checks. Distinguish static reasoning from an observed failure. Test listing and compile success do not prove E2E behavior. Preserve existing files in a review-only task. Done when every in-scope case is mapped or marked unmapped, and each suspected false pass has been checked against the contract.

## Deliver findings

Lead with actionable defects ordered by impact. For each: file and line, concrete trigger, effect, source case or evidence, and the minimal correction. Distinguish a confirmed finding from a hypothesis that needs runtime or business evidence. Report no findings when none are supported. Do not fill a quota.

Include a compact case-to-assertion coverage map, missing or proposed cases, commands actually run, and their outcomes. Do not claim complete coverage when the source or environment is incomplete. Make edits only when the user asks for fixes.

Check delivered E2E documentation for case-to-test mapping, prerequisites, copyable per-case and module commands, artifact locations, and truthful verification status. Report missing or misleading instructions as actionable findings when they prevent running or understanding the delivered cases. Review-only work still leaves files unchanged.
