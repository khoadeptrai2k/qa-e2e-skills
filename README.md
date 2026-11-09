# Playwright QA Kit

Skills for **test case → find missing UI coverage → write Playwright E2E → run → report evidence**. For Cursor, Claude Code, and Codex. Agent instructions, replies, and documents are English.

Start with the [step-by-step guide](GUIDE.md): install, a short prompt, dependencies such as Booking → Driver / Vehicle / Rate, the docs you get back, and how to rerun.

## Four skills

| Skill | When to use it |
| --- | --- |
| `pw-e2e-cases` | Write and run E2E from test cases, including a UI walkthrough of the same feature when a browser is available |
| `pw-ui-explore` | Walk the UI and record missing cases and defect candidates with steps and evidence. Discovery only; it does not write tests |
| `pw-e2e-debug` | Diagnose a failing or flaky test and separate test, application, data, and environment causes |
| `pw-e2e-review` | Review assertions, case mapping, and stability. It does not edit code unless asked |

Each skill stands alone. It does not need the qa-skills repo, a QA runner, an agent framework, or a specific MCP server. Live UI exploration needs browser tooling and access to a real environment. This kit does not install Playwright, browsers, dependencies, or MCP config.

## Install into a project

Requires Python 3.9+. Unzip first if you are using a ZIP. From the kit directory:

```bash
python3 install.py --project "/absolute/path/to/your-project" --agent all --dry-run
python3 install.py --project "/absolute/path/to/your-project" --agent all
```

Replace the path with the real repo. You can pass `--agent cursor`, `--agent claude`, or `--agent codex` instead of `all`.

| Tool | Where the kit installs skills |
| --- | --- |
| Codex | `<project>/.agents/skills/<skill>/SKILL.md` |
| Cursor | The shared path `<project>/.agents/skills/<skill>/SKILL.md` |
| Claude Code | `<project>/.claude/skills/<skill>/SKILL.md` |

Cursor reads both `.agents/skills` and `.cursor/skills`. The installer uses the Codex path so Cursor does not load two copies of the same skill. If you install Cursor skills under `.cursor/skills` yourself, keep one copy in each location Cursor reads.

The installer copies the four skills, checks for conflicts before writing, and refuses to overwrite or follow a symlink on the destination path. It does not edit `AGENTS.md`, `CLAUDE.md`, rules, tests, or project config. If a skill of the same name already exists, compare and update it by hand. If a filesystem error happens mid-copy, use the printed paths to see what was copied. There is no automatic rollback.

After install, open a new chat in that project and check the tool's skill list. Name the skill if the agent does not select it. In Codex use `$pw-e2e-cases`. In Claude Code and Cursor use `/pw-e2e-cases`, or name it in a normal sentence. If the organization restricts custom skills, check that tool's policy.

This kit is for a coding agent with repo and tool access. Pasting the Markdown into an ordinary Claude chat does not give the agent control of an application.

## Real E2E, one request

`pw-e2e-cases` is the only entry for a full screen or module: read every case, read the related source, walk the UI for missing cases, write tests, run them, and report results. You do not call the four skills in sequence. The other three are for explore-only, debug-only, or review-only work. `pw-ui-explore` stops at a discovery report.

Every source case gets a mapping result. Do not stop after a sample and call that complete. A case missing an expected result, an account, or a real precondition can stay proposed, blocked, or manual. "Full" means every in-scope case is implemented or explained. It does not mean every possible product defect was found.

The agent may read frontend and backend source for validation, permissions, routes, state, and missing branches, and must cite file and line. Current implementation is not the correct answer when it conflicts with a requirement.

**No mocks, stubs, fake backends, HAR replay, forged or edited responses, or injected state**, including from an existing fixture or config. The journey goes through the UI and the real services of the test environment. Passive network observation is allowed. Auth state from a real login is allowed for cases that are not about login. A real API may prepare or clean up data when that is permitted. If that API call is the behavior the case is testing, the step still goes through the UI. A condition that cannot be reproduced for real is reported blocked or manual.

## How to ask

### Write tests and find missing cases

```text
Use pw-e2e-cases on every test case in <file> for the <feature> screen/module.
Also read source at <source paths> to find missing cases.
E2E only, against the real test-environment UI and backend. No mocks or stubs.
Read the existing config and conventions. Walk the test-environment UI for
cases missing from the same feature. Record new cases as DISC-N with evidence.
Write and run cases whose expected result is established. Keep unclear
business behavior proposed, and report the question that needs confirmation.
```

### Explore the UI only

```text
Use pw-ui-explore on <feature> and compare it with the test cases in <file>.
Find missing branches. Save steps, actual result, expected result, and its source.
Produce the case and defect-candidate list only. Do not write automation.
```

### Diagnose or review

```text
Use pw-e2e-debug to diagnose test <file or case ID> from this log/trace.
Fix a test defect if there is one. Keep an assertion that is exposing an application defect.
```

```text
Use pw-e2e-review to review <test files> against <test case file>.
Report only findings that have evidence, plus coverage mapping and what was not checked.
```

## Docs and run commands are required output

After implementation, the skill creates or updates the module's E2E docs using the repo's conventions, or `qa/e2e/<feature>.md` when none exist. The doc includes:

- Scope, case source, and a mapping of each source case and `DISC-N` to the test file, test name, expected result, and status.
- Working directory, dependency and browser setup, environment variable names, roles, and how to prepare and clean up data.
- Copyable commands for the whole module and each implemented case, using the real config, browser, and package manager.
- Commands to open the report or trace, with the real artifact paths.
- Commands that were actually run, and the result. Separate not-run, blocked, failed, flaky, and passed.

A case that was not implemented does not get a fake command. A command checked only with `--list` does not prove the test passed. An explore-only run saves a discovery report and does not claim that tests or run commands exist.

## Project context

If you need it, copy `templates/project-context.md` to `qa/project-context.md` in the repo and fill in what you know. `templates/test-case.md` is for new cases. You do not have to convert an existing case file. Do not put real passwords, tokens, or cookies in these files.

Three sources stay distinct: the **source case**, **behavior observed in the UI**, and a **confirmed requirement**. What the UI does now does not prove that behavior is correct. The skills may explore inside the scope you give them. A case without a trustworthy expected result is proposed, not turned into a guessed assertion.

The skills do not change an expected result, skip a test, or mock a business flow to force a pass. They forbid mocks and stubs in the E2E journey itself, not only mocks used to force green. They report written/not-run, passed, flaky, failed, skipped, and blocked separately. They do not ask for CI, a browser matrix, or a large framework for a small test.

## Proof and limits

Structure and frontmatter were checked, and the installer was exercised in a temporary directory: single-agent and all-agent copy, conflict refusal, dry-run, and reference files copied with each skill. `sample/` is a local Booking module with a real page and HTTP service. On 2026-11-09, `npm run test:e2e` in `sample/` passed 3 tests on Chromium (`@playwright/test` 1.65.0): BK-01, BK-02, and BK-03. BK-04 stayed blocked. DISC-01 stayed proposed. Details are in `sample/qa/e2e/booking.md`. That run is not proof on three products or an arbitrary website. Results still depend on the model, permissions, data, and browser tools of each host.

## References

- [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

Checked on 2026-11-09. The workflow text is written for this kit. The kit does not vendor the qa-skills repo.
