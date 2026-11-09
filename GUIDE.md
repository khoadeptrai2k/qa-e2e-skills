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
