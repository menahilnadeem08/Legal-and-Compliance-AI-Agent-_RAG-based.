"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export function ThemeToggleButton({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatches for the icon/state.
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400",
        "transition-colors",
        className,
      ].join(" ")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

