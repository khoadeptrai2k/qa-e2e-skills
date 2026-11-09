# Screen sweep

How to find and record every sub-route and interactive control of one screen. The E2E contract still governs execution and oracles.

## Screen boundary

The screen is its entry route plus everything reachable without leaving it:

- Child routes under the same path prefix, and URL changes from tabs, steps, query parameters, or hash fragments that keep the same screen shell.
- Dialogs, drawers, popovers, menus, and inline editors opened from the screen, including ones with their own URL.
- Row actions, bulk actions, pagination, sort, filter, and search inside the screen's lists or tables.

## Links to other screens

The boundary limits the inventory, not the tests.

- A control that leads to another screen is an `EL-N` row with kind `link-out` and its target route. Do not inventory the target screen's controls.
- Its own check is one hop: click it (only if its risk is `safe`), confirm the target screen loads, then come back. That landing is recorded as `reachability` unless a case gives the expected result.
- While on the target screen, take a preview without clicking anything there: read the accessibility tree of the landing state only (no menus opened, no scrolling beyond the first view) and note its heading and its primary visible actions, such as "Create driver", "Edit", "Deactivate", tabs, and further links out. Give each a risk class by its label. These are preview notes, not inventory rows: they get no `EL-N`, no coverage value, and no test. If the target cannot be reached safely, note "preview not taken" and why.
- When a supplied case's journey continues into another screen (for example Booking → "View driver" → a field on the Driver screen), implement the whole journey as the case states. Follow only the steps the case names on the other screen; do not sweep it.
- List every linked screen under "Linked screens" in the inventory document, with the `EL-N` that leads there and the cases that cross into it, so the user can choose to sweep it next.

## Find items from source

Read the router definition for the entry route and its children, the screen's components, and the components they render. Look for: route definitions, `navigate` / `router.push` / `<Link>` targets, buttons and their handlers, menu and tab definitions, dialogs and their triggers, permission checks and feature flags that hide controls, and conditional rendering that shows controls only in some states. Cite file and line for each item.

## Find items in the live UI

For each state you reach, read the accessibility tree (or the host's equivalent) rather than guessing from screenshots. List every element with an interactive role: `button`, `link`, `tab`, `menuitem`, `checkbox`, `radio`, `switch`, `combobox`, `textbox`, `option`, plus clickable elements that lack a role (record those as an accessibility finding). Then:

- Open each menu, dropdown, tab, accordion, and "more" control, and list what it reveals.
- Scroll long pages and lists; check the next page when pagination exists.
- Repeat for each role you are authorized to use, and for empty, populated, and error states you can produce with test-owned data.
- Compare with the source list. An item seen in source but not in the UI needs a reason: hidden by role, flag, or state, or unreachable.

## Click safety

Classify every control before clicking:

| Risk | Examples | Rule |
| --- | --- | --- |
| `safe` | open tab, open dialog, cancel, sort, filter, paginate, navigate within the screen | Click to observe |
| `mutating-owned` | create, edit, or delete a record this run created | Click only with test-owned data in the test environment |
| `destructive` | delete or void shared data, bulk actions, reset, sign out | Do not click without the user's explicit permission for that control |
| `external` | payment, email or SMS, third-party link, download, production URL | Do not click; record the target |

Never click anything in production. When unsure, treat a control as `destructive`.

## Inventory document

Save `qa/screens/<screen>.md` (or the repo's existing location). Keep IDs stable across rounds; add new IDs, never renumber.

```markdown
# <Screen> screen sweep

Entry route: /bookings · Roles: dispatcher, manager · Environment: <env var name or URL> · Case files: cases/booking.md

## Sub-routes

| ID | Route / state | How reached | Source | Visited | Covered by | Coverage |
| --- | --- | --- | --- | --- | --- | --- |
| RT-1 | /bookings | entry | src/routes.ts:12 | yes | BK-01 | automated |
| RT-2 | /bookings/:id (detail drawer) | row click | src/routes.ts:14 | yes | — | uncovered |

## Controls

| ID | Where (RT) | Role + accessible name | Kind | Observed effect | Risk | Covered by | Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EL-1 | RT-1 | button "Confirm booking" | submit | creates booking | mutating-owned | BK-01 | automated |
| EL-2 | RT-1 | button "Export CSV" | download | file download | external | — | uncovered (not clicked) |

## Linked screens

| Screen / route | Reached by | Cases crossing into it | Preview (seen, not clicked) | Swept |
| --- | --- | --- | --- | --- |
| Driver / /drivers/:id | EL-7 link "View driver" | BK-05 | heading "Driver Ana"; buttons "Create driver" (mutating-owned), "Edit" (mutating-owned), "Deactivate" (destructive); tabs "Profile", "Vehicles"; link "Back to bookings" | no |

When a linked screen has already been swept, write its inventory file path in the Swept column instead of `no`.

## Not explored

- <item or area>: <reason — role unavailable, destructive, flag off, out of boundary>

## Rounds

| Round | Date | Tests added | Results | User decision | Files added |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-11-09 | BK-01..BK-03 | 3 passed | Add files | cases/booking-detail.md |
```

Coverage uses the contract's words, plus `uncovered` for an item no case or test addresses yet. A reachability test is recorded as `reachability`, separate from business coverage.

## Reachability round (checkpoint option 3)

Only when the user chose it. For each uncovered `safe` item: navigate or click, then assert that the expected target is reached (the sub-route's heading or the dialog's role and name) and that no error state is shown. Put them in their own `describe` block or file named for reachability, title each with its `RT-N` / `EL-N`, and do not count them toward case coverage. Do not click `mutating-owned`, `destructive`, or `external` items in this round.
