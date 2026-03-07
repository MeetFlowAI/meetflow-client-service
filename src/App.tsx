/* Imports */
import React, { type JSX } from "react";
import { BrowserRouter as Router } from "react-router-dom";

/* Relative Imports */
import { QueryClientProvider } from "@tanstack/react-query";

/* Local Imports */
import { ThemeContextProvider } from "@/context/ThemeContext";
import ThemeModeSetting from "@/components/ThemeModeSetting";
import { queryClient } from "@/config/queryClientConfig";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

// ----------------------------------------------------------------------

/**
 * App component to to set all the higher level components and routes.
 *
 * @component
 * @returns {JSX.Element}
 */
const App: React.FC = (): JSX.Element => {
  return (
    <TooltipProvider>
      <ThemeContextProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ThemeModeSetting />
        <QueryClientProvider client={queryClient}>
          <Router>{/* Routes */}</Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeContextProvider>
    </TooltipProvider>
  );
};

export default App;
