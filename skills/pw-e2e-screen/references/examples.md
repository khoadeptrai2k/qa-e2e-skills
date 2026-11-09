# Examples

Patterns only. Match the repository's language, folder layout, fixtures, and naming before copying anything. Routes, labels, and names below are placeholders.

## Fixture-owned data with best-effort cleanup

Check first whether the repo already has a cleanup fixture or data factory, and extend it instead.

```ts
import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ ownedOrders: string[] }>({
  ownedOrders: async ({ request }, use) => {
    const owned: string[] = [];
    await use(owned);
    // Runs after a failed test body too, but not if the worker process crashes.
    // Attempt every record, newest first (dependents before what they depend on),
    // and report all failures together instead of stopping at the first one.
    const failures: string[] = [];
    for (const id of [...owned].reverse()) {
      try {
        const res = await request.delete(`/api/orders/${encodeURIComponent(id)}`);
        if (!res.ok()) failures.push(`${id}: HTTP ${res.status()}`);
      } catch (error) {
        failures.push(`${id}: ${String(error)}`);
      }
    }
    expect(failures, "cleanup failures").toEqual([]);
  },
});
```

When a test creates records of several types (a driver, then a vehicle, then a booking), register them in one ordered list of `{ type, id }` so reverse order deletes the booking before the vehicle and the driver.

In the test, register the ID as soon as it is known, before asserting on it:

```ts
const created = page.waitForResponse(
  (res) => res.request().method() === "POST" && new URL(res.url()).pathname === "/api/orders",
);
await page.getByRole("button", { name: "Place order" }).click();
const response = await created; // passive observation, not a mock
if (response.ok()) ownedOrders.push((await response.json()).order.id);
expect(response.status()).toBe(201);
```

## Real login once per role

```ts
// auth.setup.ts
import { test as setup, expect } from "@playwright/test";

setup("login as dispatcher", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_DISPATCHER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_DISPATCHER_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.context().storageState({ path: ".auth/dispatcher.json" });
});
```

```ts
// playwright.config.ts (excerpt)
projects: [
  { name: "setup", testMatch: /.*\.setup\.ts/ },
  { name: "chromium", use: { ...devices["Desktop Chrome"], storageState: ".auth/dispatcher.json" }, dependencies: ["setup"] },
],
```

Add `.auth/` to `.gitignore`. Login cases do not use the saved state.

## Negative outcome that can actually fail

```ts
// Weak: passes even if the UI never tried anything.
const before = await listOrders(request);
await page.goto("/orders/new");
expect(await listOrders(request)).toEqual(before);

// Better: watch what the page sends, and query the specific record.
const posts: string[] = [];
page.on("request", (req) => {
  if (req.method() === "POST" && new URL(req.url()).pathname === "/api/orders") posts.push(req.url());
});
// ... perform the blocked action through the UI ...
await expect(page.getByRole("button", { name: "Place order" })).toBeDisabled();
expect(posts).toHaveLength(0);
expect((await listOrders(request)).filter((o) => o.customer === uniqueName)).toEqual([]);
```

## Known application defect

Default: leave the test failing and report it as `failed` with the defect. Use `test.fail()` only when project policy or the user allows expected failures.

```ts
test("ORD-07 rejects a quantity above stock", {
  annotation: { type: "issue", description: "https://tracker.example/BUG-123" },
}, async ({ page }) => {
  test.fail();
  // ... unchanged journey and the original expected result ...
});
```

Playwright counts a `test.fail()` test as passing when it fails for any reason, including an unrelated error. So after every run:

- Read the failure message in the report or `--reporter=json` output and confirm it is the assertion named in the defect. Otherwise report the test as `failed`.
- Report it as `expected-fail` with the defect link, never in the passed count.
- When the defect is fixed, the test starts "failing" because it passed. Remove `test.fail()` and the annotation in the same change.

## Selecting one case from the command line

```bash
npx playwright test --project=chromium --grep "ORD-07"
npx playwright test --project=chromium --grep "ORD-07" --list   # selection check only, not a pass
```
