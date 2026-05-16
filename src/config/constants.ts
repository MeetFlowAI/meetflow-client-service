/* ============================================================
   MeetFlow V2 — App-Wide Constants

   RULES:
     - Magic strings and numbers live here, never inline
     - Import from @/config/constants, never hardcode at usage site
     - Do NOT put environment variables here — those go in env.ts
   ============================================================ */

export const APP_NAME = "MeetFlow";
export const APP_VERSION = "2.0.0";

// ── Storage Keys ─────────────────────────────────────────────────────────────
export const THEME_STORAGE_KEY = "meetflow-theme";
export const SESSION_STORAGE_KEY = "meetflow-session";

// ── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const PAGINATION_PAGE_SIZES = [10, 20, 50, 100] as const;

// ── Timeouts & Delays ────────────────────────────────────────────────────────
export const DEBOUNCE_SEARCH_MS = 350;
export const API_TIMEOUT_MS = 30_000;
export const REALTIME_RECONNECT_MS = 2_000;
export const SESSION_REFRESH_BUFFER_MS = 30_000; // refresh 30s before expiry

// ── Uploads ──────────────────────────────────────────────────────────────────
export const FILE_UPLOAD_MAX_MB = 50;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/csv"] as const;

// ── Meetings ─────────────────────────────────────────────────────────────────
export const MEETING_MAX_PARTICIPANTS = 100;
export const MEETING_MAX_DURATION_MIN = 480; // 8 hours

// ── UI Thresholds ─────────────────────────────────────────────────────────────
/** Row count above which AppTable enables virtualization */
export const TABLE_VIRTUALIZATION_THRESHOLD = 200;
/** Minimum ms to show a loading skeleton (prevents flash for fast responses) */
export const MIN_SKELETON_DURATION_MS = 300;
