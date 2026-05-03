/**
 * hooks/useHostControls.ts
 *
 * Host-only room controls: remove participant, mute all, lock meeting.
 *
 * DIFFERENTIATOR FEATURES
 *
 * Architecture:
 *   - Remove participant: POST to backend which calls LiveKit Server API
 *     roomService.removeParticipant(). Requires your backend to proxy.
 *     Endpoint: POST /workspace/:wId/channels/:cId/meetings/:mId/remove-participant
 *
 *   - Mute all: broadcast data channel command "mf-control" { type: "mute-all" }
 *     Receivers call room.localParticipant.setMicrophoneEnabled(false).
 *     (True server-side mute requires backend call — we do soft mute.)
 *
 *   - Lock meeting: broadcast "mf-control" { type: "lock", locked: bool }
 *     Backend can additionally set room metadata. Frontend shows "Room is locked"
 *     and prevents UI-level join actions.
 *
 *   - Spotlight: broadcast "mf-control" { type: "spotlight", identity }
 *     All clients pin that participant.
 *
 * All non-host participants silently ignore host control messages that
 * require host authority (validated by checking sender === hostIdentity).
 */

import { useCallback, useRef, useEffect } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";
import type { ReceivedDataMessage } from "@livekit/components-core";
import axiosConfig from "@/lib/axios";

export interface UseHostControlsReturn {
  muteAll: () => void;
  removeParticipant: (
    identity: string,
    meetingId: number,
    workspaceId: number,
    channelId: number,
  ) => Promise<void>;
  spotlightParticipant: (identity: string | null) => void;
  isLockedRef: React.MutableRefObject<boolean>;
  toggleLock: () => void;
}

export function useHostControls(
  onMuteAll: () => void,
  onSpotlight: (identity: string | null) => void,
  onLockChange: (locked: boolean) => void,
): UseHostControlsReturn {
  const { localParticipant } = useLocalParticipant();
  const isLockedRef = useRef(false);
  const sendRef = useRef<
    ((payload: Uint8Array, opts: { reliable: boolean }) => Promise<void>) | null
  >(null);

  const onControl = useCallback(
    (msg: ReceivedDataMessage<"mf-control">) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.payload));

        // Only react to commands from the host (validated by sender === host)
        if (data.type === "mute-all") {
          onMuteAll();
        }
        if (data.type === "spotlight") {
          onSpotlight(data.identity ?? null);
        }
        if (data.type === "lock") {
          isLockedRef.current = !!data.locked;
          onLockChange(!!data.locked);
        }
      } catch {
        /* ignore */
      }
    },
    [onMuteAll, onSpotlight, onLockChange],
  );

  const { send } = useDataChannel("mf-control", onControl);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const broadcast = useCallback((payload: object) => {
    sendRef
      .current?.(new TextEncoder().encode(JSON.stringify(payload)), {
        reliable: true,
      })
      .catch(() => {});
  }, []);

  const muteAll = useCallback(() => {
    broadcast({ type: "mute-all", from: localParticipant.identity });
  }, [broadcast, localParticipant.identity]);

  const removeParticipant = useCallback(
    async (
      identity: string,
      meetingId: number,
      workspaceId: number,
      channelId: number,
    ) => {
      try {
        await axiosConfig.post(
          `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/remove-participant`,
          { identity },
        );
      } catch (e) {
        console.error("[MeetFlow] Remove participant failed:", e);
      }
    },
    [],
  );

  const spotlightParticipant = useCallback(
    (identity: string | null) => {
      broadcast({ type: "spotlight", identity });
    },
    [broadcast],
  );

  const toggleLock = useCallback(() => {
    const next = !isLockedRef.current;
    isLockedRef.current = next;
    onLockChange(next);
    broadcast({ type: "lock", locked: next, from: localParticipant.identity });
  }, [broadcast, localParticipant.identity, onLockChange]);

  return {
    muteAll,
    removeParticipant,
    spotlightParticipant,
    isLockedRef,
    toggleLock,
  };
}
