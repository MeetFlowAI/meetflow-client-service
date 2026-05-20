/* ============================================================
   MeetFlow V2 — Environment Variable Access
   
   THIS IS THE ONLY FILE THAT MAY READ import.meta.env.
   All other files import typed values from this module.
   
   RULES:
     - requireEnv() is used for MANDATORY variables.
       The app throws at startup if they are missing.
     - optionalEnv() is used for variables that have no
       fallback impact on boot (monitoring, third-party SDKs).
     - Never use import.meta.env outside of this file.
       The ESLint rule enforces this at CI time.
   ============================================================ */

function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    throw new Error(
      `[MeetFlow] Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env.local and set the value.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return (import.meta.env[key] as string | undefined) ?? fallback;
}

// ── Exported environment config ───────────────────────────────────────────────
// Import { env } from "@/config/env" everywhere you need a runtime value.
export const env = {
  // ── API ────────────────────────────────────────────────────────────────
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  wsBaseUrl: optionalEnv("VITE_WS_BASE_URL"),

  // ── Auth ───────────────────────────────────────────────────────────────
  authDomain: optionalEnv("VITE_AUTH_DOMAIN"),

  // ── Real-time (Phase 13 — optional until then) ─────────────────────────
  livekitUrl: optionalEnv("VITE_LIVEKIT_URL"),
  streamApiKey: optionalEnv("VITE_STREAM_API_KEY"),

  // ── Monitoring (Phase 8 — optional until then) ─────────────────────────
  sentryDsn: optionalEnv("VITE_SENTRY_DSN"),

  // ── Application ────────────────────────────────────────────────────────
  appVersion: optionalEnv("VITE_APP_VERSION", "2.0.0"),

  // ── Runtime flags ──────────────────────────────────────────────────────
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

export type Env = typeof env;
