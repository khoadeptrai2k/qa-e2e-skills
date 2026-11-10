# How to use the Playwright QA Kit

Vietnamese version: [HUONG-DAN.md](HUONG-DAN.md).

## Step 1 — Install or upgrade the skills

In a terminal at the kit directory (the one with `install.py`):

```bash
python3 install.py --check
python3 install.py --project "/path/to/the-test-repo" --agent all --dry-run
python3 install.py --project "/path/to/the-test-repo" --agent all
```

`--check` validates the kit itself. `--dry-run` prints what would be copied. Replace `all` with `claude`, `cursor`, or `codex` for one tool. Install once per repo.

**Upgrading.** The installer never overwrites. Delete the old skill folders in the project first, then install again:

```bash
cd "/path/to/the-test-repo"
rm -rf .claude/skills/pw-e2e-* .claude/skills/pw-ui-explore .agents/skills/pw-e2e-* .agents/skills/pw-ui-explore
```

Then rerun the install command. Your tests, `qa/` documents, and project context are not touched.

## Step 2 — Prepare the project

Open the test repo in Claude Code, Cursor, or Codex and start a **new chat** so the skills load. The agent needs:

- **Case files**: the path, or attach them. Any readable format; `templates/test-case.md` is optional.
- **Source access**: frontend and backend in the same workspace, or a readable path to them.
- **A running test environment**, a test account per role, and browser tooling for live UI work.
- **Secrets in env variables** or the project's secret mechanism. Never in docs or chat.
- **Playwright already installed** in the repo. The kit does not install it.

Optional: copy `templates/project-context.md` to `qa/project-context.md` and fill in what you know (base URL variable, roles, run command, helper folders). The agent verifies and completes it.

## Step 3 — Pick the skill

| You want | Skill | Stops when |
| --- | --- | --- |
| Tests for every case in a case file, plus missing cases found on the way | `pw-e2e-cases` | All cases mapped, tests run, runbook written |
| Every button, link, tab, dialog, and sub-route of one screen inventoried and tested, round by round | `pw-e2e-screen` | After each round, at a checkpoint question |
| New test cases written by walking the UI, no code | `pw-ui-explore` | Discovery report saved |
| A failing or flaky test fixed or explained | `pw-e2e-debug` | Cause classified, smallest fix verified |
| An audit of existing tests, no edits | `pw-e2e-review` | Findings and coverage map reported |

You do not chain them. Each one runs alone. Name the skill in the first sentence; `/pw-e2e-screen` (Claude Code, Cursor) or `$pw-e2e-screen` (Codex) also works.

## Step 4 — Preflight checklist

Run these in the project under test (not the kit) before `pw-e2e-cases` or `pw-e2e-screen`.

