/**
 * components/panels/ParticipantsPanel.tsx  (v2 — with host controls)
 *
 * Adds:
 *  ✅ Remove participant (host only — 3-dot menu per row)
 *  ✅ Mute all button (host only)
 *  ✅ Spotlight participant (host only)
 *  ✅ Waiting room indicator (if enabled)
 */

import React, { useMemo, useState, type JSX } from "react";
import { Track, type Participant } from "livekit-client";
import {
  useParticipants,
  useLocalParticipant,
  useIsSpeaking,
  useIsMuted,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Users,
  MoreVertical,
  UserX,
  Pin,
  Lock,
  Unlock,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";
import PanelHeader from "../shared/PanelHeader";
import ConnectionQualityIndicator from "../room/ConnectionQualityIndicator";
import { useMeetingData } from "../../context/useMeetingData";
import {
  getParticipantColor,
  getParticipantInitials,
  getDisplayName,
} from "../../utils/participant";
import type { IStartMeetingResponse } from "@/services/workspace-dashboard/meetings";

// ── ParticipantRow ─────────────────────────────────────────────────────────────

interface ParticipantRowProps {
  participant: Participant;
  isLocal: boolean;
  isHost: boolean;
  hasHandRaised: boolean;
  canModerate: boolean;
  onRemove: () => void;
  onSpotlight: () => void;
}

const ParticipantRowInner: React.FC<ParticipantRowProps> = ({
  participant,
  isLocal,
  isHost,
  hasHandRaised,
  canModerate,
  onRemove,
  onSpotlight,
}) => {
  const isSpeaking = useIsSpeaking(participant);
  const [menuOpen, setMenuOpen] = useState(false);

  const micTrackRef: TrackReferenceOrPlaceholder = {
    participant,
    source: Track.Source.Microphone,
    publication: participant.getTrackPublication(Track.Source.Microphone),
  };
  const camTrackRef: TrackReferenceOrPlaceholder = {
    participant,
    source: Track.Source.Camera,
    publication: participant.getTrackPublication(Track.Source.Camera),
  };
  const isMicMuted = useIsMuted(micTrackRef);
  const isCamMuted = useIsMuted(camTrackRef);

  const name = getDisplayName(participant.name, participant.identity);
  const color = getParticipantColor(participant.identity ?? "");
  const initials = getParticipantInitials(name);

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 relative",
        "hover:bg-white/[0.03]",
        isSpeaking && "bg-emerald-500/[0.04]",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={clsx(
            "h-8 w-8 rounded-full flex items-center justify-center",
            "text-white text-[11px] font-bold select-none transition-shadow duration-200",
            isSpeaking && "shadow-[0_0_0_2px_rgba(52,211,153,0.85)]",
          )}
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        {isSpeaking && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-[1.5px] border-[#111115] animate-pulse" />
        )}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-white text-[13px] font-medium truncate leading-none">
            {name}
          </span>
          {isHost && (
            <span
              className="text-[10px] text-white/35 leading-none shrink-0"
              title="Host"
            >
              <Crown className="h-3.5 w-3.5" />
            </span>
          )}
          {isLocal && (
            <span className="text-[10px] text-white/35 leading-none shrink-0">
              (you)
            </span>
          )}
          {hasHandRaised && (
            <span className="text-sm leading-none shrink-0" title="Hand raised">
              ✋
            </span>
          )}
        </div>
      </div>

      {/* Status icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ConnectionQualityIndicator participant={participant} />
        {isMicMuted ? (
          <span
            className="flex items-center gap-1.5 text-red-400"
            title="Mic muted"
          >
            <MicOff className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span
            className="flex items-center gap-1.5 text-white/30"
            title="Mic on"
          >
            <Mic className="h-3.5 w-3.5" />
          </span>
        )}
        {isCamMuted ? (
          <span
            className="flex items-center gap-1.5 text-red-400"
            title="Camera off"
          >
            <VideoOff className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span
            className="flex items-center gap-1.5 text-white/30"
            title="Camera on"
          >
            <Video className="h-3.5 w-3.5" />
          </span>
        )}

        {/* 3-dot menu — host only, non-self */}
        {canModerate && !isLocal && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-6 w-6 rounded-md text-white/25 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label={`Options for ${name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className={clsx(
                    "absolute right-0 top-7 z-20 w-44",
                    "bg-[#1e1e26] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60",
                    "py-1 animate-in fade-in slide-in-from-top-1 duration-150",
                  )}
                >
                  <button
                    onClick={() => {
                      onSpotlight();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Spotlight for everyone
                  </button>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    onClick={() => {
                      onRemove();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Remove from meeting
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ParticipantRow = React.memo(ParticipantRowInner, (prev, next) => {
  return (
    prev.participant.identity === next.participant.identity &&
    prev.isLocal === next.isLocal &&
    prev.isHost === next.isHost &&
    prev.hasHandRaised === next.hasHandRaised &&
    prev.canModerate === next.canModerate
  );
});

// ── Panel ──────────────────────────────────────────────────────────────────────

interface ParticipantsPanelProps {
  session: IStartMeetingResponse;
  onClose: () => void;
  onMuteAll: () => void;
  onRemoveParticipant: (identity: string) => void;
  onSpotlight: (identity: string) => void;
  onToggleLock: () => void;
  isLocked: boolean;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  session,
  onClose,
  onMuteAll,
  onRemoveParticipant,
  onSpotlight,
  onToggleLock,
  isLocked,
}): JSX.Element => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { hostIdentity, raisedHands } = useMeetingData();

  const isHost = session.role === "host";

  const sortedRemotes = useMemo(() => {
    const remotes = participants.filter(
      (p) => p.identity !== localParticipant.identity,
    );
    return [...remotes].sort((a, b) => {
      if (a.identity === hostIdentity) return -1;
      if (b.identity === hostIdentity) return 1;
      const aHand = raisedHands.has(a.identity);
      const bHand = raisedHands.has(b.identity);
      if (aHand && !bHand) return -1;
      if (!aHand && bHand) return 1;
      return (a.name || a.identity).localeCompare(b.name || b.identity);
    });
  }, [participants, localParticipant.identity, hostIdentity, raisedHands]);

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 h-full",
        "bg-[#111115] border-l border-white/[0.07]",
        "animate-in slide-in-from-right-3 duration-200",
      )}
    >
      <PanelHeader
        title="Participants"
        icon={<Users className="h-4 w-4" />}
        badge={participants.length}
        onClose={onClose}
      />

      {/* Host controls */}
      {isHost && (
        <div className="px-3 py-2 border-b border-white/[0.07] flex items-center gap-2">
          <button
            onClick={onMuteAll}
            className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/50 hover:text-white text-[11px] font-medium transition-colors"
            title="Mute all participants"
          >
            <VolumeX className="h-3 w-3" />
            Mute all
          </button>
          <button
            onClick={onToggleLock}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium transition-colors",
              isLocked
                ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/22"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-white/50 hover:text-white",
            )}
            title={
              isLocked ? "Unlock meeting" : "Lock meeting — prevent new joins"
            }
          >
            {isLocked ? (
              <>
                <Lock className="h-3 w-3" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                Lock
              </>
            )}
          </button>
        </div>
      )}

      {/* Locked banner for guests */}
      {!isHost && isLocked && (
        <div className="mx-3 my-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-amber-400 text-[11px]">
            Room is locked by host
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Local participant always first */}
        <ParticipantRow
          participant={localParticipant}
          isLocal
          isHost={localParticipant.identity === hostIdentity}
          hasHandRaised={raisedHands.has(localParticipant.identity)}
          canModerate={false}
          onRemove={() => {}}
          onSpotlight={() => {}}
        />

        {sortedRemotes.length > 0 && (
          <div className="mx-4 my-1 h-px bg-white/[0.05]" />
        )}

        {sortedRemotes.map((p) => (
          <ParticipantRow
            key={p.identity}
            participant={p}
            isLocal={false}
            isHost={p.identity === hostIdentity}
            hasHandRaised={raisedHands.has(p.identity)}
            canModerate={isHost}
            onRemove={() => onRemoveParticipant(p.identity)}
            onSpotlight={() => onSpotlight(p.identity)}
          />
        ))}

        {participants.length <= 1 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
            <Users className="h-8 w-8 text-white/15" />
            <p className="text-white/25 text-sm">Waiting for others to join…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
