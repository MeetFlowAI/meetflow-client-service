import { createContext } from "react";
import type { ThemeContextValue } from "./types";

// ── Context ──────────────────────────────────────────────────────────────────
export const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = "ThemeContext";

ThemeContext.displayName = "ThemeContext";
