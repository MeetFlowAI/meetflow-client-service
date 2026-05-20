// ── MeetFlow V2 — Application Root ─────────────────────────────────────────
//
// Phase 3: RouterProvider integrated. Full navigation now active.
//
// Provider hierarchy (outermost → innermost):
//   AppProviders (ThemeProvider → QueryClient → SessionInitializer)
//     RouterProvider (React Router v7 — full route tree)
//
// Session is always hydrated before the router renders.
// All route guards read directly from the session store without
// checking isHydrated — SessionInitializer guarantees it.

import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers";
import { router } from "@/routes/router";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
