/* ============================================================
   MeetFlow V2 — App-Wide Constants

   RULES:
     - Magic strings and numbers live here, never inline
     - Import from @/config/constants, never hardcode at usage site
     - Do NOT put environment variables here — those go in env.ts
     - Storage keys are grouped at the top — rename them here only
   ============================================================ */

// ── Storage Keys ──────────────────────────────────────────────────────────────
// ALL localStorage / sessionStorage keys are defined here.
// Changing a key name updates every usage site automatically.

/** Theme preference ("light" | "dark" | "system") */
export const THEME_STORAGE_KEY = "meetflow-theme";

/** Must match the FOUT prevention script key in index.html exactly */

/** Persistent UI preferences (sidebar collapsed state, etc.) */
export const UI_STORAGE_KEY = "meetflow-ui";

/** Session hydration data (used only if needed for SSR-style caching) */
export const SESSION_STORAGE_KEY = "meetflow-session";

// ── Application ───────────────────────────────────────────────────────────────
export const APP_NAME = "MeetFlow";
export const APP_VERSION = "2.0.0";

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const PAGINATION_PAGE_SIZES = [10, 20, 50, 100] as const;

// ── Timeouts & Delays ─────────────────────────────────────────────────────────
export const DEBOUNCE_SEARCH_MS = 350;
export const API_TIMEOUT_MS = 30_000;
export const REALTIME_RECONNECT_MS = 2_000;
export const SESSION_REFRESH_BUFFER_MS = 30_000;

// ── Uploads ───────────────────────────────────────────────────────────────────
export const FILE_UPLOAD_MAX_MB = 50;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/csv"] as const;

// ── Meetings ──────────────────────────────────────────────────────────────────
export const MEETING_MAX_PARTICIPANTS = 100;
export const MEETING_MAX_DURATION_MIN = 480;

// ── UI Thresholds ─────────────────────────────────────────────────────────────
export const TABLE_VIRTUALIZATION_THRESHOLD = 200;
export const MIN_SKELETON_DURATION_MS = 300;
