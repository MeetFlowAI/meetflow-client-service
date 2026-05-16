/* ── Theme Type Contracts ───────────────────────────────────────────────── */

export type Theme = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** The stored user preference (may be "system") */
  theme: Theme;
  /** The actual applied theme after system resolution */
  resolvedTheme: ResolvedTheme;
  /** Update the user's theme preference */
  setTheme: (theme: Theme) => void;
  /** True while the initial theme is being hydrated from localStorage */
  isHydrating: boolean;
}
