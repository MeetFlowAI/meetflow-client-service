/**
 * components/room/ScreenShareView.tsx
 *
 * Full-screen screen share view with participant camera strip.
 * Shows the primary sharer's screen large, all cameras in a bottom strip.
 * Supports multiple simultaneous screen shares (tabbed / selector).
 */

import React, { useState, type JSX } from "react";
import { Track } from "livekit-client";
import {
  useTracks,
  VideoTrack,
  isTrackReference,
} from "@livekit/components-react";
import { Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import ParticipantTile from "./ParticipantTile";
import { getDisplayName } from "../../utils/participant";

const ScreenShareView: React.FC = (): JSX.Element | null => {
  const [activeShareIndex, setActiveShareIndex] = useState(0);

  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const cameraTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);

  if (!screenShareTracks.length) return null;

  const validShares = screenShareTracks.filter(isTrackReference);
  if (!validShares.length) return null;

  const safeIndex = Math.min(activeShareIndex, validShares.length - 1);
  const primaryShare = validShares[safeIndex];

  const sharerName = getDisplayName(
    primaryShare.participant.name,
    primaryShare.participant.identity,
  );

  return (
    <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden min-h-0">
      {/* Main screen share */}
      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden bg-[#0f0f14] border border-white/[0.07]">
        <VideoTrack
          trackRef={primaryShare}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "contain" }}
        />

        {/* Sharer label */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
          <Monitor className="h-4 w-4 text-primary-400" />
          <span className="text-white text-xs font-medium">
            {primaryShare.participant.isLocal
              ? "You are sharing your screen"
              : `${sharerName} is sharing their screen`}
          </span>
        </div>

        {/* Multi-share navigator */}
        {validShares.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={() => setActiveShareIndex((i) => Math.max(0, i - 1))}
              disabled={safeIndex === 0}
              className="h-7 w-7 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-white/60 text-xs px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
              {safeIndex + 1} / {validShares.length}
            </span>
            <button
              onClick={() =>
                setActiveShareIndex((i) =>
                  Math.min(validShares.length - 1, i + 1),
                )
              }
              disabled={safeIndex === validShares.length - 1}
              className="h-7 w-7 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Camera strip */}
      {cameraTracks.length > 0 && (
        <div className={clsx(
          "shrink-0 flex gap-2 overflow-x-auto scrollbar-none",
          "h-24 pb-0.5",
        )}>
          {cameraTracks.map((ref) => (
            <div key={ref.participant.identity} className="shrink-0 w-36 h-full">
              <ParticipantTile trackRef={ref} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenShareView;
