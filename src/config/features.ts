/* ============================================================
   MeetFlow V2 — Feature Flags
   
   IMPLEMENTATION:
     Current: env-based booleans (zero infrastructure).
     Future:  Replace the `_flagValues` lookup with a LaunchDarkly
              or PostHog client call inside useFeatureFlag().
              Only useFeatureFlag() changes — every usage site
              is untouched.

   USAGE:
     ✅ const enabled = useFeatureFlag("analyticsV2");      (React)
     ✅ const enabled = getFeatureFlag("analyticsV2");      (non-React)
     ❌ import { _flagValues } from "@/config/features";   (never direct)

   ADDING A FLAG:
     1. Add the key here in _flagValues
     2. Add VITE_FEAT_* to .env.example
     3. Use useFeatureFlag("myFlag") at the call site
     4. Never gate features on env.isDev — use a flag
   ============================================================ */

const _flagValues = {
  analyticsV2: import.meta.env["VITE_FEAT_ANALYTICS_V2"] === "true",
  videoRecording: import.meta.env["VITE_FEAT_VIDEO_RECORDING"] === "true",
  aiMeetingSummary: import.meta.env["VITE_FEAT_AI_SUMMARY"] === "true",
  bulkOperations: import.meta.env["VITE_FEAT_BULK_OPS"] === "true",
} as const;

export type FeatureFlag = keyof typeof _flagValues;

/**
 * Returns whether a feature flag is enabled.
 * Use this in non-React contexts (services, utilities).
 *
 * @example
 * if (getFeatureFlag("analyticsV2")) { ... }
 */
export function getFeatureFlag(flag: FeatureFlag): boolean {
  return _flagValues[flag];
}
