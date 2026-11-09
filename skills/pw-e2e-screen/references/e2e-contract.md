# E2E contract

Shared by every skill in this kit. Writing, debugging, and reviewing tests all follow it; a breach found in a review is a finding.

## Execution

The behavior under test runs through the real UI and the actual services of the configured test environment.

- Do not use network or service mocks, stubs, HAR replay, fulfilled or modified responses, a fake backend, injected application state, or patched browser APIs to simulate an outcome.
- Passive request and response observation is allowed.
- Inspect reused fixtures and config for hidden mocking. Avoid mocked projects and report the conflict instead of inheriting it.
- An authorized real API call may prepare or clean up records the test owns. It must not replace a UI step the case is testing.
- Reusing storage state from a genuine login is acceptable for scenarios that are not about login. Session and login behavior itself uses real UI authentication.
- If a required service, role, or failure state cannot be exercised for real, report the case blocked or manual. Do not change application code to manufacture that state.
- A failure state that cannot be produced for real (a 500 response, a timeout, a third-party outage) is a coverage gap, not a pass. List it as blocked or manual with what would make it testable, such as a test-environment toggle or a fault-injection endpoint owned by the application team.
- Keep secrets in the existing environment or secret mechanism. Redact shared evidence.

## Oracles

- Supplied cases, observed UI behavior, and confirmed requirements are separate sources. Implementation shows candidate branches and locator intent. It is not an independent correctness oracle. Prefer the case or requirement, flag conflicts, and leave unsupported business expectations proposed.
- A price, eligibility, or permission expectation comes from the case or another documented source. Reproducing application logic in the test is not an oracle.
- A negative assertion ("nothing was created") must be able to fail, and must not depend on data the test does not own. Observe what the page sends, or query only records created during this test or carrying this test's unique data. Never assert that a shared environment holds no record of some kind.

## Test quality

Each item below is a breach unless a comment cites a concrete, verified reason:

- Fixed sleeps (`waitForTimeout`), `waitForLoadState("networkidle")`, or polling loops in place of a web-first assertion on observable state.
- `force: true`, `dispatchEvent` to bypass actionability, or `first()` / `nth()` to hide an ambiguous match.
- Conditional assertions, `try/catch` that swallows a failure, optional or soft checks that let missing behavior pass, or an expectation copied from actual output.
- `test.skip`, `test.fixme`, a weakened expectation, or more retries or a longer timeout used to bypass a valid failure.
- `test.fail()` without project policy or user direction, without an annotation linking the defect, or reported as a pass. See the run results below.
- Cleanup that can stop early: teardown must attempt every owned record, newest first, and report all failures together.
- A new helper, fixture, or page object that duplicates one the repository already has.

A condition that only decides what to clean up (for example registering a created ID when the create call succeeded) is not a conditional assertion, provided the outcome itself is asserted unconditionally.

## Status vocabulary

Use exactly these words in replies, mappings, discovery reports, and runbooks.

| Field | Values |
| --- | --- |
| Case decision (before implementing) | `ready` (expected result established), `proposed` (needs business confirmation), `blocked` (missing prerequisite named), `manual`, `duplicate` (of a named ID) |
| Coverage (after implementing) | `automated`, `partial`, `proposed`, `blocked`, `manual`, `duplicate` |
| Screen inventory item (`RT-N`, `EL-N`) | a coverage value above, or `uncovered` (no case or test addresses it yet), or `reachability` (only a reachability check exercises it; not business coverage) |
| Run result | `passed`, `failed`, `flaky` (passed only after retry), `skipped`, `expected-fail` (marked `test.fail()`, failure cause verified against the linked defect), `blocked`, `not-run` |

`expected-fail` is never counted as passed. Report it on its own line with the defect link and the verified failure message. If the failure message does not match the linked defect, report the test as `failed`.
