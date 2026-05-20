/* ============================================================
   MeetFlow V2 — Token Service

   THIS IS THE ONLY FILE THAT READS/WRITES localStorage FOR TOKENS.
   All other files that need token values import from here.

   Token storage uses localStorage (not sessionStorage) so that
   auth persists across tabs and browser restarts.

   SECURITY NOTE:
     localStorage tokens are susceptible to XSS attacks.
     Mitigate by enforcing a strict Content-Security-Policy header
     at the CDN/server level and never evaluating untrusted scripts.
     For higher security requirements, switch to httpOnly cookies
     by replacing the localStorage calls here — no other file changes.
   ============================================================ */

const ACCESS_TOKEN_KEY = "mf_access";
const REFRESH_TOKEN_KEY = "mf_refresh";

// ── Token read/write ──────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // Silently fail — the user will be re-prompted to sign in
    console.warn("[tokenService] Failed to persist tokens to localStorage.");
  }
}

function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore — localStorage may be unavailable
  }
}

// ── JWT expiry check ──────────────────────────────────────────────────────────

/**
 * Returns true when the access token exists and will not expire
 * within the next SESSION_REFRESH_BUFFER_MS milliseconds.
 * Does NOT make a network call — reads exp from the JWT payload.
 */
function isAccessTokenValid(bufferMs = 30_000): boolean {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Base64url → Base64 → JSON
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };

    if (typeof payload.exp !== "number") return false;

    // exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 > Date.now() + bufferMs;
  } catch {
    return false;
  }
}

// ── Exported service object ───────────────────────────────────────────────────

export const tokenService = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAccessTokenValid,
} as const;
