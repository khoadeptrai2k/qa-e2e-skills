# How to use the Playwright QA Kit

## Step 1 — Install the skills into the test repo

Unzip the kit. In a terminal at the directory that contains `install.py`, run:

```bash
python3 install.py --project "/path/to/the-test-repo" --agent all
```

Replace the path with the real repo. Install once per repo. You can replace `all` with `cursor`, `claude`, or `codex`. If a skill of the same name already exists, the installer stops. Compare and update by hand instead of rerunning to overwrite. When upgrading, copy the new skill directories over the installed ones, including `references/`.

## Step 2 — Open the repo and provide inputs

Open the test repo in Cursor, Claude Code, or Codex, and start a new chat so the skills are picked up.

- Attach the test-case file or give its path.
- Let the agent read frontend and backend source: same workspace, or read access to the related repo path.
- Have a running test environment, a suitable account, and browser tooling for the UI walkthrough.
- Use the project's secret or env mechanism for accounts. Do not put passwords or tokens in docs.

If the URL, role, or run command is already in the repo, you do not need to type it again. You can record remaining facts in `qa/project-context.md` from the bundled template. Installing a skill does not by itself grant access to a repo, a browser, or an account.

## Step 3 — Send one request

```text
Use pw-e2e-cases. Read the project source and the attached case file,
and write E2E for the Booking module, including related dependencies.
```

Replace `Booking` with the screen or module under test. If the source lives elsewhere, add the path. You can also call `$pw-e2e-cases` in Codex or `/pw-e2e-cases` in Claude Code and Cursor. Naming the skill in a sentence, as above, is enough.

You do not call explore, debug, and review in sequence. `pw-e2e-cases` already covers the flow: read every case, read source, explore the UI, add cases, write and run tests, write docs. Use `pw-ui-explore` only when you want the discovery report and no test code.

## Step 4 — The agent handles dependencies

For Booking, Driver, Vehicle, and Rate may be dependencies. That is an example. The real relationships have to be verified from source and the environment.

| Piece | What the agent does inside the Booking scope |
| --- | --- |
| Driver | Find the availability rule and the data or account the booking or assignment flow needs |
| Vehicle | Find the vehicle type, status, and any relationship to the driver |
| Rate | Find the price configuration that applies, and an expected result that does not come from reimplementing the app's math |
| Booking | Run the journey through the UI and check the related outcomes against the established requirement |

The agent builds a dependency map, uses real test-environment data, and prepares and cleans up records the test owns. A real API may set up or clean up when that is permitted. The business step under test still goes through the UI.

Extra cases may include an unavailable driver, an unsuitable vehicle, or a missing rate **when the real business rules include those conditions**. If it is not clear how the system should behave, record `proposed` and ask. Do not invent the expected result.

Do not expand into a full CRUD suite for every related module. If assigning a driver or calculating a price is the thing under test, that step is part of the E2E journey. Do not replace it with API setup. If a permission, service, or real record is missing, report `blocked`, continue independent cases, and write down how to unblock.

**No mocks, stubs, fake backends, HAR replay, forged or edited responses, or injected state.**

## Step 5 — What you get back

The agent delivers:

- Playwright tests that follow the repo's current structure.
- A mapping of every source case and every added `DISC-N`, including cases that could not be run and why.
- A source or evidence note for a case found from source or the UI, with observation separated from the correct requirement.
- An actual result: passed, flaky, failed, skipped, blocked, or not run.
- E2E docs in the project's convention, or `qa/e2e/<module>.md` when no location exists yet.

The docs contain dependencies, the data, role, and env the run needs, commands for each case and for the module, commands to open the report or trace, and the verification status. A case with no runnable test does not get a fake command.

## Step 6 — Rerun or add cases

Open the docs the agent wrote and copy the command for that case or module. This guide does not hard-code a Playwright command, because config, browser project, and package manager depend on the real repo.

When you add a case or change a screen, send the same short request from Step 3. For a failing test only, use `pw-e2e-debug`. For a review only, use `pw-e2e-review`.

"Handle all of them" means every in-scope case is implemented or explained. It does not mean every case passed, or that every product situation was explored. `--list` or a successful compile is not evidence that E2E passed.

## Local sample

`sample/` is a small Booking module in this kit. It is a live UI and HTTP service for trying the workflow. `install.py` does not copy it into a target project. See `sample/qa/e2e/booking.md` after a run for the commands and the last observed result.
