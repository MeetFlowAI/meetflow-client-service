// ── MeetFlow V2 — Application Root ─────────────────────────────────────────
//
// Phase 1: ThemeProvider added. Token smoke test renders in dev only.
// Phase 2: Wrapped in full <AppProviders> (QueryClient, Router, etc.)
// Phase 3+: Router outlet renders feature module pages.

import { ThemeProvider } from "@/design-system/themes";

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background" />
    </ThemeProvider>
  );
}
