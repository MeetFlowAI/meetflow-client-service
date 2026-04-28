/**
 * components/chat/DMChat.tsx
 *
 * Stream Chat wiring for 1-to-1 DMs.
 *
 * Responsibilities:
 *  1. Call createDMChannelRequest (backend) to ensure DM exists in Stream
 *  2. Open messaging channel via streamClient.channel("messaging", { members })
 *  3. Watch the channel (marks messages read, enables presence)
 *  4. Render: DMMessageList + DMTypingIndicator + DMMessageInput
 *
 * Key DM difference from ChannelChat (Area 2):
 *  - Channel type is "messaging" (not "team")
 *  - Members array used instead of explicit channel ID
 *  - No Thread component (DMs don't have threads in Slack)
 *  - Uses Window without Thread panel
 */

import React, { useState, useEffect, useCallback, type JSX } from "react";
import { Chat, Channel, Window } from "stream-chat-react";
import { Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { useStreamChat } from "@/context/StreamChatContext";
import { createDMChannelRequest } from "@/services/workspace-dashboard/chats";
import { typography } from "@/theme/typography";
import DMMessageList from "./DMMessageList";
import DMMessageInput from "./DMMessageInput";
import DMTypingIndicator from "./DMTypingIndicator";

// ----------------------------------------------------------------------

interface DMChatProps {
  otherUserId: number;
  otherUserFirstName: string;
  otherUserLastName: string;
}

// ----------------------------------------------------------------------

type InitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; streamChannel: any }
  | { status: "error"; message: string };

// ----------------------------------------------------------------------

const DMChat: React.FC<DMChatProps> = ({
  otherUserId,
  otherUserFirstName,
  otherUserLastName,
}): JSX.Element => {
  const { client: streamClient, isReady, streamUserId } = useStreamChat();
  const [initState, setInitState] = useState<InitState>({ status: "idle" });

  const otherUserName =
    `${otherUserFirstName} ${otherUserLastName}`.trim() || "this person";

  // ── Provision + watch DM channel ─────────────────────────────────────
  const initDM = useCallback(async () => {
    if (!isReady || !streamClient || !streamUserId) return;

    setInitState({ status: "loading" });

    try {
      // 1. Ensure DM exists on backend (idempotent)
      await createDMChannelRequest(otherUserId).catch(() => {
        // Non-fatal: channel may already exist
      });

      // 2. Open Stream messaging channel using members array
      //    Stream identifies DM channels by the sorted member list
      const ch = streamClient.channel("messaging", {
        members: [streamUserId, String(otherUserId)],
      });

      await ch.watch();

      setInitState({ status: "ready", streamChannel: ch });
    } catch (err: any) {
      console.error("DM channel init failed:", err.message);
      setInitState({
        status: "error",
        message: err.message ?? "Failed to open conversation",
      });
    }
  }, [isReady, streamClient, streamUserId, otherUserId]);

  useEffect(() => {
    initDM();
    return () => {
      if (initState.status === "ready") {
        initState.streamChannel?.stopWatching().catch(() => {});
      }
      setInitState({ status: "idle" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId, isReady]);

  // ── Loading ───────────────────────────────────────────────────────────
  if (
    !isReady ||
    initState.status === "idle" ||
    initState.status === "loading"
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        <p
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          Opening conversation…
        </p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (initState.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p
          className={clsx(
            typography.semibold14,
            "text-secondary-700 dark:text-secondary-200",
          )}
        >
          Couldn't open chat
        </p>
        <p
          className={clsx(
            typography.regular12,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {initState.message}
        </p>
        <button
          onClick={initDM}
          className="text-xs font-medium text-primary-500 hover:underline mt-1"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────
  const { streamChannel } = initState;

  return (
    <Chat client={streamClient!} theme="str-chat__theme-light">
      <Channel channel={streamChannel}>
        {/*
          Window without Thread — DMs have no thread concept.
          Window still provides the layout context Stream needs internally.
        */}
        <Window>
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Message list */}
            <DMMessageList
              otherUserId={otherUserId}
              otherUserFirstName={otherUserFirstName}
              otherUserLastName={otherUserLastName}
            />

            {/* Typing indicator */}
            <DMTypingIndicator otherUserName={otherUserName} />

            {/* Composer */}
            <DMMessageInput otherUserName={otherUserName} />
          </div>
        </Window>
        {/* No <Thread /> — DMs don't have threads */}
      </Channel>
    </Chat>
  );
};

export default DMChat;
