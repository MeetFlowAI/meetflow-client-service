/**
 * components/room/WaitingRoomOverlay.tsx
 *
 * Two responsibilities:
 *
 * 1. GUEST waiting screen — shown when isWaiting === true.
 *    Covers the whole meeting area with a "Waiting for host to let you in" UI.
 *
 * 2. HOST admission bar — shown when waitingParticipants.length > 0.
 *    Appears as a non-blocking bar at the top of the video area.
 *    Host can admit or deny each waiting participant.
 */

import React, { type JSX } from "react";
import { Clock, UserCheck, UserX, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { WaitingParticipant } from "../../hooks/useWaitingRoom";
import {
  getParticipantColor,
  getParticipantInitials,
  getDisplayName,
} from "../../utils/participant";

// ── Guest waiting screen ───────────────────────────────────────────────────────

export const WaitingScreen: React.FC = (): JSX.Element => (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0d0d0f]">
    <div className="flex flex-col items-center gap-5 text-center px-8 max-w-sm">
      <div className="h-16 w-16 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
        <Clock className="h-8 w-8 text-primary-400 animate-pulse" />
      </div>
      <div>
        <h2 className="text-white text-lg font-semibold mb-2">
          Waiting to be admitted
        </h2>
        <p className="text-white/40 text-sm leading-relaxed">
          The host will let you in shortly. Your camera and microphone are off until you're admitted.
        </p>
      </div>
      <div className="flex items-center gap-2 text-white/30 text-[12px]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Waiting for host…
      </div>
    </div>
  </div>
);

// ── Host admission bar ─────────────────────────────────────────────────────────

interface AdmissionBarProps {
  waitingParticipants: WaitingParticipant[];
  onAdmit: (identity: string) => void;
  onDeny: (identity: string) => void;
}

export const AdmissionBar: React.FC<AdmissionBarProps> = ({
  waitingParticipants,
  onAdmit,
  onDeny,
}): JSX.Element | null => {
  if (waitingParticipants.length === 0) return null;

  return (
    <div
      className={clsx(
        "absolute top-2 left-1/2 -translate-x-1/2 z-20",
        "w-full max-w-lg px-4",
        "flex flex-col gap-2",
        "animate-in slide-in-from-top-3 duration-200",
      )}
    >
      {waitingParticipants.map(p => {
        const name = getDisplayName(p.name, p.identity);
        const color = getParticipantColor(p.identity);
        const initials = getParticipantInitials(name);

        return (
          <div
            key={p.identity}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl",
              "bg-[#1e1e28] border border-white/[0.12] shadow-xl shadow-black/40",
              "backdrop-blur-sm",
            )}
          >
            {/* Avatar */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-medium truncate">{name}</p>
              <p className="text-white/35 text-[10px]">is waiting to join</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onDeny(p.identity)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
                  "bg-red-500/10 border border-red-500/25 text-red-400",
                  "hover:bg-red-500/18 transition-colors",
                )}
                title={`Deny ${name}`}
              >
                <UserX className="h-3.5 w-3.5" />
                Deny
              </button>
              <button
                onClick={() => onAdmit(p.identity)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
                  "bg-primary-500 hover:bg-primary-600 text-white",
                  "transition-colors shadow-lg shadow-primary-500/20",
                )}
                title={`Admit ${name}`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Admit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
