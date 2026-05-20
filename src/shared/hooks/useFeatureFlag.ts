import { getFeatureFlag, type FeatureFlag } from "@/config/features";

/**
 * Returns whether a feature flag is enabled.
 *
 * This hook is the ONLY interface feature code uses to check flags.
 * The underlying implementation (env-based, LaunchDarkly, PostHog)
 * is swappable inside this hook without touching any usage site.
 *
 * @example
 * const isEnabled = useFeatureFlag("analyticsV2");
 * if (isEnabled) return <AnalyticsV2Dashboard />;
 * return <AnalyticsV1Dashboard />;
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  // Today: reads from env-based static values via getFeatureFlag()
  //
  // Tomorrow (when switching to a runtime flag service):
  //   Replace with: return useLDFlag(flag) or usePostHogFlag(flag)
  //   The hook API is stable — zero usage site changes.
  return getFeatureFlag(flag);
}
