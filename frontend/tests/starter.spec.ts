import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    "demo@example.com",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A little room to get things done." }),
  ).toBeVisible();
}

test("full pages contain SSR HTML and assets come from Phoenix", async ({
  request,
}) => {
  const csrf = await request.get("/auth/csrf");
  await request.post("/auth/login", {
    headers: { "x-csrf-token": (await csrf.json()).token },
    data: { email: "demo@example.com", password: "starter-password" },
  });
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("A little room to get things done.");
  const asset = html.match(/(?:href|src)="(\/assets\/[^" ]+)"/);
  expect(asset).not.toBeNull();
  const file = await request.get(asset![1]);
  expect(file.status()).toBe(200);
  expect(file.headers()["cache-control"]).toContain("immutable");
  expect((await request.get("/__frontend/ready")).status()).toBe(404);
});

test("CRUD and navigation call Ash directly, and filter survives reload", async ({
  page,
}) => {
  const calls: string[] = [],
    errors: string[] = [];
  page.on("request", (request) => calls.push(new URL(request.url()).pathname));
  page.on("pageerror", (error) => errors.push(error.message));
  const title = `Browser task ${Date.now()}`;
  await signIn(page);
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Notes").fill("Created through Ash RPC.");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(title + " edited");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(row).toContainText(title + " edited");
  await row.getByRole("button", { name: "Mark done" }).click();
  await expect(row).toContainText("Completed");
  await page.getByRole("tab", { name: "Done", exact: true }).click();
  await expect(page).toHaveURL(/status=done/);
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Done", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(row).toHaveCount(0);
  expect(calls).toContain("/rpc/run");
  expect(
    calls.some(
      (path) => path.startsWith("/_serverFn") || path.startsWith("/_server"),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("mobile layout and keyboard dialog work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "New task", exact: true }),
  ).toBeFocused();
});

test("login errors, reload, logout and expired access", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Email or password is incorrect.",
  );
  await page.getByLabel("Password", { exact: true }).fill("starter-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "New task", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "New task", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
