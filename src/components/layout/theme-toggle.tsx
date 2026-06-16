"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils/cn";

/**
 * Light/dark switch for the header. `light` matches the other header controls'
 * over-hero treatment (uses panel-fg so it stays bright in both themes). Until
 * mounted we render a stable Moon icon to avoid a hydration mismatch, then swap
 * to reflect the active theme.
 */
export function ThemeToggle({ light = false }: { light?: boolean }) {
  const { resolved, toggle, mounted } = useTheme();
  const isDark = mounted && resolved === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-sm transition-colors",
        light
          ? "text-panel-fg hover:text-brass-300"
          : "text-forest-500 hover:text-brass-500",
      )}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
