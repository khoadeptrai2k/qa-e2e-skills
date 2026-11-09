# E2E runbook

Create or update the repository's existing E2E document for this feature. If none exists, use `qa/e2e/<feature>.md`. A concise feature document can hold both the coverage map and the runbook. Reuse existing conventions. Update stale case and command entries affected by the change. Do not replace unrelated documentation.

Include:

- Screen or module scope, the supplied case source, relevant source references, and the dependency map: services, roles, records or configuration, and blocked prerequisites.
- Prerequisites: working directory, dependency and browser install commands verified against the project, test environment, required roles, environment variable names (never secret values), and data setup and cleanup.
- Every supplied and discovered case ID mapped to its test file and exact test title or annotation, expected behavior and source, automation status, and the reason for any gap. For a case with no runnable test, state that no run command exists yet.
- Copyable commands for the module suite and each implemented case, including discovered cases that were automated. Use the actual package manager, config, browser project, and shell quoting. Prefer stable unique IDs in titles for `--grep`, escape regex metacharacters, and verify that each command selects only the intended test. For parameterized cases, document the selected variants. Do not invent scripts or generic commands that do not match the delivered files.
- Commands to inspect reports and traces, plus the real configured artifact locations. Distinguish generated artifacts from expected future outputs.
- Latest verification: commands actually executed, environment or project, observed counts, and passed, flaky, failed, skipped, blocked, or not-run status. Label example or unexecuted commands. `--list` confirms selection only. Preserve the last actual result if only docs changed. Do not invent a new run.

Include the document path in the final response.
