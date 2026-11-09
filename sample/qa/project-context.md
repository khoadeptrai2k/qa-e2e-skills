# QA project context

| Item | Value / evidence |
| --- | --- |
| Product / feature scope | Sample Booking screen in `sample/` |
| Test environment and base URL | `http://127.0.0.1:4173`, overridden by `PORT` |
| Allowed testing actions / data boundaries | Local process only. Create and delete bookings produced by the run. |
| Source test case / requirement files | `sample/cases/booking.md` |
| Relevant roles / test accounts | Dispatcher is implicit. No login. No manager role. |
| Login / MFA / session setup | None |
| Playwright config and resolved version | `sample/playwright.config.ts`. Installed `@playwright/test` 1.65.0. |
| Package manager / focused test command | npm. `npm run test:e2e` from `sample/` |
| Existing fixtures, helpers, test directory | `sample/tests`. No shared fixtures. |
| Locator / test ID conventions | Labels and roles. No test ids. |
| Data setup, record ownership and cleanup | Server memory starts empty. BK-01 deletes the booking it creates. |
| Browser / device requirements | Chromium via the Playwright `chromium` project |
| Artifacts, redaction and retention | HTML report under `sample/playwright-report`. Trace retained on failure. No secrets. |
| Known limitations / unavailable dependencies | No manager role and no void API. BK-04 stays blocked. |

## Execution contract

- Real UI and the sample HTTP service. No mocks, stubs, HAR replay, or simulated responses.
- Passive network inspection is allowed. Cleanup may call `DELETE /api/bookings/:id` for a booking the test created.
- Application source: `sample/app/server.mjs` and `sample/app/public/index.html`. Read them for branches. The case file is the oracle for 42.00 USD.
- Every supplied case must be accounted for. BK-04 is blocked.

## Discovery scope

- Explore adjacent missing scenarios on Booking.
- An extra expected result needs a requirement or confirmation.
- One role. No payment, message, or production mutation.
