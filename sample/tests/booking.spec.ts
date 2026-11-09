import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

async function bookingIds(request: APIRequestContext) {
  const response = await request.get("/api/bookings");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { bookings: { id: string }[] };
  return body.bookings.map((booking) => booking.id);
}

async function selectAnaAnd(page: Page, vehicle: "Sedan" | "Van") {
  await page.goto("/");
  await page.getByLabel("Driver").selectOption({ label: "Ana" });
  await page.getByLabel("Vehicle").selectOption({ label: vehicle });
}

test("BK-01 confirms a booking for Ana in a Sedan at 42.00 USD", async ({ page, request }) => {
  const before = await bookingIds(request);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Booking" })).toBeVisible();
  await expect(page.getByLabel("Driver")).toBeVisible();
  await expect(page.getByLabel("Vehicle")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm booking" })).toBeDisabled();

  await page.getByLabel("Driver").selectOption({ label: "Ana" });
  await expect(page.getByLabel("Vehicle")).toBeEnabled();

  await page.getByLabel("Vehicle").selectOption({ label: "Sedan" });
  await expect(page.getByText("Rate 42.00 USD")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm booking" })).toBeEnabled();

  await page.getByRole("button", { name: "Confirm booking" }).click();
  const result = page.getByRole("status", { name: "Booking result" });
  await expect(result).toContainText("Ana");
  await expect(result).toContainText("Sedan");
  await expect(result).toContainText("42.00 USD");
  await expect(result).toContainText(/BK-\d+/);

  const created = (await bookingIds(request)).filter((id) => !before.includes(id));
  expect(created).toHaveLength(1);
  const cleanup = await request.delete(`/api/bookings/${created[0]}`);
  expect(cleanup.status()).toBe(204);
});

test("BK-02 keeps unavailable driver Ben from being selected", async ({ page, request }) => {
  const before = await bookingIds(request);
  await page.goto("/");
  const ben = page.getByRole("option", { name: "Ben (unavailable)" });
  await expect(ben).toBeDisabled();
  await expect(page.getByLabel("Driver")).toHaveValue("");
  expect(await bookingIds(request)).toEqual(before);
});

test("BK-03 blocks confirmation when Van has no rate", async ({ page, request }) => {
  const before = await bookingIds(request);
  await selectAnaAnd(page, "Van");
  await expect(page.getByText("No rate configured")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm booking" })).toBeDisabled();
  expect(await bookingIds(request)).toEqual(before);
});
