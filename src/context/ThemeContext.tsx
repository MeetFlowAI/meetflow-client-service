/* Imports */
import { createContext, useEffect, useState } from "react";

// ----------------------------------------------------------------------

/* Types */
export type Theme = "dark" | "light" | "system";

/* Interfaces */
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface ThemeContextProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// ----------------------------------------------------------------------

/* Context */
const initialState: ThemeContextType = {
  theme: "system",
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(initialState);

// ----------------------------------------------------------------------

/* Provider */
const ThemeContextProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeContextProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ----------------------------------------------------------------------

export { ThemeContext, ThemeContextProvider };
