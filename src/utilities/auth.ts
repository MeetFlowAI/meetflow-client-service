/* Imports */
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { envConfig } from "@/config/envConfig";

// ----------------------------------------------------------------------

// ─── Access Token ─────────────────────────────────────────────────────────────

/**
 * Stores the access token in cookies.
 * rememberMe = true  → 30 days
 * rememberMe = false → 1 day (matches server TOKEN_EXPIRY.ACCESS = "1d")
 */
export const setAccessToken = (
  accessToken: string,
  isRememberMe?: boolean,
): void => {
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + (isRememberMe ? 30 : 1));

  Cookies.set(envConfig.accessTokenKey, accessToken, {
    path: "/",
    sameSite: "strict",
    expires: expiresDate,
  });
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get(envConfig.accessTokenKey);
};

export const removeAccessToken = (): void => {
  Cookies.remove(envConfig.accessTokenKey, { path: "/", sameSite: "strict" });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Stores the refresh token in cookies.
 * rememberMe = true  → 30 days (matches server TOKEN_EXPIRY.REMEMBER_ME = "30d")
 * rememberMe = false → 7 days  (matches server TOKEN_EXPIRY.REFRESH = "7d")
 */
export const setRefreshToken = (
  refreshToken: string,
  isRememberMe?: boolean,
): void => {
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + (isRememberMe ? 30 : 7));

  Cookies.set(envConfig.refreshTokenKey, refreshToken, {
    path: "/",
    sameSite: "strict",
    expires: expiresDate,
  });
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(envConfig.refreshTokenKey);
};

export const removeRefreshToken = (): void => {
  Cookies.remove(envConfig.refreshTokenKey, { path: "/", sameSite: "strict" });
};

// ─── Token Validation ─────────────────────────────────────────────────────────

/**
 * Decodes and validates a JWT — returns decoded payload if not expired, else undefined.
 */
export const isValidToken = (
  accessToken: string,
): { exp: number } | undefined => {
  if (!accessToken) return undefined;
  try {
    const decoded = jwtDecode(accessToken) as { exp: number };
    return decoded?.exp > Date.now() / 1000 ? decoded : undefined;
  } catch {
    return undefined;
  }
};

// ─── Clear All Auth ───────────────────────────────────────────────────────────

/** Removes both tokens at once — used on logout / session expiry. */
export const clearAuthTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};
