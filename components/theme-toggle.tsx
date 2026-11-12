"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeToggle({
  label,
  lightLabel = "Light",
  darkLabel = "Dark"
}: {
  label: string;
  lightLabel?: string;
  darkLabel?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? lightLabel : darkLabel;

  return (
    <button
      type="button"
      className="icon-button"
      aria-label={`${label}: ${nextTheme}`}
      title={`${label}: ${nextTheme}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
