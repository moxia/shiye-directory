import { expect, test } from "@playwright/test";

test("Chinese homepage searches, filters, clears, and switches locale", async ({ page }) => {
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("把互联网");
  await expect(page.getByText("找到 24 个站点")).toBeVisible();

  const search = page.getByPlaceholder("搜索站点、用途或域名…");
  await search.fill("Figma");
  await expect(page.getByText("找到 1 个站点")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("");

  await page.getByRole("button", { name: /设计与灵感/ }).first().click();
  await expect(page).toHaveURL(/category=design/);
  await page.getByRole("link", { name: "en", exact: true }).click();
  await expect(page).toHaveURL(/\/en\?category=design/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The web");
});

test("keyboard shortcut focuses search and theme toggles", async ({ page }) => {
  await page.goto("/zh");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("/");
  await expect(page.getByPlaceholder("搜索站点、用途或域名…")).toBeFocused();
  const toggle = page.getByRole("button", { name: /主题/ });
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await toggle.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("unauthenticated admin routes redirect to login", async ({ page }) => {
  await page.goto("/zh/admin/sites");
  await expect(page).toHaveURL(/\/zh\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "管理员登录" })).toBeVisible();
  await expect(page.getByLabel("邮箱")).toBeVisible();
});
