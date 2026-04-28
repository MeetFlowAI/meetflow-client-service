/**
 * hooks/useVirtualBackground.ts
 *
 * Virtual background & blur via @livekit/track-processors.
 *
 * DIFFERENTIATOR FEATURE
 *
 * Supports:
 *   - Background blur (BackgroundBlur)
 *   - Virtual background image replacement (VirtualBackground)
 *   - None (remove processor)
 *
 * Usage:
 *   const { mode, setMode, customBgUrl } = useVirtualBackground()
 *
 * The hook wires into the local camera track and applies/removes
 * processors live — no reconnect required.
 *
 * Processor is loaded lazily (dynamic import) so it doesn't bloat the
 * initial bundle. Requires a browser with OffscreenCanvas / WebAssembly.
 */

import { useState, useCallback, useRef } from "react";
import { useLocalParticipant } from "@livekit/components-react";

export type BackgroundMode = "none" | "blur" | "image";

export interface UseVirtualBackgroundReturn {
  mode: BackgroundMode;
  isApplying: boolean;
  isSupported: boolean;
  setBlur: () => Promise<void>;
  setImage: (imageUrl: string) => Promise<void>;
  setNone: () => Promise<void>;
  customBgUrl: string | null;
}

// Preset background images (royalty-free)
export const PRESET_BACKGROUNDS = [
  { id: "office", label: "Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80" },
  { id: "library", label: "Library", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1280&q=80" },
  { id: "nature", label: "Nature", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80" },
  { id: "abstract", label: "Abstract", url: "https://images.unsplash.com/photo-1557683304-673a23048d34?w=1280&q=80" },
];

export function useVirtualBackground(): UseVirtualBackgroundReturn {
  const { localParticipant } = useLocalParticipant();
  const [mode, setModeState] = useState<BackgroundMode>("none");
  const [isApplying, setIsApplying] = useState(false);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const processorRef = useRef<any>(null);

  // Check browser support once
  const isSupported =
    typeof OffscreenCanvas !== "undefined" &&
    typeof WebAssembly !== "undefined";

  const getCameraTrack = useCallback(() => {
    const pub = localParticipant.getTrackPublication("camera" as any);
    return pub?.track ?? null;
  }, [localParticipant]);

  const removeProcessor = useCallback(async () => {
    const track = getCameraTrack();
    if (track && processorRef.current) {
      try {
        await track.stopProcessor();
      } catch { /* silent */ }
      processorRef.current = null;
    }
  }, [getCameraTrack]);

  const setBlur = useCallback(async () => {
    if (!isSupported) return;
    setIsApplying(true);
    try {
      const { BackgroundBlur } = await import("@livekit/track-processors");
      await removeProcessor();
      const track = getCameraTrack();
      if (!track) return;
      const processor = BackgroundBlur();
      processorRef.current = processor;
      await track.setProcessor(processor);
      setModeState("blur");
      setCustomBgUrl(null);
    } catch (e) {
      console.error("[MeetFlow] Background blur failed:", e);
    } finally {
      setIsApplying(false);
    }
  }, [isSupported, getCameraTrack, removeProcessor]);

  const setImage = useCallback(async (imageUrl: string) => {
    if (!isSupported) return;
    setIsApplying(true);
    try {
      const { VirtualBackground } = await import("@livekit/track-processors");
      await removeProcessor();
      const track = getCameraTrack();
      if (!track) return;
      const processor = VirtualBackground(imageUrl);
      processorRef.current = processor;
      await track.setProcessor(processor);
      setModeState("image");
      setCustomBgUrl(imageUrl);
    } catch (e) {
      console.error("[MeetFlow] Virtual background failed:", e);
    } finally {
      setIsApplying(false);
    }
  }, [isSupported, getCameraTrack, removeProcessor]);

  const setNone = useCallback(async () => {
    setIsApplying(true);
    try {
      await removeProcessor();
      setModeState("none");
      setCustomBgUrl(null);
    } finally {
      setIsApplying(false);
    }
  }, [removeProcessor]);

  return { mode, isApplying, isSupported, setBlur, setImage, setNone, customBgUrl };
}
