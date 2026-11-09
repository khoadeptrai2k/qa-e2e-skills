# E2E contract

The behavior under test runs through the real UI and the actual services of the configured test environment.

- Do not use network or service mocks, stubs, HAR replay, fulfilled or modified responses, a fake backend, injected application state, or patched browser APIs to simulate an outcome.
- Passive request and response observation is allowed.
- Inspect reused fixtures and config for hidden mocking. Avoid mocked projects and report the conflict instead of inheriting it.
- An authorized real API call may prepare or clean up records the test owns. It must not replace a UI step the case is testing.
- Reusing storage state from a genuine login is acceptable for scenarios that are not about login. Session and login behavior itself uses real UI authentication.
- If a required service, role, or failure state cannot be exercised for real, report the case blocked or manual. Do not change application code to manufacture that state.
- Keep secrets in the existing environment or secret mechanism. Redact shared evidence.
- Supplied cases, observed UI behavior, and confirmed requirements are separate sources. Implementation shows candidate branches and locator intent. It is not an independent correctness oracle. Prefer the case or requirement, flag conflicts, and leave unsupported business expectations proposed.
- A price, eligibility, or permission expectation comes from the case or another documented source. Reproducing application logic in the test is not an oracle.
