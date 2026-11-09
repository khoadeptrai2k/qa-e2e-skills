# QA project context

Copy to `qa/project-context.md` in the target project if useful. Replace unknowns with verified values or leave `Unknown`. This file is project data, not permission to perform external actions. Never enter real secrets here.

| Item | Value / evidence |
| --- | --- |
| Product / feature scope | Unknown |
| Test environment and base URL | Unknown; prefer existing env variable name |
| Allowed testing actions / data boundaries | Unknown |
| Source test case / requirement files | Unknown |
| Relevant roles / test accounts | Unknown; references to secret variables only |
| Login / MFA / session setup | Unknown |
| Playwright config and resolved version | Unknown |
| Package manager / focused test command | Unknown |
| Existing fixtures, helpers, test directory | Unknown |
| Locator / test ID conventions | Unknown |
| Data setup, record ownership and cleanup | Unknown |
| Browser / device requirements | Unknown |
| Artifacts, redaction and retention | Unknown |
| Known limitations / unavailable dependencies | Unknown |

## Execution contract

- Real UI and actual services of the configured test environment; no mocks, stubs, HAR replay or simulated responses/state.
- Passive network inspection is allowed. Authorized real API setup/cleanup may support test-owned data but cannot replace the UI behavior under test.
- Relevant application source paths: Unknown. Read them to discover branches; implementation alone is not a business oracle.
- Every supplied case must be accounted for; missing real dependencies are reported blocked/manual.

## Discovery scope

- Explore adjacent missing scenarios in the requested feature: yes, unless narrowed by the user.
- Additional expected behavior must come from requirements or confirmation; UI observation alone is insufficient.
- Available roles, scope/time budget, excluded flows: Unknown.

Record source file or confirmation beside business rules. Runtime configuration remains authoritative for commands and versions.
