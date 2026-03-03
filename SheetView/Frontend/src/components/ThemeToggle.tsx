import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative flex h-8 w-14 items-center rounded-full border border-border bg-secondary p-0.5 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <div
        className={`
          flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft
          transition-transform duration-300 ease-out
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </div>
    </button>
  );
}
