/**
 * useEntitlement — Plan-based feature entitlement check.
 *
 * DISTINCTION FROM useFeatureFlag:
 *
 *   useFeatureFlag("analyticsV2")
 *     → Operational flag. "Is this code ready to be shown?"
 *     → Controlled by engineering (env vars / flag service).
 *     → Same answer for ALL users in an environment.
 *     → Example: "We're rolling out the new analytics gradually."
 *
 *   useEntitlement("recording")
 *     → Plan entitlement. "Is this user's org subscribed to this?"
 *     → Controlled by product + backend (subscription plan).
 *     → Answer differs PER USER based on their plan.
 *     → Example: "Recording is a Pro plan feature."
 *
 * CURRENT STATE (stub):
 *   Returns false for all entitlements until Phase 9 populates
 *   the session store with subscription.features[].
 *
 * PHASE 9 IMPLEMENTATION:
 *   Replace the stub body with:
 *     const features = useSessionStore((s) => s.subscription?.features ?? []);
 *     return features.includes(feature);
 *
 *   The session store's subscription field is populated by
 *   sessionService.initialize() reading the /auth/me response.
 *
 * CALL SITE STABILITY:
 *   This hook's API is final. No call site changes when Phase 9
 *   replaces the stub implementation.
 *
 * SECURITY REMINDER:
 *   Frontend entitlement checks are UI hints — never security gates.
 *   Backend API endpoints enforce plan limits on every request.
 *
 * USAGE:
 *   const canRecord = useEntitlement("recording");
 *   if (!canRecord) return <UpgradePrompt feature="recording" />;
 */

// Plan feature keys — must match the string values returned by the backend
// subscription.features[] array. Extend this list as new plan features are added.
export type PlanFeature =
  | "recording"
  | "custom_branding"
  | "advanced_analytics"
  | "api_access"
  | "sso"
  | "priority_support"
  | "unlimited_storage"
  | "guest_access"
  | "workspace_templates"
  | "audit_logs";

/**
 * Returns true when the current user's subscription includes the given feature.
 *
 * @stub — Returns false until Phase 9 session hydration is implemented.
 * @see Phase 9: modules/auth/api/auth.service.ts for /auth/me implementation
 */
export function useEntitlement(_feature: PlanFeature): boolean {
  // Phase 9 replacement:
  // const features = useSessionStore((s) => s.subscription?.features ?? []);
  // return features.includes(_feature);

  // Stub: no entitlements until session is populated with subscription data
  return false;
}
