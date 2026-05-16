import { use } from "react";
import { ThemeContext } from "./ThemeContext";
import type { ThemeContextValue } from "./types";

/**
 * Returns the current theme context.
 *
 * MUST be used inside <ThemeProvider>.
 *
 * @example
 * const { theme, resolvedTheme, setTheme } = useTheme();
 *
 * // Toggle between light and dark
 * setTheme(resolvedTheme === "dark" ? "light" : "dark");
 *
 * // Respect system preference
 * setTheme("system");
 */
export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error(
      "[useTheme] Must be used inside <ThemeProvider>. " +
        "Wrap your app in <ThemeProvider> via app/providers.tsx."
    );
  }

  return context;
}
