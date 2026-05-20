// ── MeetFlow V2 — Application Root ─────────────────────────────────────────
//
// Phase 2: AppProviders added (ThemeProvider + QueryClient + SessionInit).
// Phase 3: RouterProvider added inside AppProviders.
// Phase 9+: Router renders feature module pages.

import { AppProviders } from "./providers";

export function App() {
  return (
    <AppProviders>
      {/*
        Phase 3 adds <RouterProvider router={router} /> here.
        Until then, a placeholder confirms providers are working.
      */}
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-xl font-semibold text-foreground">MeetFlow V2</h1>
          <p className="font-body text-sm text-muted-foreground">
            Phase 2 — Infrastructure Layer complete. Router arrives in Phase 3.
          </p>
        </div>
      </div>
    </AppProviders>
  );
}
