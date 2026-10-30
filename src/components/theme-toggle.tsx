"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/client/theme";

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="grid h-9 w-9 shrink-0 place-items-center sm:h-10 sm:w-10 rounded-full text-ink-2 transition hover:bg-hover hover:text-ink"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
