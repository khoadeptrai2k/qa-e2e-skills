---
name: pw-e2e-debug
description: Diagnose and repair failing or flaky Playwright E2E tests using traces, logs and case expectations. Use for timeouts, locator failures, authentication, data collisions or CI-only failures; preserve valid assertions and distinguish application defects from test defects.
---

# Diagnose Playwright failures

Read applicable repo instructions, the failing test, its source case, fixtures, and config. Preserve the expected business behavior. Write every reply and document in English. No sibling skill or specific tool server is required. Read [E2E contract](references/e2e-contract.md) and keep the repair inside it.

## Find the failing transition

Start with the existing failure output, trace, screenshot, console, and network evidence. Identify the last successful state and the first incorrect transition. Reproduce the smallest relevant test with the original browser, project, and environment where possible. Record the exact command and whether the failure reproduces. One passing retry does not resolve flakiness.

Classify with evidence, and keep uncertainty visible:

- Test: stale or ambiguous locator, missing await, wrong setup, or an assertion that does not match the source case.
- Application: UI or backend behavior violates an established expected result.
- Data: stale account, record collision, wrong role, or cleanup interference.
- Environment: unavailable service, configuration, dependency, or browser mismatch.

Test a concrete hypothesis with a targeted observation. For a timeout, inspect which condition was absent before changing duration. For a locator, verify the intended target and its uniqueness. For a shared-state failure, inspect account or record ownership and test order before forcing serial execution. Done when the failing transition is named and classified, or the remaining hypothesis is explicit.

## Repair within scope

Make the smallest evidence-backed correction. Missing real dependencies stay blocked. Keep the source case's expected result. Replace a brittle selector with a verified semantic locator or test ID. Do not silently fall back to a different target. Synchronize on visible or network state. Create independent records or accounts where writes collide. Any configuration change must address an observed requirement and explain its effect.

Retain an assertion that exposes an application bug and report the reproduction. Repair application code only when requested. Do not hide a failure with catch-and-continue, an optional assertion, a skip, a forced action, a broad timeout increase, or more retries. A quarantine needs an explicit project policy or user direction, a tracked reason, and visible reporting. It is not a repair. Done when the correction is the smallest change that addresses the classified cause, or the case is reported blocked.

## Verify and report

Run the affected test after the correction, and nearby tests affected by a shared helper or config change. For an intermittent failure, choose a bounded repeat or concurrency check from the suspected trigger and state its limit. Do not claim permanent stability. Stop when the same external prerequisite remains unavailable.

Report the root cause or the remaining hypothesis, the evidence, changed files, exact commands, passed, failed, flaky, skipped, or blocked results, and useful artifact paths. Keep secrets out of shared logs.

When a repair changes case names, selection commands, prerequisites, or artifact handling, update the existing feature E2E docs, or `qa/e2e/<feature>.md`, with accurate per-case and module commands and the observed verification result. Do not rewrite an unaffected runbook or claim that an unexecuted command passed.
