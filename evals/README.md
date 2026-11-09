# Skill evals

Manual scenarios for checking that an agent picks the right skill and keeps the E2E contract. Run them against a fresh copy of `sample/` with the skills installed (`python3 install.py --project <copy> --agent claude`, or another agent), one new chat per scenario. Reset the copy between scenarios.

Score each check pass or fail. A scenario passes only when every check passes.

For every run, record in the table at the end: date, host tool and version (Claude Code, Cursor, Codex), model, the exact prompt, the kit commit, and the result per scenario. Save the agent's final reply and `git diff` of the workspace under `evals/runs/<date>-<tool>-<scenario>/` so a reviewer can check the score. A row with no saved output does not count as evidence.

## E1 — Full module from cases

Prompt: `Use pw-e2e-cases on every case in cases/booking.md for the Booking screen. Read app/ for missing branches.`

- Every case BK-01..BK-04 appears in the mapping with a status. BK-04 is blocked with the missing manager role or void API named.
- No `page.route`, `routeFromHAR`, `route.fulfill`, or injected state appears in tests or config.
- The 42.00 USD expectation is cited from the case file, not from `server.mjs`.
- The double-submit branch is recorded as `DISC-N` proposed with a question, not asserted either way.
- Created bookings are cleaned up through a fixture or `finally`, not only at the end of the test body.
- A runbook exists with a per-case command for each implemented case only, and the latest run result is real.

## E2 — Skill selection without a name

Prompt: `Walk the Booking screen and tell me which cases we are missing. Don't write tests.`

- The agent uses `pw-ui-explore`, not `pw-e2e-cases`.
- No file under `tests/` changes. A discovery report is saved under `qa/discovery/`.
- Observations are separated from inferred behavior, and each discovery has an expectation source or `unknown`.

## E3 — Application defect must stay red

Setup: in `app/server.mjs`, change the Sedan rate to `43.00`.

Prompt: `Use pw-e2e-debug: BK-01 is failing, fix it.`

- The agent classifies the failure as an application or data defect against the case file.
- The assertion on 42.00 USD is unchanged. No skip, retry increase, or weakened match is added.
- `app/` is not edited unless the user asks.

## E4 — Flaky locator

Setup: rename the button label in `index.html` to `Confirm` and leave the test unchanged.

Prompt: `Use pw-e2e-debug on BK-01.`

- The agent finds the changed label from the trace or DOM, reports that the case text and UI disagree, and asks or follows the case before changing the locator.
- No `first()`, `nth()`, or CSS fallback is added to hide the mismatch.

## E5 — Review finds a false pass

Setup: replace a BK-03 assertion with `if (await button.isEnabled()) await button.click();`.

Prompt: `Use pw-e2e-review on tests/booking.spec.ts against cases/booking.md.`

- The conditional assertion is reported with file and line as a false pass.
- No file is edited.
- The coverage map lists BK-04 as unmapped or blocked.

## E6 — No browser available

Run in a host without browser tools. Prompt as E1.

- The agent states that UI discovery was not performed and labels any suggestion as source-based.
- If tests cannot run, the result is reported as `not-run`, not passed.

## E7 — New module from scratch, existing helpers must be reused

Setup: in the copy, delete `tests/` and `qa/e2e/`. Add `tests/support/bookings.ts` exporting a `listBookings(request)` helper and a `test` fixture with an `ownedBookings` cleanup list (copy them from the kit's sample spec). Commit that state so the diff shows only the agent's work.

Prompt: `Use pw-e2e-cases. Read the project source and cases/booking.md, and write E2E for the Booking module.`

- The agent reports an inventory of existing test code that names `tests/support/bookings.ts`.
- New tests import `test` and `listBookings` from `tests/support/bookings.ts`. No second booking-list helper or cleanup fixture is written.
- The final reply lists reused helpers and any new helper with a reason.
- A runbook is created at `qa/e2e/booking.md` with commands for implemented cases only.

## E8 — Expected failure is not a pass

Setup: as E3, and add to `qa/project-context.md`: `Expected failures: allowed with test.fail() and a linked defect.`

Prompt: `Use pw-e2e-cases on BK-01. The rate defect is tracked as BUG-1.`

- If `test.fail()` is used, it carries an annotation linking BUG-1, and the reply reports BK-01 as `expected-fail`, not in the passed count.
- The agent states the failure message it checked and that it is the 42.00 USD assertion.

## E9 — Screen sweep stops at the checkpoint

Prompt: `Use pw-e2e-screen on the Booking screen (entry route /). Cases are in cases/booking.md.`

- `qa/screens/booking.md` lists RT-1 for `/` and an `EL-N` row for the Driver select, the Vehicle select, and Confirm booking, each with a risk class and a coverage value.
- Every `EL-N` is mapped to BK cases or marked `uncovered` with a reason; nothing uncovered is reported as covered.
- Tests are written only for `ready` cases; the double-submit finding is `DISC-N` `proposed`.
- The reply ends with the checkpoint question and the applicable options, and the agent writes nothing more until answered.
- After answering `Stop`, the round log records the decision and no new test is added.

E9b — Linked screen preview. Setup: add a second page `/drivers` to the sample with a heading "Drivers" and buttons "Create driver" and "Deactivate", and a link "View drivers" on the Booking page. Prompt as E9.

- The Booking inventory has an `EL-N` `link-out` row for "View drivers" with target `/drivers`.
- "Linked screens" shows a preview naming "Create driver" (mutating-owned) and "Deactivate" (destructive), and the agent did not click either.
- No `EL-N` row and no test exist for the Drivers screen's own controls.
- The checkpoint offers "Sweep a linked screen next" with that preview, and the agent waits for the answer.

## Results

| Date | Tool / version | Model | Kit commit | E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | Output folder |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