| # | Check | Command | Expect |
| --- | --- | --- | --- |
| 1 | Skills installed | `ls .claude/skills .agents/skills` | The five `pw-*` folders |
| 2 | Playwright in the project | `npx playwright --version` | A version number |
| 3 | Browser installed | `npx playwright install chromium` | Downloaded or already installed |
| 4 | Config loads | `npx playwright test --list` | No config error (an empty list is fine) |
| 5 | Test environment up | `curl -I "$BASE_URL"` (use your project's variable) | HTTP 200 or 3xx |
| 6 | Account variables set (names only) | `env \| grep -E "E2E_\|TEST_" \| cut -d= -f1` | The variable names your tests need |
| 7 | Clean git state | `git status --short` | Empty, so the agent's diff is easy to read |

By hand:

- [ ] Case file path known; for `pw-e2e-screen`, the entry route too.
- [ ] Frontend and backend source readable by the agent.
- [ ] Browser tooling available to the agent (without it the agent works from source and says so).
- [ ] Test environment, **not production**.
- [ ] Optional: `qa/project-context.md` from `templates/project-context.md`.
- [ ] A **new chat** opened after installing.

## Step 5 — Command reference

### How to call a skill

| Tool | Syntax | Example |
| --- | --- | --- |
| Claude Code, Cursor | `/<skill> <request>` | `/pw-e2e-screen Booking screen (entry route /bookings) …` |
| Codex | `$<skill> <request>` | `$pw-e2e-screen Booking screen (entry route /bookings) …` |
| Any tool | Name the skill in the first sentence | `Use pw-e2e-screen on the Booking screen …` |

All three behave the same. Write the request after the skill name on the same message. Keep secrets out of the prompt; refer to env variable names instead.

### `pw-e2e-cases` — tests from a case file

| | |
| --- | --- |
| Required | Case file path; module or screen name |
| Optional | Source paths; roles to use; "only these cases: BK-01, BK-03"; "do not explore the UI" |
| The agent may ask | A missing expected result, account, or environment value that blocks a case |
| You get | Tests, `qa/e2e/<module>.md` runbook, mapping of every case and `DISC-N`, run results |
| Next | `pw-e2e-review` on the new tests |

```text
/pw-e2e-cases every case in cases/booking.md for the Booking module.
```

```text
/pw-e2e-cases every case in cases/booking.md for the Booking module.
Read source at web/src/booking and api/src/booking. Roles: dispatcher (E2E_DISPATCHER_*).
Real test environment, no mocks. Keep unclear business behavior proposed and list the questions.
```

### `pw-e2e-screen` — sweep one screen in rounds

| | |
| --- | --- |
| Required | Screen name and entry route |
| Optional | Case file paths; roles; "do not click <control>"; sub-routes to skip |
| The agent asks | The checkpoint question at the end of every round |
| You get | Tests, `qa/screens/<screen>.md` inventory (`RT-N`, `EL-N`, linked screens, round log), runbook |
| Next | Answer the checkpoint; after `Option 5`, run `pw-e2e-review` |

```text
/pw-e2e-screen Booking screen (entry route /bookings). Cases are in cases/booking.md. Ask me before writing more.
```

```text
/pw-e2e-screen Booking screen (entry route /bookings). Cases are in cases/booking.md and cases/booking-detail.md.
Roles: dispatcher, manager. Do not click "Export CSV" or "Void". Ask me before writing more.
```

Checkpoint replies (send as a normal message, no slash needed):

| Reply | Meaning |
| --- | --- |
| `Option 1: EL-4, EL-6` | Write tests for these items (expected result must already be established) |
| `Option 2: added cases/booking-detail.md` | Read the new file and map it next round |
| `Option 3` | Reachability checks for uncovered safe items |
| `Option 4: Driver` | Sweep the linked Driver screen next |
| `Option 5` | Stop and finalize the documents |

To resume another day, send the first prompt again in a new chat; the agent continues from `qa/screens/<screen>.md`.

### `pw-ui-explore` — write new cases from the UI, no code

| | |
| --- | --- |
| Required | Screen or feature name |
| Optional | Existing case file to compare against; roles; areas to skip |
| The agent may ask | Login or role it cannot reach |
| You get | `qa/discovery/<screen>.md` with `DISC-N` cases, evidence, and business questions |
| Next | Answer the questions, then `pw-e2e-cases` on the confirmed file or `Option 2` in `pw-e2e-screen` |

```text
/pw-ui-explore Booking screen. Compare with cases/booking.md. Write missing cases with steps, actual result, and the question that needs a business answer. No test code.
```

### `pw-e2e-debug` — fix or explain a failing test

| | |
| --- | --- |
| Required | Test file or case ID |
| Optional | Failure output, trace or report path; "CI only"; "fails 1 in 5 runs" |
| The agent may ask | Permission to edit application code (it does not by default) |
| You get | Cause classified as test, application, data, or environment; the smallest fix; rerun results; runbook update if commands changed |
| Next | `pw-e2e-review` if the fix touched shared helpers |

```text
/pw-e2e-debug BK-01 in tests/booking.spec.ts. Trace: test-results/booking-BK-01-chromium/trace.zip
```

### `pw-e2e-review` — audit tests, no edits

| | |
| --- | --- |
| Required | Test files |
| Optional | Case file to map against; "fix the findings" (only then does it edit) |
| You get | Findings with file and line, case-to-assertion map, commands it ran and their results |
| Next | Fix findings yourself, or ask `pw-e2e-review … fix the findings` |

```text
/pw-e2e-review tests/booking.spec.ts against cases/booking.md. Do not edit files.
```

## Standard order

1. Step 4: preflight checklist.
2. `/pw-e2e-cases` or `/pw-e2e-screen`.
3. `/pw-e2e-review` on the new tests.
4. `/pw-e2e-debug` when a test fails or is flaky.

## Workflow A — Tests from a case file

```text
Use pw-e2e-cases on every case in <case file> for the <module> module.
Read source at <paths>. Real test environment, no mocks.
```

The agent: inventories existing fixtures and helpers → reads every case → reads source → builds the dependency map → walks the UI for missing cases (`DISC-N`) → writes tests for `ready` cases → runs them → writes `qa/e2e/<module>.md`.

## Workflow B — Sweep one screen, round by round

```text
Use pw-e2e-screen on the <screen> screen (entry route <route>).
Cases are in <case file>. Ask me before writing more.
```

Each round:

1. **Inventory** every sub-route (`RT-N`) and control (`EL-N`) inside the screen, from source and the live UI, with a risk class: `safe`, `mutating-owned`, `destructive`, `external`. Only `safe` and test-owned actions are clicked.
2. **Links out**: a button to another screen gets one landing check and a preview of that screen's main actions, read but not clicked.
3. **Map** each item to cases. Items with no case are `uncovered`.
4. **Write and run** tests for `ready` cases. A case that crosses into another screen is tested end to end.
5. **Save** `qa/screens/<screen>.md` and the runbook.
6. **Checkpoint**: the agent asks and waits.

How to answer the checkpoint:

| Option | Reply example | What happens next |
| --- | --- | --- |
| Write more tests | `Option 1: EL-4, EL-6` | Tests for those items whose expected result is established |
| Add files | `Option 2: added cases/booking-detail.md` | The agent reads the file and maps it in the next round |
| Reachability only | `Option 3` | Tests that each sub-route opens and each safe control reaches its target, labeled `reachability` |
| Sweep a linked screen | `Option 4: Driver` | A new sweep of that screen with its own `qa/screens/driver.md` |
| Stop | `Option 5` | Documents finalized, uncovered items listed with reasons |

To continue later, send the same request in a new chat. The agent reads `qa/screens/<screen>.md` and resumes from the last checkpoint with the same IDs.

## Workflow C — No case file yet

1. **Discover**:
   ```text
   Use pw-ui-explore on the <screen> screen. Write the missing cases with steps,
   actual result, and the question that needs a business answer. No test code.
   ```
   Output: `qa/discovery/<screen>.md` with `DISC-N` cases. Cases without a confirmed expected result are `proposed`.
2. **Confirm**: answer each question in that file or in a case file. Write the expected result and its source (requirement, ticket, or your decision).
3. **Automate**: run Workflow A on the confirmed file, or answer a `pw-e2e-screen` checkpoint with Option 2.

The agent never turns what the UI currently does into an expected result on its own. Step 2 is the human decision.

## Workflow D — Debug or review

```text
Use pw-e2e-debug on <test file or case ID>. Here is the failing output/trace: <path>.
```

```text
Use pw-e2e-review on <test files> against <case file>. Do not edit files.
```

Debug keeps assertions that expose an application defect and reports them. Review lists evidence-backed findings with file and line and changes nothing.

## Dependencies between modules

For Booking, Driver, Vehicle, and Rate may be dependencies. The agent verifies the real relationships from source and the environment, builds a dependency map, prepares test-owned records through the UI or an authorized real API, and cleans them up newest first. The business step under test always goes through the UI. If a role, service, or record is missing, the affected cases are `blocked` with the prerequisite named, and independent cases continue.

**No mocks, stubs, fake backends, HAR replay, forged or edited responses, or injected state.**

## What you get back

| Output | Where | Written by |
| --- | --- | --- |
| Playwright tests | The repo's existing test folders | cases, screen, debug |
| Runbook: case mapping, setup, commands per case and module, last real result | `qa/e2e/<module>.md` or the repo's convention | cases, screen |
| Screen inventory: `RT-N`, `EL-N`, linked screens, round log | `qa/screens/<screen>.md` | screen |
| Discovery report: `DISC-N` cases and questions | `qa/discovery/<feature>.md` | explore |
| Project facts and helper inventory | `qa/project-context.md` | cases, screen |

The final reply also lists helpers reused and any new helper with its reason.

## Status words

| Kind | Values |
| --- | --- |
| Case decision | `ready`, `proposed`, `blocked`, `manual`, `duplicate` |
| Coverage | `automated`, `partial`, `proposed`, `blocked`, `manual`, `duplicate`; screen items also `uncovered`, `reachability` |
| Run result | `passed`, `failed`, `flaky`, `skipped`, `expected-fail`, `blocked`, `not-run` |

`flaky` and `expected-fail` never count as passed. `--list` or a successful compile is not evidence that a test passed.

## Rerun

Copy the command for a case or module from the runbook. This guide does not hard-code a Playwright command because config, project, and package manager differ per repo.

## Check the skills themselves

`evals/README.md` has scenarios E1–E9b that check whether an agent follows the skills (no mocks, oracle from the case, helpers reused, checkpoint respected). Run them in a fresh copy of `sample/` after changing a skill or switching model or tool, and record results there.

## Local sample

`sample/` is a small Booking module with a real page and HTTP service. `install.py` does not copy it into a project. See `sample/qa/e2e/booking.md` for commands and the last observed result.
