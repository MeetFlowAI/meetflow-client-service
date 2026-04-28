/**
 * context/MeetingDataContext.tsx  (v3 — clean, no window events)
 *
 * Exposes broadcast functions directly so MeetingRoom can call them
 * without resorting to window.dispatchEvent hacks.
 *
 * broadcastMuteAll()           → sends mf-control { type:"mute-all" }
 * broadcastSpotlight(identity) → sends mf-control { type:"spotlight", identity }
 * broadcastLock(locked)        → sends mf-control { type:"lock", locked }
 *
 * Verified against:
 *   @livekit/components-react@2.9.20 / livekit-client@2.18.1
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type JSX,
  type ReactNode,
  type SetStateAction,
} from "react";
import { RoomEvent, Track } from "livekit-client";
import type { ReceivedDataMessage } from "@livekit/components-core";
import {
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
  useTrackToggle,
} from "@livekit/components-react";
import type { IStartMeetingResponse } from "@/services/workspace-dashboard/meetings";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReactionEvent {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
  expiresAt: number;
}

export interface MeetingDataContextValue {
  // Hands
  raisedHands: Set<string>;
  handRaised: boolean;
  toggleHand: () => void;

  // Reactions
  reactions: ReactionEvent[];
  sendReaction: (emoji: string) => void;

  // Pinned identity
  pinnedIdentity: string | null;
  setPinnedIdentity: Dispatch<SetStateAction<string | null>>;

  // Host
  hostIdentity: string | null;

  // Connection
  isReconnecting: boolean;

  // Unread chat
  unreadChatCount: number;
  incrementUnreadChat: () => void;
  markChatRead: () => void;

  // Recording (shared across all participants via data channel)
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;

  // Room locked
  isLocked: boolean;

  // Broadcast helpers (used by MeetingRoom / ParticipantsPanel)
  broadcastMuteAll: () => void;
  broadcastSpotlight: (identity: string | null) => void;
  broadcastLock: (locked: boolean) => void;
  broadcastRecordingState: (recording: boolean) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const MeetingDataContext = createContext<MeetingDataContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useMeetingData(): MeetingDataContextValue {
  const ctx = useContext(MeetingDataContext);
  if (!ctx)
    throw new Error("useMeetingData must be used inside MeetingDataProvider");
  return ctx;
}

const REACTION_TTL = 3500;

// ── Provider ───────────────────────────────────────────────────────────────────

interface Props {
  session: IStartMeetingResponse;
  children: ReactNode;
}

export const MeetingDataProvider: React.FC<Props> = ({
  session,
  children,
}): JSX.Element => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { toggle: toggleMicLocal } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  // ── Raised hands ─────────────────────────────────────────────────────
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [handRaised, setHandRaised] = useState(false);

  const { send: sendHand } = useDataChannel(
    "mf-raise-hand",
    useCallback((msg: ReceivedDataMessage<"mf-raise-hand">) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.payload));
        const id = msg.from?.identity;
        if (!id) return;
        setRaisedHands((prev) => {
          const n = new Set(prev);
          if (data.raised) n.add(id);
          else n.delete(id);
          return n;
        });
      } catch {
        /* ignore */
      }
    }, []),
  );

  const toggleHand = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    sendHand(new TextEncoder().encode(JSON.stringify({ raised: next })), {
      reliable: true,
    }).catch(() => {});
  }, [handRaised, sendHand]);

  // ── Reactions ─────────────────────────────────────────────────────────
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);

  const addReaction = useCallback((emoji: string, senderName: string) => {
    const id = crypto.randomUUID();
    setReactions((p) => [
      ...p,
      {
        id,
        emoji,
        senderName,
        x: Math.random() * 60 + 20,
        expiresAt: Date.now() + REACTION_TTL,
      },
    ]);
    setTimeout(
      () => setReactions((p) => p.filter((r) => r.id !== id)),
      REACTION_TTL,
    );
  }, []);

  const { send: sendReactionMsg } = useDataChannel(
    "mf-reactions",
    useCallback(
      (msg: ReceivedDataMessage<"mf-reactions">) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.payload));
          addReaction(
            data.emoji,
            msg.from?.name ?? msg.from?.identity ?? "Someone",
          );
        } catch {
          /* ignore */
        }
      },
      [addReaction],
    ),
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      addReaction(emoji, "You");
      sendReactionMsg(new TextEncoder().encode(JSON.stringify({ emoji })), {
        reliable: false,
      }).catch(() => {});
    },
    [addReaction, sendReactionMsg],
  );

  // ── Pinned identity ───────────────────────────────────────────────────
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

  // ── Host identity + control channel ───────────────────────────────────
  const [hostIdentity, setHostIdentity] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Ref to keep send stable across renders without re-triggering effects
  const sendControlRef = useRef<
    ((p: Uint8Array, o: { reliable: boolean }) => Promise<void>) | null
  >(null);

  const { send: sendControl } = useDataChannel(
    "mf-control",
    useCallback(
      (msg: ReceivedDataMessage<"mf-control">) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.payload));
          if (data.type === "host-announce" && data.identity)
            setHostIdentity(data.identity as string);
          if (data.type === "spotlight")
            setPinnedIdentity((data.identity as string) ?? null);
          if (data.type === "mute-all") toggleMicLocal(); // guests mute themselves
          if (data.type === "lock") setIsLocked(!!data.locked);
          if (data.type === "recording-state") setIsRecording(!!data.recording);
        } catch {
          /* ignore */
        }
      },
      [toggleMicLocal],
    ),
  );

  useEffect(() => {
    sendControlRef.current = sendControl;
  }, [sendControl]);

  // Broadcast helpers exposed to consumers
  const _send = useCallback((payload: object) => {
    sendControlRef
      .current?.(new TextEncoder().encode(JSON.stringify(payload)), {
        reliable: true,
      })
      .catch(() => {});
  }, []);

  const broadcastMuteAll = useCallback(
    () => _send({ type: "mute-all", from: localParticipant.identity }),
    [_send, localParticipant.identity],
  );
  const broadcastSpotlight = useCallback(
    (identity: string | null) => _send({ type: "spotlight", identity }),
    [_send],
  );
  const broadcastLock = useCallback(
    (locked: boolean) => {
      setIsLocked(locked);
      _send({ type: "lock", locked });
    },
    [_send],
  );
  const broadcastRecordingState = useCallback(
    (recording: boolean) => {
      setIsRecording(recording);
      _send({ type: "recording-state", recording });
    },
    [_send],
  );

  // Host announces identity on join and when new participants connect
  useEffect(() => {
    if (session.role !== "host") return;
    const announce = () => {
      const identity = localParticipant.identity;
      if (!identity) return;
      setHostIdentity(identity);
      _send({ type: "host-announce", identity });
    };
    const t = setTimeout(announce, 600);
    room.on(RoomEvent.ParticipantConnected, announce);
    return () => {
      clearTimeout(t);
      room.off(RoomEvent.ParticipantConnected, announce);
    };
  }, [room, session.role, localParticipant.identity, _send]);

  // ── Reconnection ──────────────────────────────────────────────────────
  const [isReconnecting, setIsReconnecting] = useState(false);
  useEffect(() => {
    const on = () => setIsReconnecting(true);
    const off = () => setIsReconnecting(false);
    room.on(RoomEvent.Reconnecting, on);
    room.on(RoomEvent.Reconnected, off);
    return () => {
      room.off(RoomEvent.Reconnecting, on);
      room.off(RoomEvent.Reconnected, off);
    };
  }, [room]);

  // ── Unread chat ───────────────────────────────────────────────────────
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const incrementUnreadChat = useCallback(
    () => setUnreadChatCount((n) => n + 1),
    [],
  );
  const markChatRead = useCallback(() => setUnreadChatCount(0), []);

  const value: MeetingDataContextValue = {
    raisedHands,
    handRaised,
    toggleHand,
    reactions,
    sendReaction,
    pinnedIdentity,
    setPinnedIdentity,
    hostIdentity,
    isReconnecting,
    unreadChatCount,
    incrementUnreadChat,
    markChatRead,
    isRecording,
    setIsRecording,
    isLocked,
    broadcastMuteAll,
    broadcastSpotlight,
    broadcastLock,
    broadcastRecordingState,
  };

  return (
    <MeetingDataContext.Provider value={value}>
      {children}
    </MeetingDataContext.Provider>
  );
};
