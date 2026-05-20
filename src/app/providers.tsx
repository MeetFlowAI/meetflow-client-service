import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider } from "@/design-system/themes";
import { queryClient } from "@/infrastructure/api/query-client";
import { sessionService } from "@/infrastructure/auth/session.service";
import { useSessionStore } from "@/store/session.store";

// ── Session initializer ───────────────────────────────────────────────────────
// Isolated component so the effect only runs once and doesn't re-render
// the full provider tree.

function SessionInitializer({ children }: { children: React.ReactNode }) {
  const isHydrated = useSessionStore((s) => s.isHydrated);

  useEffect(() => {
    // Run once on mount — populates session store and sets isHydrated = true
    void sessionService.initialize();
  }, []); // Empty deps — intentionally runs exactly once

  // Block rendering until session is known.
  // A bare bg-background div matches the page background in both themes —
  // no flash, no spinner. LoadingState component (Phase 7) replaces this.
  if (!isHydrated) {
    return (
      <div
        className="min-h-screen bg-background"
        aria-hidden="true"
        data-testid="session-loading"
      />
    );
  }

  return <>{children}</>;
}

// ── Provider composition ──────────────────────────────────────────────────────
// ORDER MATTERS:
//   1. ThemeProvider  — outermost so dark class is available to all children
//   2. QueryClient    — must wrap everything that uses useQuery/useMutation
//   3. Session init   — must run inside QueryClient (could use queryClient in future)
//
// Phase 3 adds: RouterProvider wrapping SessionInitializer

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <SessionInitializer>{children}</SessionInitializer>

        {/* React Query DevTools — dev only, tree-shaken in production */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
