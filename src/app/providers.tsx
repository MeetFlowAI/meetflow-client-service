import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider } from "@/design-system/themes";
import { queryClient } from "@/infrastructure/api/query-client";
import { sessionService } from "@/infrastructure/auth/session.service";
import { useSessionStore } from "@/store/session.store";

// ── Session initializer ───────────────────────────────────────────────────────
// Runs sessionService.initialize() exactly once on app boot.
// Blocks ALL rendering (including the RouterProvider) until isHydrated = true.
//
// WHY block before the router?
//   Route guards (AuthGuard, GuestGuard, RoleGuard) read isAuthenticated
//   and role from the session store. If the router renders before hydration
//   completes, every guard would see isAuthenticated = false and redirect
//   authenticated users to sign-in on every page load.
//
// RESULT:
//   Guards never need to check isHydrated — by definition, isHydrated is
//   always true when any guard runs.

function SessionInitializer({ children }: { children: React.ReactNode }) {
  const isHydrated = useSessionStore((s) => s.isHydrated);

  useEffect(() => {
    void sessionService.initialize();
  }, []); // Empty deps — runs exactly once on mount

  // Show a bare background-colored div while session hydrates.
  // No spinner, no skeleton — prevents any flash of incorrect content.
  // Phase 7 can optionally replace this with a branded splash screen.
  if (!isHydrated) {
    return (
      <div
        className="min-h-screen bg-background"
        aria-hidden="true"
        data-testid="session-hydrating"
      />
    );
  }

  return <>{children}</>;
}

// ── Provider composition ──────────────────────────────────────────────────────
// ORDER IS CRITICAL — do not reorder without understanding the implications:
//
//   1. ThemeProvider    Applies .dark class to <html> before anything renders.
//                       Must be outermost to prevent flash-of-wrong-theme.
//
//   2. QueryClient      Provides TanStack Query context to all children,
//                       including session service's HTTP calls.
//
//   3. SessionInit      Blocks until auth state is resolved. Wraps router
//                       so guards always see a hydrated session store.
//
//   [children]          RouterProvider in App.tsx — renders the route tree.

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <SessionInitializer>{children}</SessionInitializer>

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
