/**
 * components/room/VideoGrid.tsx
 *
 * Main video area with SPEAKER and GRID layout modes.
 *
 * Changes from original:
 *  - pinnedIdentity moved to MeetingDataContext (removed local state)
 *  - setPinnedIdentity from context — stable reference, memo-safe
 *  - onPin callbacks wrapped in useCallback for React.memo stability
 *  - trackMap memoized with proper deps
 *  - Thumbnail strip: scrollable, h-24, shows "+N more" when > 8
 *  - Grid: responsive auto-fit with max 4 cols
 */

import React, { useMemo, useCallback, type JSX } from "react";
import { Track } from "livekit-client";
import {
  useParticipants,
  useTracks,
  useLocalParticipant,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Users } from "lucide-react";
import clsx from "clsx";
import ParticipantTile from "./ParticipantTile";
import { useMeetingData } from "../../context/useMeetingData";

export type MeetingLayout = "speaker" | "grid";

interface VideoGridProps {
  layout: MeetingLayout;
}

function getGridCols(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  if (count <= 9) return "grid-cols-3";
  return "grid-cols-4";
}

const MAX_THUMBNAILS = 8;

const VideoGrid: React.FC<VideoGridProps> = ({ layout }): JSX.Element => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { pinnedIdentity, setPinnedIdentity } = useMeetingData();

  const trackRefs = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // Active speaker = loudest non-local participant
  const activeSpeaker = useMemo(() => {
    return participants.find(
      (p) => p.isSpeaking && p.identity !== localParticipant.identity,
    );
  }, [participants, localParticipant.identity]);

  // Map identity → best track ref (prefer screen share)
  const trackMap = useMemo(() => {
    const m = new Map<string, TrackReferenceOrPlaceholder>();
    for (const ref of trackRefs) {
      const id = ref.participant.identity;
      if (ref.source === Track.Source.ScreenShare || !m.has(id)) {
        m.set(id, ref);
      }
    }
    return m;
  }, [trackRefs]);

  // Stable pin handler factory
  const makePinHandler = useCallback(
    (identity: string) => () => {
      setPinnedIdentity(pinnedIdentity === identity ? null : identity);
    },
    [pinnedIdentity, setPinnedIdentity],
  );

  // Spotlight identity resolution
  const spotlightIdentity =
    pinnedIdentity ??
    activeSpeaker?.identity ??
    participants.find((p) => p.identity !== localParticipant.identity)
      ?.identity ??
    localParticipant.identity;

  const spotlightRef = trackMap.get(spotlightIdentity);
  const thumbnailParticipants = participants.filter(
    (p) => p.identity !== spotlightIdentity,
  );

  const visibleThumbnails = thumbnailParticipants.slice(0, MAX_THUMBNAILS);
  const hiddenCount = thumbnailParticipants.length - visibleThumbnails.length;

  // ── GRID LAYOUT ──────────────────────────────────────────────────────
  if (layout === "grid") {
    const count = participants.length;
    const colClass = getGridCols(count);

    return (
      <div
        className={clsx(
          "flex-1 grid gap-2 p-3 overflow-hidden min-h-0",
          colClass,
        )}
      >
        {participants.map((p) => {
          const ref = trackMap.get(p.identity);
          if (!ref) return null;
          return (
            <ParticipantTile
              key={`${p.identity}-${ref.source}`}
              trackRef={ref}
              isPinned={pinnedIdentity === p.identity}
              onPin={makePinHandler(p.identity)}
            />
          );
        })}

        {participants.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 text-center py-20">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Users className="h-7 w-7 text-white/25" />
            </div>
            <p className="text-white/30 text-sm">
              Waiting for participants to join…
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── SPEAKER LAYOUT ───────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden min-h-0">
      {/* Spotlight */}
      <div className="flex-1 min-h-0">
        {spotlightRef ? (
          <ParticipantTile
            trackRef={spotlightRef}
            isPinned={pinnedIdentity === spotlightIdentity}
            onPin={makePinHandler(spotlightIdentity)}
          />
        ) : (
          <div className="h-full flex items-center justify-center rounded-2xl bg-[#1a1a1f] border border-white/[0.07]">
            <p className="text-white/25 text-sm">No video available</p>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {visibleThumbnails.length > 0 && (
        <div className="shrink-0 h-24 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {visibleThumbnails.map((p) => {
            const ref = trackMap.get(p.identity);
            if (!ref) return null;
            return (
              <div key={p.identity} className="shrink-0 w-40 h-full">
                <ParticipantTile
                  trackRef={ref}
                  compact
                  isPinned={pinnedIdentity === p.identity}
                  onPin={makePinHandler(p.identity)}
                />
              </div>
            );
          })}

          {/* "+N more" chip */}
          {hiddenCount > 0 && (
            <div className="shrink-0 w-20 h-full flex items-center justify-center rounded-2xl bg-white/5 border border-white/[0.07] text-white/40 text-xs font-medium">
              +{hiddenCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
