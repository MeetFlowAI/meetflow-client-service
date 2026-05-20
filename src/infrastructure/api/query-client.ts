import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api/pagination.types";

/**
 * Determines whether a failed query should be retried.
 * Client errors (4xx) are not retried — only network errors
 * and server errors (5xx) get up to 2 retries.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    // Never retry auth errors or client mistakes
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return false;
    }
    // Retry server errors up to 2 times
    if (error.isServerError) {
      return failureCount < 2;
    }
    // Don't retry other client errors (400, 409, 422, etc.)
    return false;
  }
  // Network errors (no status) — retry up to 2 times
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for 60 seconds.
       * Override per-query for data that changes more/less frequently:
       *   staleTime: 0        — always refetch (live data)
       *   staleTime: 5 * 60_000 — cache for 5 minutes (stable reference data)
       */
      staleTime: 60_000,

      /**
       * Unused cache is retained for 5 minutes before garbage collection.
       * This keeps navigating back to a page instant.
       */
      gcTime: 5 * 60_000,

      retry: shouldRetry,

      /**
       * Refetch when the user returns to the tab.
       * Keeps dashboard data current after the user has been away.
       */
      refetchOnWindowFocus: true,

      /**
       * Refetch when the network reconnects.
       * Critical for meeting/channel features that rely on real-time data.
       */
      refetchOnReconnect: true,
    },

    mutations: {
      /**
       * Never retry mutations — a failed mutation may have partially
       * succeeded on the server. The user should decide to retry.
       */
      retry: false,
    },
  },
});
