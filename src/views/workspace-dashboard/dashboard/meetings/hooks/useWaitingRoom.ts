/**
 * hooks/useWaitingRoom.ts
 *
 * Waiting room — host admits or denies participants before they can publish.
 *
 * DIFFERENTIATOR FEATURE
 *
 * Architecture:
 *   - When a guest joins, their token is issued with canPublish: false by
 *     the backend. They enter a "waiting" state (audio/video disabled).
 *   - Host receives a data channel message "mf-waiting-room" when a guest
 *     is waiting (guest broadcasts their identity + display name on connect).
 *   - Host clicks Admit → backend endpoint re-issues token with canPublish: true
 *     or calls roomService.updateParticipantPermissions().
 *   - Host clicks Deny → backend removes the participant.
 *
 * Frontend-only part:
 *   - Guest: broadcasts "waiting-announce" on connect, shows waiting UI.
 *   - Host: receives announcements, shows admit/deny buttons.
 *   - Both: react to "admitted" / "denied" control messages.
 *
 * Backend endpoints needed (documented for backend team):
 *   POST /workspace/:wId/channels/:cId/meetings/:mId/waiting-room/admit
 *     body: { identity: string }
 *   POST /workspace/:wId/channels/:cId/meetings/:mId/waiting-room/deny
 *     body: { identity: string }
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { RoomEvent } from "livekit-client";
import type { ReceivedDataMessage } from "@livekit/components-core";
import {
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import axiosConfig from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WaitingParticipant {
  identity: string;
  name: string;
  joinedAt: number;
}

export interface UseWaitingRoomReturn {
  waitingParticipants: WaitingParticipant[];
  isWaiting: boolean; // true if THIS participant is in waiting room
  admit: (
    identity: string,
    meetingId: number,
    workspaceId: number,
    channelId: number,
  ) => Promise<void>;
  deny: (
    identity: string,
    meetingId: number,
    workspaceId: number,
    channelId: number,
  ) => Promise<void>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useWaitingRoom(role: "host" | "guest"): UseWaitingRoomReturn {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [waitingParticipants, setWaitingParticipants] = useState<
    WaitingParticipant[]
  >([]);
  const [isWaiting, setIsWaiting] = useState(false);

  const sendRef = useRef<
    ((p: Uint8Array, o: { reliable: boolean }) => Promise<void>) | null
  >(null);

  const onWaitingMessage = useCallback(
    (msg: ReceivedDataMessage<"mf-waiting-room">) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.payload));

        if (data.type === "waiting-announce" && role === "host") {
          // A guest is waiting — add to the list
          setWaitingParticipants((prev) => {
            const exists = prev.find((p) => p.identity === data.identity);
            if (exists) return prev;
            return [
              ...prev,
              {
                identity: data.identity as string,
                name: data.name as string,
                joinedAt: Date.now(),
              },
            ];
          });
        }

        if (
          data.type === "admitted" &&
          data.identity === localParticipant.identity
        ) {
          // WE have been admitted
          setIsWaiting(false);
        }

        if (
          data.type === "denied" &&
          data.identity === localParticipant.identity
        ) {
          // WE have been denied — trigger leave
          room.disconnect();
        }

        if (
          (data.type === "admitted" || data.type === "denied") &&
          role === "host"
        ) {
          // Remove from waiting list
          setWaitingParticipants((prev) =>
            prev.filter((p) => p.identity !== data.identity),
          );
        }
      } catch {
        /* ignore */
      }
    },
    [role, localParticipant.identity, room],
  );

  const { send } = useDataChannel("mf-waiting-room", onWaitingMessage);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Guest announces themselves to host on connect
  useEffect(() => {
    if (role !== "guest") {
      return;
    }

    // Check if we have publish permission — if not, we are in the waiting room
    const canPublish = localParticipant.permissions?.canPublish ?? true;
    if (!canPublish) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsWaiting(true);
      const announce = () => {
        sendRef
          .current?.(
            new TextEncoder().encode(
              JSON.stringify({
                type: "waiting-announce",
                identity: localParticipant.identity,
                name: localParticipant.name ?? localParticipant.identity,
              }),
            ),
            { reliable: true },
          )
          .catch(() => {});
      };
      // Announce immediately + retry in case host wasn't ready
      const t1 = setTimeout(announce, 500);
      const t2 = setTimeout(announce, 2500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [role, localParticipant]);

  // Remove waiting participant when they fully disconnect
  useEffect(() => {
    const onDisconnect = (p: any) => {
      setWaitingParticipants((prev) =>
        prev.filter((wp) => wp.identity !== p.identity),
      );
    };

    room.on(RoomEvent.ParticipantDisconnected, onDisconnect);
    return () => {
      room.off(RoomEvent.ParticipantDisconnected, onDisconnect);
    };
  }, [room]);

  const broadcast = useCallback((payload: object) => {
    sendRef
      .current?.(new TextEncoder().encode(JSON.stringify(payload)), {
        reliable: true,
      })
      .catch(() => {});
  }, []);

  const admit = useCallback(
    async (
      identity: string,
      meetingId: number,
      workspaceId: number,
      channelId: number,
    ) => {
      try {
        await axiosConfig.post(
          `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/waiting-room/admit`,
          { identity },
        );
        broadcast({ type: "admitted", identity });
        setWaitingParticipants((prev) =>
          prev.filter((p) => p.identity !== identity),
        );
      } catch (e) {
        console.error("[MeetFlow] Admit failed:", e);
      }
    },
    [broadcast],
  );

  const deny = useCallback(
    async (
      identity: string,
      meetingId: number,
      workspaceId: number,
      channelId: number,
    ) => {
      try {
        await axiosConfig.post(
          `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/waiting-room/deny`,
          { identity },
        );
        broadcast({ type: "denied", identity });
        setWaitingParticipants((prev) =>
          prev.filter((p) => p.identity !== identity),
        );
      } catch (e) {
        console.error("[MeetFlow] Deny failed:", e);
      }
    },
    [broadcast],
  );

  return { waitingParticipants, isWaiting, admit, deny };
}
