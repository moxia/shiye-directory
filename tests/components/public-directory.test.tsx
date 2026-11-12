import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEMO_CATALOG } from "@/lib/demo-data";
import { PublicDirectory } from "@/components/public-directory";

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  pathname: "/zh",
  params: new URLSearchParams()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigationMocks.replace, push: navigationMocks.push }),
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => navigationMocks.params
}));

describe("PublicDirectory", () => {
  it("filters bilingual site data instantly and clears on Escape", async () => {
    const user = userEvent.setup();
    render(<PublicDirectory catalog={DEMO_CATALOG} locale="zh" />);
    const search = screen.getByPlaceholderText("搜索站点、用途或域名…");

    await user.type(search, "Figma");
    expect(screen.getByText("找到 1 个站点")).toBeInTheDocument();
    expect(screen.getAllByText("Figma").length).toBeGreaterThan(0);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(search).toHaveValue("");
    expect(screen.getByText("找到 24 个站点")).toBeInTheDocument();
  });

  it("filters by category and offers an empty state", async () => {
    const user = userEvent.setup();
    render(<PublicDirectory catalog={DEMO_CATALOG} locale="zh" />);
    const categoryButtons = screen.getAllByRole("button", { name: /设计与灵感/ });
    await user.click(categoryButtons[0]);
    expect(screen.getByText("找到 4 个站点")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("搜索站点、用途或域名…"), "不存在的站点");
    expect(screen.getByText("没有找到匹配站点")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "清除筛选" })[0]);
    expect(screen.getByText("找到 24 个站点")).toBeInTheDocument();
  });
});
