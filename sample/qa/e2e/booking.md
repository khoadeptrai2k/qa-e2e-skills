# Booking E2E

## Scope

Sample Booking screen. Supplied cases: `sample/cases/booking.md`. UI: `sample/app/public/index.html`. Service: `sample/app/server.mjs`.

Dependency map:

| Dependency | What the screen needs | Cases |
| --- | --- | --- |
| Driver | `GET /api/drivers`. Ana is available. Ben is unavailable and the option is disabled. | BK-01, BK-02, BK-03 |
| Vehicle | `GET /api/vehicles?driverId=`. Sedan and Van belong to Ana. | BK-01, BK-03 |
| Rate | `GET /api/rates?vehicleId=`. Sedan is 42.00 USD in the case file. Van has no rate and the service returns 404. | BK-01, BK-03 |
| Manager / void | Not in this environment. No role and no void route. | BK-04 blocked |

## Prerequisites

- Working directory: `sample/`
- Install: `npm install` then `npx playwright install chromium`
- Environment: local Node server started by Playwright `webServer` at `http://127.0.0.1:4173`. Override the port with `PORT`.
- Role: implicit dispatcher. No login and no secret variables.
- Data: the server keeps bookings in memory and starts empty. BK-01 deletes the booking it creates with `DELETE /api/bookings/:id`.

## Case mapping

| Case | Expected result and source | Test | Status |
| --- | --- | --- | --- |
| BK-01 | Confirmation names Ana, Sedan, and 42.00 USD, with a BK- id. Source: `cases/booking.md`. | `tests/booking.spec.ts` — `BK-01 confirms a booking for Ana in a Sedan at 42.00 USD` | Automated, passed |
| BK-02 | Ben is shown unavailable and cannot be selected. No booking is created. Source: `cases/booking.md`. | `tests/booking.spec.ts` — `BK-02 keeps unavailable driver Ben from being selected` | Automated, passed |
| BK-03 | Van shows no configured rate and Confirm stays unavailable. No booking is created. Source: `cases/booking.md`. | `tests/booking.spec.ts` — `BK-03 blocks confirmation when Van has no rate` | Automated, passed |
| BK-04 | A manager can void a confirmed booking. Source: `cases/booking.md`. | None | Blocked. No manager role and no void API. No run command exists. |
| DISC-01 | Unknown. See `qa/discovery/booking.md`. | None | Proposed. No run command exists. |

## Commands

From `sample/`, module suite:

```bash
npm run test:e2e
```

One case at a time. Each `--grep` was checked with `--list` and selects only that test. `--list` does not prove a pass.

```bash
npx playwright test --project=chromium --grep "BK-01"
npx playwright test --project=chromium --grep "BK-02"
npx playwright test --project=chromium --grep "BK-03"
```

HTML report from the last run: `sample/playwright-report`. Open it with:

```bash
npx playwright show-report
```

Traces are configured with `retain-on-failure`. The passing run did not write a trace. A failure writes under `sample/test-results/`.

## Latest verification

- Command executed: `npm run test:e2e` from `sample/`
- Playwright: `@playwright/test` 1.65.0, project `chromium`
- Result: 3 passed, 0 failed, 0 flaky, 0 skipped (about 1.4s)
- Not run: BK-04 blocked, DISC-01 proposed
- Selection check only: the three `--grep` commands above each listed 1 test. `BK-04` listed 0 tests.
