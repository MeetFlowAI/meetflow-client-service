/* ============================================================
   MeetFlow V2 — Session Service

   Called ONCE on app boot from app/providers.tsx via
   the SessionInitializer component.

   Responsibility:
     1. Check if a valid access token exists
     2. Attempt token refresh if the access token is expired
     3. Fetch the current user profile (/auth/me)
     4. Populate the session store
     5. Set isHydrated = true (allows AuthGuard to render)

   Note on circular dependency avoidance:
     This service calls /auth/refresh using native fetch(), NOT
     the axios instance. This prevents a circular dependency:
       axios → tokenService → sessionService → axios (circular!)
     The /auth/me call uses the axios instance (safe: one-way).
   ============================================================ */

import { env } from "@/config/env";
import { tokenService } from "./token.service";
import { useSessionStore } from "@/store/session.store";
import { http } from "@/infrastructure/http/axios";
import type { User } from "@/types/entities/user.types";
import type { ApiResponse } from "@/types/api/pagination.types";

// ── Token refresh (uses native fetch to avoid circular dep) ───────────────────

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };

    tokenService.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Fetch current user ────────────────────────────────────────────────────────

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await http.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  } catch {
    return null;
  }
}

// ── Initialize session ────────────────────────────────────────────────────────

async function initialize(): Promise<void> {
  const { setSession } = useSessionStore.getState();

  // ── Case 1: No token at all ─────────────────────────────────────────────
  if (!tokenService.getAccessToken()) {
    setSession({ isHydrated: true, isAuthenticated: false });
    return;
  }

  // ── Case 2: Token expired — attempt silent refresh ──────────────────────
  if (!tokenService.isAccessTokenValid()) {
    const refreshed = await refreshTokens();

    if (!refreshed) {
      tokenService.clearTokens();
      setSession({ isHydrated: true, isAuthenticated: false });
      return;
    }
  }

  // ── Case 3: Valid token — fetch user profile ────────────────────────────
  const user = await fetchCurrentUser();

  if (!user) {
    // Token was valid but /auth/me failed — treat as unauthenticated
    tokenService.clearTokens();
    setSession({ isHydrated: true, isAuthenticated: false });
    return;
  }

  setSession({
    isHydrated: true,
    isAuthenticated: true,
    user,
    role: user.role,
  });
}

// ── Sign out ──────────────────────────────────────────────────────────────────

function signOut(): void {
  tokenService.clearTokens();
  useSessionStore.getState().clearSession();
  // Navigation to /auth/sign-in is handled by AuthGuard reacting to
  // isAuthenticated: false — not this service's responsibility
}

// ── Exported service ──────────────────────────────────────────────────────────

export const sessionService = {
  initialize,
  refreshTokens,
  signOut,
} as const;
