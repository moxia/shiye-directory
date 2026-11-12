import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/admin/login-form";

vi.mock("@/app/[locale]/admin/actions", () => ({
  loginAction: async () => ({ ok: false, message: "loginError" })
}));

describe("admin login form", () => {
  it("validates fields and reports an invalid administrator login", async () => {
    const user = userEvent.setup();
    render(<LoginForm locale="zh" />);
    await user.type(screen.getByLabelText("邮箱"), "admin@example.com");
    await user.type(screen.getByLabelText("密码"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("邮箱或密码不正确");
  });
});
