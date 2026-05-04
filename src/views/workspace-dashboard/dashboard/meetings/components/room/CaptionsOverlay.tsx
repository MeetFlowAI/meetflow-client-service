/**
 * components/room/CaptionsOverlay.tsx
 *
 * Live transcription captions overlay — rendered at bottom of video area.
 * Reads from useLiveTranscription hook passed via props.
 *
 * DIFFERENTIATOR FEATURE
 */

import React, { type JSX } from "react";
import { type CaptionLine } from "../../hooks/useLiveTranscription";
import clsx from "clsx";

interface CaptionsOverlayProps {
  captions: CaptionLine[];
  enabled: boolean;
}

const CaptionsOverlay: React.FC<CaptionsOverlayProps> = ({
  captions,
  enabled,
}): JSX.Element | null => {
  if (!enabled || captions.length === 0) return null;

  return (
    <div
      className={clsx(
        "absolute bottom-2 left-1/2 -translate-x-1/2",
        "flex flex-col items-center gap-1",
        "w-full max-w-[600px] px-6 pointer-events-none z-10",
      )}
      aria-live="polite"
      aria-label="Live captions"
    >
      {captions.map((line) => (
        <div
          key={line.id}
          className={clsx(
            "px-4 py-1.5 rounded-xl text-center text-[13px] leading-snug",
            "backdrop-blur-sm",
            line.final
              ? "bg-black/70 text-white"
              : "bg-black/50 text-white/70 italic",
          )}
        >
          <span className="text-[10px] text-white/50 font-medium mr-2">
            {line.speakerName}:
          </span>
          {line.text}
        </div>
      ))}
    </div>
  );
};

export default CaptionsOverlay;
