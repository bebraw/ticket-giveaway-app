import { expect, test } from "@playwright/test";

test("renders the worker home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Future Frontend Ticket Raffle" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Take control" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await expect(page.getByLabel("Audience join QR code").locator("svg")).toBeVisible();
  await expect(page.locator('a[href="/api/health"]').first()).toHaveText("/api/health");
});

test("serves the health endpoint", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    name: "vibe-template-worker",
    routes: [
      "/",
      "/api/health",
      "/api/raffle/state",
      "/api/raffle/join",
      "/api/raffle/claim-host",
      "/api/raffle/draw",
      "/api/raffle/reset",
      "/api/raffle/ws",
    ],
  });
});

test("runs a host-controlled raffle flow", async ({ page }) => {
  await page.goto(`/?room=e2e-${Date.now()}`);

  await page.getByRole("button", { name: "Take control" }).click();
  await expect(page.getByText("Host control is active. Registration is open.")).toBeVisible();
  await expect(page.getByText("Room open for phones")).toBeVisible();

  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByText("You are in the draw.")).toBeVisible();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();

  await page.getByRole("button", { name: "Draw ticket" }).click();
  await expect(page.getByText("Ticket goes to")).toBeVisible();
});

test("serves the generated stylesheet", async ({ request }) => {
  const response = await request.get("/styles.css");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/css");
  await expect(response.text()).resolves.toContain("--color-app-canvas:#f7f5ff");
});
