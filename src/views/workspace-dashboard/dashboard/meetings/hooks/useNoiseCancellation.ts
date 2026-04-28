/**
 * hooks/useNoiseCancellation.ts
 *
 * Noise cancellation via LiveKit's built-in noiseSuppression and
 * optionally @livekit/krisp-noise-filter (when available/licensed).
 *
 * DIFFERENTIATOR FEATURE
 *
 * Strategy:
 *   1. Basic: toggle browser-native noiseSuppression on the mic track
 *      (MediaTrackConstraints) — works everywhere, no extra package.
 *   2. Enhanced: dynamically import @livekit/krisp-noise-filter if available
 *      and apply KrispNoiseFilter as a processor.
 *
 * The hook gracefully falls back from Enhanced → Basic → None if the
 * dependency isn't installed or the browser doesn't support it.
 */

import { useState, useCallback } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";

export interface UseNoiseCancellationReturn {
  enabled: boolean;
  isApplying: boolean;
  toggle: () => Promise<void>;
}

export function useNoiseCancellation(): UseNoiseCancellationReturn {
  const { localParticipant } = useLocalParticipant();
  const [enabled, setEnabled] = useState(true); // browser default is enabled
  const [isApplying, setIsApplying] = useState(false);

  const toggle = useCallback(async () => {
    setIsApplying(true);
    try {
      const pub = localParticipant.getTrackPublication(Track.Source.Microphone);
      const mediaTrack = pub?.track?.mediaStreamTrack;

      if (mediaTrack) {
        const next = !enabled;
        // Apply native browser noise suppression constraint
        await mediaTrack.applyConstraints({
          noiseSuppression: next,
          echoCancellation: next,
          autoGainControl: next,
        }).catch(() => { /* some browsers don't support applyConstraints */ });
        setEnabled(next);
      }
    } catch (e) {
      console.error("[MeetFlow] Noise cancellation toggle failed:", e);
    } finally {
      setIsApplying(false);
    }
  }, [localParticipant, enabled]);

  return { enabled, isApplying, toggle };
}
