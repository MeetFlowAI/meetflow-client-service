import { useCallback, useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY } from "@/config/constants";
import type { ResolvedTheme, Theme, ThemeContextValue } from "./types";
import { ThemeContext } from "./ThemeContext";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference: Theme): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable (e.g., SSR or incognito restriction)
  }
  return "system";
}

// ── Provider ─────────────────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Default theme when no preference is stored.
   * @default "system"
   */
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Synchronously read storage on mount to avoid flash.
    // The FOUT prevention script in index.html already applied the class;
    // this synchronizes React state with what's already rendered.
    return readStoredTheme() ?? defaultTheme;
  });

  const [isHydrating, setIsHydrating] = useState(true);

  const resolvedTheme = resolveTheme(theme);

  // ── Apply theme class on state changes ─────────────────────────────────
  useEffect(() => {
    applyTheme(resolveTheme(theme));
    setIsHydrating(false);
  }, [theme]);

  // ── Listen for OS theme changes (only relevant when theme === "system") ─
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      applyTheme(getSystemTheme());
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  // ── Public setter (persists to localStorage) ────────────────────────────
  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Silently fail — theme will still work for the session
    }
    setThemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, isHydrating }),
    [theme, resolvedTheme, setTheme, isHydrating]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
