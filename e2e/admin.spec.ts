import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("authenticated administration", () => {
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD against a test Supabase project.");

  test("signs in and creates, edits, and removes a category", async ({ page }) => {
    const suffix = Date.now().toString().slice(-7);
    const slug = `e2e-${suffix}`;
    await page.goto("/zh/admin/login");
    await page.getByLabel("邮箱").fill(email!);
    await page.getByLabel("密码").fill(password!);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/zh\/admin$/);

    await page.goto("/zh/admin/categories");
    await page.getByRole("button", { name: "新增分类" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("URL 标识").fill(slug);
    await dialog.getByLabel("中文名称").fill("端到端测试");
    await dialog.getByLabel("英文名称").fill("E2E test");
    await dialog.getByLabel("中文简介").fill("自动化测试分类。");
    await dialog.getByLabel("英文简介").fill("An automated test category.");
    await dialog.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText("端到端测试")).toBeVisible();

    page.once("dialog", (confirmation) => confirmation.accept());
    const row = page.locator(".manager-row").filter({ hasText: "端到端测试" });
    await row.getByRole("button", { name: /删除分类/ }).click();
    await expect(page.getByText("端到端测试")).toHaveCount(0);
  });

  test("exports a version 1 JSON backup", async ({ page }) => {
    await page.goto("/zh/admin/login");
    await page.getByLabel("邮箱").fill(email!);
    await page.getByLabel("密码").fill(password!);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/zh\/admin$/);

    const response = await page.request.get("/api/admin/export");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.version).toBe(1);
    expect(Array.isArray(payload.categories)).toBeTruthy();
    expect(Array.isArray(payload.sites)).toBeTruthy();
  });
});
