import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

type Booking = { id: string; driverName: string; vehicleName: string; amount: string; currency: string };

// Records created by a test are registered here and deleted in teardown, which
// also runs when an assertion fails mid-journey (not when the worker crashes).
// Every record is attempted, newest first, and all failures are reported together.
const test = base.extend<{ ownedBookings: string[] }>({
  ownedBookings: async ({ request }, use) => {
    const owned: string[] = [];
    await use(owned);
    const failures: string[] = [];
    for (const id of [...owned].reverse()) {
      try {
        const cleanup = await request.delete(`/api/bookings/${encodeURIComponent(id)}`);
        if (cleanup.status() !== 204) failures.push(`${id}: HTTP ${cleanup.status()}`);
      } catch (error) {
        failures.push(`${id}: ${String(error)}`);
      }
    }
    expect(failures, "cleanup failures").toEqual([]);
  },
});

async function listBookings(request: APIRequestContext): Promise<Booking[]> {
  const response = await request.get("/api/bookings");
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { bookings: Booking[] }).bookings;
}

// Bookings that did not exist when the test started. Negative checks look only at
// these, so existing history in a shared environment cannot fail the test.
async function bookingsCreatedSince(request: APIRequestContext, startIds: Set<string>) {
  return (await listBookings(request)).filter((booking) => !startIds.has(booking.id));
}

// Passive observation: counts booking submissions the page sends.
function watchBookingPosts(page: Page) {
  const posts: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && new URL(req.url()).pathname === "/api/bookings") posts.push(req.url());
  });
  return posts;
}

test("BK-01 confirms a booking for Ana in a Sedan at 42.00 USD", async ({ page, request, ownedBookings }) => {
  const confirm = page.getByRole("button", { name: "Confirm booking" });

  await test.step("Open Booking", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Booking" })).toBeVisible();
    await expect(page.getByLabel("Driver")).toBeVisible();
    await expect(page.getByLabel("Vehicle")).toBeVisible();
    await expect(confirm).toBeDisabled();
  });

  await test.step("Select driver Ana", async () => {
    await page.getByLabel("Driver").selectOption({ label: "Ana" });
    await expect(page.getByLabel("Vehicle")).toBeEnabled();
  });

  await test.step("Select vehicle Sedan", async () => {
    await page.getByLabel("Vehicle").selectOption({ label: "Sedan" });
    await expect(page.getByText("Rate 42.00 USD")).toBeVisible();
    await expect(confirm).toBeEnabled();
  });

  await test.step("Confirm booking", async () => {
    const created = page.waitForResponse(
      (res) => res.request().method() === "POST" && new URL(res.url()).pathname === "/api/bookings",
    );
    await confirm.click();
    const response = await created;
    // Register ownership before asserting, so a later failure still cleans up.
    if (response.ok()) ownedBookings.push(((await response.json()) as { booking: Booking }).booking.id);
    expect(response.status()).toBe(201);

    const id = ownedBookings[0];
    expect(id).toMatch(/^BK-\d{4}$/);
    const result = page.getByRole("status", { name: "Booking result" });
    await expect(result).toContainText(id);
    await expect(result).toContainText("Ana");
    await expect(result).toContainText("Sedan");
    await expect(result).toContainText("42.00 USD");

    const stored = (await listBookings(request)).find((booking) => booking.id === id);
    expect(stored).toMatchObject({ driverName: "Ana", vehicleName: "Sedan", amount: "42.00", currency: "USD" });
  });
});

test("BK-02 keeps unavailable driver Ben from being selected", async ({ page, request }) => {
  const startIds = new Set((await listBookings(request)).map((booking) => booking.id));
  const posts = watchBookingPosts(page);
  await page.goto("/");
  await expect(page.getByRole("option", { name: "Ben (unavailable)" })).toBeDisabled();
  await expect(page.getByLabel("Driver")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Confirm booking" })).toBeDisabled();

  expect(posts).toHaveLength(0);
  const created = await bookingsCreatedSince(request, startIds);
  expect(created.filter((booking) => booking.driverName === "Ben")).toEqual([]);
});

test("BK-03 blocks confirmation when Van has no rate", async ({ page, request }) => {
  const startIds = new Set((await listBookings(request)).map((booking) => booking.id));
  const posts = watchBookingPosts(page);
  await page.goto("/");
  await page.getByLabel("Driver").selectOption({ label: "Ana" });
  await page.getByLabel("Vehicle").selectOption({ label: "Van" });
  await expect(page.getByText("No rate configured")).toBeVisible();

  // Attempt to confirm: the only submit control stays disabled, and the page sends no booking.
  await expect(page.getByRole("button", { name: "Confirm booking" })).toBeDisabled();
  expect(posts).toHaveLength(0);
  const created = await bookingsCreatedSince(request, startIds);
  expect(created.filter((booking) => booking.vehicleName === "Van")).toEqual([]);
});
