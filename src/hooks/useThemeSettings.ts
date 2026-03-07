/* Imports */
import { useContext } from "react";

/* Relative Imports */
import { ThemeContext } from "@/context/ThemeContext";

// ----------------------------------------------------------------------

/**
 * Hook to get/set the theme mode
 * @component
 * @yields {function}
 */
const useThemeSettings = () => {
  /* Hooks */
  const { theme: themeMode, setTheme } = useContext(ThemeContext);

  /**
   * function to change the theme mode
   *
   * @returns {void}
   */
  // const handleChangeTheme = useCallback(() => {
  //   switchMode(themeMode === "dark" ? "light" : "dark");
  // }, [switchMode, themeMode]);

  /* Output */
  return {
    themeMode,
    setTheme,
    // handleChangeTheme,
  };
};

export default useThemeSettings;
