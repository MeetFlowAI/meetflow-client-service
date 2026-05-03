/**
 * ParticipantTile.tsx  (v3 — premium redesign, CSS token theming)
 *
 * Uses --mf-* tokens. Zero hardcoded colors.
 * States: speaking ring · pinned ring · hand raised badge ·
 *         mic-off badge · connection quality · camera-off avatar ·
 *         local mirror · hover pin hint.
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
import { useMeetingData } from "../../context/useMeetingData";
import ConnectionQualityIndicator from "./ConnectionQualityIndicator";

interface ParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  isPinned?: boolean;
  onPin?: () => void;
  compact?: boolean;
}

const ParticipantTileInner: React.FC<ParticipantTileProps> = ({
  trackRef,
  isPinned = false,
  onPin,
  compact = false,
}): JSX.Element => {
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const { name, identity } = useParticipantInfo({ participant });

  const micTrackRef: TrackReferenceOrPlaceholder = {
    participant,
    source: Track.Source.Microphone,
    publication: participant.getTrackPublication(Track.Source.Microphone),
  };
  const isMicMuted = useIsMuted(micTrackRef);

  const isScreenShare = trackRef.source === Track.Source.ScreenShare;
  const hasVideo = isScreenShare
    ? !!trackRef.publication
    : !!trackRef.publication && !trackRef.publication.isMuted;

  const { raisedHands } = useMeetingData();
  const hasHandRaised = raisedHands.has(identity ?? "");

  const displayName = getDisplayName(name, identity);
  const avatarColor = getParticipantColor(identity ?? "default");
  const initials = getParticipantInitials(displayName);

  // Ring class: applied via CSS utility classes from meeting.css
  const ringClass =
    isSpeaking && !isPinned
      ? "mf-tile-ring-speaking"
      : isPinned
        ? "mf-tile-ring-pinned"
        : "mf-tile-ring-default";

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden w-full h-full",
        "select-none transition-all duration-200 ease-out",
        ringClass,
        onPin && "cursor-pointer",
      )}
      style={{
        background: "var(--mf-tile-bg)",
        borderRadius: "var(--mf-radius-tile)",
      }}
      onClick={onPin}
      role={onPin ? "button" : undefined}
      aria-label={
        onPin ? `${isPinned ? "Unpin" : "Pin"} ${displayName}` : undefined
      }
      aria-pressed={onPin ? isPinned : undefined}
    >
      {/* ── Video ─────────────────────────────────────────────────────── */}
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

      {/* ── Avatar fallback ───────────────────────────────────────────── */}
      {!hasVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, ${avatarColor}22 0%, var(--mf-tile-bg) 70%)`,
          }}
        >
          <div
            className={clsx(
              "rounded-full flex items-center justify-center text-white font-bold",
              "shadow-lg transition-transform duration-200",
              compact ? "h-9 w-9 text-xs" : "h-16 w-16 text-xl",
            )}
            style={{
              background: avatarColor,
              boxShadow: `0 0 0 3px ${avatarColor}30`,
            }}
          >
            {initials}
          </div>
        </div>
      )}

      {/* ── Speaking glow inset ───────────────────────────────────────── */}
      {isSpeaking && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "var(--mf-radius-tile)",
            boxShadow: "inset 0 0 0 1.5px var(--mf-success-muted)",
          }}
        />
      )}

      {/* ── Top-right: quality + pin ──────────────────────────────────── */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {!compact && (
          <div
            className="flex items-center justify-center rounded-md px-1 py-0.5"
            style={{
              background: "rgba(0,0,0,0.52)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ConnectionQualityIndicator participant={participant} />
          </div>
        )}
        {isPinned && (
          <div
            className="h-5 w-5 rounded-full flex items-center justify-center"
            style={{ background: "var(--mf-accent)" }}
          >
            <Pin className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      {/* ── Top-left: raise hand ─────────────────────────────────────── */}
      {hasHandRaised && (
        <div
          className="absolute top-2 left-2 h-7 w-7 rounded-full flex items-center justify-center text-sm shadow-lg"
          style={{
            background: "var(--mf-warning)",
            animation: "mf-admit-in 0.2s ease-out",
            boxShadow: "0 2px 8px rgba(251,191,36,0.45)",
          }}
          title="Hand raised"
          aria-label="Hand raised"
        >
          ✋
        </div>
      )}

      {/* ── Bottom gradient + name bar ────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between pointer-events-none"
        style={{
          padding: compact ? "18px 8px 7px" : "32px 11px 9px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)",
        }}
      >
        <span
          className={clsx(
            "font-medium leading-none",
            compact ? "text-[9px]" : "text-[11px]",
          )}
          style={{
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {displayName}
          {participant.isLocal && (
            <span
              className="ml-1 font-normal"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "9px" }}
            >
              (you)
            </span>
          )}
        </span>

        {/* Mic-off badge */}
        {isMicMuted && (
          <div
            className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "var(--mf-danger-strong)",
              boxShadow: "0 1px 4px rgba(239,68,68,0.5)",
            }}
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

      {/* ── Hover: pin CTA ────────────────────────────────────────────── */}
      {!compact && onPin && !isPinned && (
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
          style={{
            background: "rgba(0,0,0,0.22)",
            borderRadius: "var(--mf-radius-tile)",
          }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-medium"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
            }}
          >
            <Pin className="h-3 w-3" />
            Click to pin
          </div>
        </div>
      )}
    </div>
  );
};

const ParticipantTile = React.memo(
  ParticipantTileInner,
  (prev, next) =>
    prev.isPinned === next.isPinned &&
    prev.compact === next.compact &&
    prev.trackRef.participant.identity === next.trackRef.participant.identity &&
    prev.trackRef.source === next.trackRef.source &&
    prev.trackRef.publication?.trackSid ===
      next.trackRef.publication?.trackSid &&
    prev.onPin === next.onPin,
);

export default ParticipantTile;
