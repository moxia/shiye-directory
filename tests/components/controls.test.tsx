import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocaleSwitch } from "@/components/locale-switch";
import { SiteIcon } from "@/components/site-icon";
import { ThemeToggle } from "@/components/theme-toggle";

const setTheme = vi.hoisted(() => vi.fn());
const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  params: new URLSearchParams("q=design")
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigationMocks.replace, push: navigationMocks.push }),
  usePathname: () => "/zh",
  useSearchParams: () => navigationMocks.params
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme })
}));

describe("small interface controls", () => {
  it("switches locale while preserving query parameters", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitch locale="zh" label="Language" />);
    await user.click(screen.getByText("en"));
    expect(navigationMocks.push).toHaveBeenCalledWith("/en?q=design", { scroll: false });
  });

  it("changes the persisted theme from light to dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle label="Theme" />);
    await user.click(screen.getByRole("button", { name: /Theme/ }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("falls back from a broken favicon to a neutral letter mark", () => {
    const { container } = render(<SiteIcon name="Example Site" url="https://example.com" iconUrl={null} />);
    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    fireEvent.error(image!);
    expect(screen.getByText("ES")).toBeInTheDocument();
  });
});
