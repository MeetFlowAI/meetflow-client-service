/**
 * components/chat/ChannelChat.tsx
 *
 * Stream Chat layout shell — v13.
 *
 * ARCHITECTURE:
 *  Stream provides: <Chat> <Channel> <Window> <MessageList> <Thread>
 *                    ↓ invisible wrappers + state managers only
 *  We provide:      Message={SlackMessage}   — full message row UI
 *                   Input={SlackMessageInput} — full composer UI
 *
 *  Both SlackMessage and SlackMessageInput use Stream hooks internally.
 *  They receive ZERO props from us — Stream's context providers inject
 *  everything via useMessageContext / useMessageComposer etc.
 *
 * LAYOUT (matches Slack exactly):
 *
 *  ┌──────────────────────────────────┬──────────────────┐
 *  │  MessageList  (flex-1, scroll)   │  Thread panel    │
 *  │                                  │  (360px, fixed)  │
 *  ├──────────────────────────────────│                  │
 *  │  MessageInput (shrink-0, bottom) │                  │
 *  └──────────────────────────────────┴──────────────────┘
 *
 * WHY .slack-channel-chat wrapper:
 *  All CSS overrides in stream-chat-override.css are scoped under this
 *  class so they don't leak into other Stream instances (DMs etc).
 */

import React, { useState, useEffect, useCallback, type JSX } from "react";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
// Stream's structural CSS + our visual overrides are imported in
// src/index.css (global) to guarantee deterministic load order
// under Tailwind v4's Vite plugin. Do NOT re-import them here.
import { Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

import { useStreamChat } from "@/context/StreamChatContext";
import { provisionChannelInStreamRequest } from "@/services/workspace-dashboard/chats";
import type { IChannel } from "@/services/workspace-dashboard/channels";
import { typography } from "@/theme/typography";

import SlackMessage from "./SlackMessage";
import SlackMessageInput from "./SlackMessageInput";
import SlackThreadInput from "./SlackThreadInput";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChannelChatProps {
  channel: IChannel;
  workspaceId: number;
}

type InitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; streamChannel: any }
  | { status: "error"; message: string };

// ── Component ──────────────────────────────────────────────────────────────────

const ChannelChat: React.FC<ChannelChatProps> = ({
  channel,
  workspaceId,
}): JSX.Element => {
  const { client: streamClient, isReady } = useStreamChat();
  const [initState, setInitState] = useState<InitState>({ status: "idle" });

  // ── Provision + watch Stream channel ──────────────────────────────────────
  const initStreamChannel = useCallback(async () => {
    if (!isReady || !streamClient || !channel || !workspaceId) return;

    setInitState({ status: "loading" });

    try {
      // Ensure channel exists in Stream (idempotent)
      await provisionChannelInStreamRequest({
        workspace_id: workspaceId,
        channel_id: channel.id,
        channel_name: channel.name,
        channel_description: channel.description ?? undefined,
        is_private: channel.type === "private",
      }).catch(() => {
        // Non-fatal: channel may already exist
      });

      const streamChannelId = `ws${workspaceId}ch${channel.id}`;
      // v13: do NOT pass 3rd arg with `name` — not in ChannelData type
      const ch = streamClient.channel("team", streamChannelId);
      await ch.watch();

      setInitState({ status: "ready", streamChannel: ch });
    } catch (err: any) {
      console.error("Stream channel init failed:", err.message);
      setInitState({
        status: "error",
        message: err.message ?? "Failed to connect to chat",
      });
    }
  }, [isReady, streamClient, channel, workspaceId]);

  useEffect(() => {
    initStreamChannel();
    return () => {
      if (initState.status === "ready") {
        (initState as any).streamChannel?.stopWatching().catch(() => {});
      }
      setInitState({ status: "idle" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.id, workspaceId, isReady]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (
    !isReady ||
    initState.status === "idle" ||
    initState.status === "loading"
  ) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        <p
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          Connecting to chat…
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (initState.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p
          className={clsx(
            typography.semibold14,
            "text-secondary-700 dark:text-secondary-200",
          )}
        >
          Chat unavailable
        </p>
        <p className={clsx(typography.regular12, "text-secondary-400")}>
          {initState.message}
        </p>
        <button
          onClick={initStreamChannel}
          className="text-xs font-medium text-primary-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Ready ──────────────────────────────────────────────────────────────────
  const { streamChannel } = initState as {
    status: "ready";
    streamChannel: any;
  };

  return (
    /*
      .slack-channel-chat scopes all CSS overrides.
      The inner div is the true flex container — Chat/Channel are just
      context providers; their DOM output is invisible wrappers.
    */
    <div className="slack-channel-chat w-full h-full min-h-0 overflow-hidden">
      <Chat client={streamClient!} theme="str-chat__theme-light">
        <Channel
          channel={streamChannel}
          /*
            Message + Input: the only two visible things we hand to Stream.
            Stream calls Message for every row in the list + thread.
            Stream calls Input for the composer in both main + thread.
          */
          Message={SlackMessage}
          Input={(props: any) => (
            <SlackMessageInput channelName={channel.name} {...props} />
          )}
        >
          {/*
            Window: Stream's flex-row layout manager.
            When a thread is open: main panel shrinks, Thread appears on right.
            We cannot replace Window — it owns the thread open/close state.
          */}
          <Window>
            {/*
              This div is the main chat column.
              flex-col: MessageList grows (flex-1), MessageInput stays at bottom.
              We set bg here so it covers any transparent Stream wrappers.
            */}
            <div className="flex flex-col w-full h-full min-h-0 bg-white dark:bg-secondary-900">
              {/* MessageList: fills all remaining space, scrollable */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <MessageList
                  disableDateSeparator={false}
                  hideNewMessageSeparator={false}
                />
              </div>

              {/*
                MessageInput: pinned to bottom.
                px-4 pb-4 gives breathing room — SlackMessageInput itself
                is full-width inside this wrapper.
              */}
              <div className="shrink-0">
                <MessageInput />
              </div>
            </div>
          </Window>

          {/*
            Thread: Stream's built-in thread state manager.
            - Uses the same Message={SlackMessage} automatically
            - Uses SlackThreadInput as its composer (different from main Input
              because thread input has the "Also send to channel" checkbox)
            - Styled entirely via stream-chat-override.css
          */}
          <Thread
            Input={(props: any) => (
              <SlackThreadInput channelName={channel.name} {...props} />
            )}
          />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChannelChat;
