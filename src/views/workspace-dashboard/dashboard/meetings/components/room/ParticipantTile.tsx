/**
 * components/room/ParticipantTile.tsx
 *
 * Single participant video tile — production-grade, fully memoized.
 *
 * useIsMuted API (v2.9.x): useIsMuted(trackRef: TrackReferenceOrPlaceholder) → boolean
 * Passes a TrackReferenceOrPlaceholder with publication: undefined for the
 * correct "no publication = muted" behavior.
 */

import React, { type JSX } from "react";
import { Track } from "livekit-client";
import {
  VideoTrack,
  useIsSpeaking,
  useIsMuted,
  useParticipantInfo,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Pin } from "lucide-react";
import clsx from "clsx";
import {
  getParticipantColor,
  getParticipantInitials,
  getDisplayName,
} from "../../utils/participant";
import { useMeetingData } from "../../context/MeetingDataContext";
import ConnectionQualityIndicator from "./ConnectionQualityIndicator";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  isPinned?: boolean;
  onPin?: () => void;
  /** Compact mode: smaller tiles in thumbnail strip / camera strip */
  compact?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────

const ParticipantTileInner: React.FC<ParticipantTileProps> = ({
  trackRef,
  isPinned = false,
  onPin,
  compact = false,
}): JSX.Element => {
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const { name, identity } = useParticipantInfo({ participant });

  // Build a mic TrackReferenceOrPlaceholder for useIsMuted
  // publication: undefined means "no mic track = treated as muted"
  const micTrackRef: TrackReferenceOrPlaceholder = {
    participant,
    source: Track.Source.Microphone,
    publication: participant.getTrackPublication(Track.Source.Microphone),
  };
  const isMicMuted = useIsMuted(micTrackRef);

  // Camera is off if no publication on this ref, or the publication is muted
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;
  const hasVideo =
    isScreenShare ||
    (!!trackRef.publication && !trackRef.publication.isMuted);

  // Raised hand from context
  const { raisedHands } = useMeetingData();
  const hasHandRaised = raisedHands.has(identity ?? "");

  // Display info
  const displayName = getDisplayName(name, identity);
  const avatarColor = getParticipantColor(identity ?? "default");
  const initials = getParticipantInitials(displayName);

  // Ring: speaking > pinned > default
  const ringClass =
    isSpeaking && !isPinned
      ? "ring-2 ring-emerald-400/90 ring-offset-[1.5px] ring-offset-[#0d0d0f]"
      : isPinned
        ? "ring-2 ring-primary-400/90 ring-offset-[1.5px] ring-offset-[#0d0d0f]"
        : "ring-1 ring-white/[0.07]";

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-2xl overflow-hidden",
        "bg-[#1c1c22] cursor-pointer select-none w-full h-full",
        "transition-all duration-200 ease-out",
        ringClass,
      )}
      onClick={onPin}
      role={onPin ? "button" : undefined}
      aria-label={
        onPin ? `${isPinned ? "Unpin" : "Pin"} ${displayName}` : undefined
      }
      aria-pressed={onPin ? isPinned : undefined}
    >
      {/* ── Video ───────────────────────────────────────────────── */}
      {hasVideo && trackRef.publication && (
        <VideoTrack
          trackRef={trackRef as any}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: isScreenShare ? "contain" : "cover",
            transform:
              participant.isLocal && !isScreenShare ? "scaleX(-1)" : "none",
          }}
        />
      )}

      {/* ── Avatar fallback ──────────────────────────────────────── */}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={clsx(
              "rounded-full flex items-center justify-center text-white font-bold",
              compact ? "h-10 w-10 text-sm" : "h-16 w-16 text-xl",
            )}
            style={{ backgroundColor: avatarColor }}
            aria-label={`${displayName} — camera off`}
          >
            {initials}
          </div>
        </div>
      )}

      {/* ── Speaking glow border (inset) ─────────────────────────── */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-emerald-400/30" />
      )}

      {/* ── Top-right: connection quality + pin icon ─────────────── */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {!compact && (
          <div className="bg-black/50 rounded px-1 py-0.5">
            <ConnectionQualityIndicator participant={participant} />
          </div>
        )}
        {isPinned && (
          <div className="h-5 w-5 rounded-full bg-primary-500/85 flex items-center justify-center">
            <Pin className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      {/* ── Top-left: raise hand badge ───────────────────────────── */}
      {hasHandRaised && (
        <div
          className="absolute top-2 left-2 h-6 w-6 rounded-full bg-amber-500/90 flex items-center justify-center text-sm shadow-lg animate-bounce"
          title="Hand raised"
          aria-label="Hand raised"
        >
          ✋
        </div>
      )}

      {/* ── Bottom gradient + name/mic ───────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-2.5 pb-2 pt-8 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none">
        <span
          className={clsx(
            "text-white font-medium leading-none drop-shadow",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {displayName}
          {participant.isLocal && (
            <span className="ml-1 text-[9px] text-white/50 font-normal">
              (you)
            </span>
          )}
        </span>

        {/* Mic muted */}
        {isMicMuted && (
          <div
            className="h-5 w-5 rounded-full bg-red-500/90 flex items-center justify-center shrink-0"
            title="Microphone muted"
            aria-label="Microphone muted"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 fill-none stroke-white stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .38-.03.75-.08 1.11" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Hover: pin hint ──────────────────────────────────────── */}
      {!compact && onPin && !isPinned && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150 bg-black/25 rounded-2xl">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-[11px] font-medium">
            <Pin className="h-3 w-3" />
            Click to pin
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized with custom comparator to prevent render storms in large meetings
const ParticipantTile = React.memo(ParticipantTileInner, (prev, next) => {
  return (
    prev.isPinned === next.isPinned &&
    prev.compact === next.compact &&
    prev.trackRef.participant.identity === next.trackRef.participant.identity &&
    prev.trackRef.source === next.trackRef.source &&
    prev.trackRef.publication?.trackSid === next.trackRef.publication?.trackSid &&
    prev.onPin === next.onPin
  );
});

export default ParticipantTile;
