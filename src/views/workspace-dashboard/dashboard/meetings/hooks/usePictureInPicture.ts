/**
 * hooks/usePictureInPicture.ts
 *
 * Picture-in-Picture support for the spotlight video element.
 *
 * DIFFERENTIATOR FEATURE
 *
 * Browser PiP API: HTMLVideoElement.requestPictureInPicture()
 * Requires: HTTPS context + user gesture + document.pictureInPictureEnabled
 *
 * Usage:
 *   const { isSupported, isActive, enterPiP, exitPiP } = usePictureInPicture(videoRef)
 *
 * The videoRef should point to the dominant speaker / spotlight <video> element.
 * We use a MutationObserver to grab the first <video> inside the spotlight tile
 * since LiveKit renders <VideoTrack> which internally creates a <video>.
 */

import { useState, useEffect, useCallback, type RefObject } from "react";

export interface UsePictureInPictureReturn {
  isSupported: boolean;
  isActive: boolean;
  toggle: (containerRef: RefObject<HTMLDivElement | null>) => Promise<void>;
}

export function usePictureInPicture(): UsePictureInPictureReturn {
  const isSupported =
    typeof document !== "undefined" &&
    "pictureInPictureEnabled" in document &&
    document.pictureInPictureEnabled;

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const onEnter = () => setIsActive(true);
    const onLeave = () => setIsActive(false);
    document.addEventListener("enterpictureinpicture", onEnter);
    document.addEventListener("leavepictureinpicture", onLeave);
    return () => {
      document.removeEventListener("enterpictureinpicture", onEnter);
      document.removeEventListener("leavepictureinpicture", onLeave);
    };
  }, []);

  const toggle = useCallback(
    async (containerRef: RefObject<HTMLDivElement | null>) => {
      if (!isSupported) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {});
        return;
      }

      // Find the first video element inside the spotlight container
      const video = containerRef.current?.querySelector("video");
      if (!video) return;

      try {
        await video.requestPictureInPicture();
      } catch (e) {
        console.warn("[MeetFlow] PiP request failed:", e);
      }
    },
    [isSupported],
  );

  return { isSupported, isActive, toggle };
}
