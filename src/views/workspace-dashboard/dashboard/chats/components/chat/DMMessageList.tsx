/**
 * components/chat/DMMessageList.tsx
 *
 * Message list for DM conversations.
 *
 * Key DM-specific behaviours vs the channel MessageList (Area 2):
 *  - DMEmptyState shown at the TOP of the list (before the first message),
 *    just like Slack — not as a full-screen replacement
 *  - Read receipt tracking: identifies the last message sent by local user
 *    and determines if the other user has seen it
 *  - No thread reply counts (DMs don't have threads)
 *
 * Uses Stream Chat's useChannelStateContext.
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
  type JSX,
} from "react";
import {
  useChannelStateContext,
  MessageProvider,
} from "stream-chat-react";
import { ArrowDown } from "lucide-react";
import clsx from "clsx";
import { isSameDay } from "date-fns";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import DMMessage from "./DMMessage";
import DMEmptyState from "../empty-state/DMEmptyState";

// ----------------------------------------------------------------------

// Loading skeleton
const Skeleton = ({ wide }: { wide?: boolean }) => (
  <div className="flex gap-3 px-5 py-2 animate-pulse">
    <div className="h-9 w-9 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="flex gap-2 items-center">
        <div className="h-3 w-20 rounded bg-secondary-200 dark:bg-secondary-700" />
        <div className="h-2.5 w-10 rounded bg-secondary-100 dark:bg-secondary-800" />
      </div>
      <div
        className="h-3 rounded bg-secondary-200 dark:bg-secondary-700"
        style={{ width: wide ? "65%" : "42%" }}
      />
    </div>
  </div>
);

// ----------------------------------------------------------------------

interface DMMessageListProps {
  otherUserId: number;
  otherUserFirstName: string;
  otherUserLastName: string;
}

// ----------------------------------------------------------------------

const GROUPING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const DMMessageList: React.FC<DMMessageListProps> = ({
  otherUserId,
  otherUserFirstName,
  otherUserLastName,
}): JSX.Element => {
  const { messages, loading, read } = useChannelStateContext();
  const { user: localUser } = useContext(SessionContext);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [unreadBelow, setUnreadBelow] = useState(0);

  const otherUserName = `${otherUserFirstName} ${otherUserLastName}`.trim();

  // ── Scroll to bottom on new messages ─────────────────────────────────
  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setShowScrollPill(false);
    setUnreadBelow(0);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setUnreadBelow((p) => p + 1);
      setShowScrollPill(true);
    }
  }, [messages?.length, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const c = scrollRef.current;
    if (!c) return;
    const isAtBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 80;
    if (isAtBottom) { setShowScrollPill(false); setUnreadBelow(0); }
  }, []);

  // ── Read receipt: find last message sent by me that other user read ──
  //
  // Stream Chat's `read` map: { [userId]: { last_read: Date, user: UserResponse } }
  // We check: did the other stream user read past our last sent message?
  //
  const myStreamId = String(localUser?.id ?? "");

  // Find the last message sent by the local user
  const lastMyMessage = [...(messages ?? [])]
    .reverse()
    .find((m) => m.user?.id === myStreamId);

  // Check if other user's last_read timestamp is >= our last message's created_at
  let readByOther = false;
  if (lastMyMessage && read) {
    const otherRead = Object.entries(read).find(
      ([uid]) => uid !== myStreamId,
    );
    if (otherRead) {
      const otherLastRead = otherRead[1]?.last_read;
      const myMsgTime = lastMyMessage.created_at
        ? new Date(lastMyMessage.created_at as string).getTime()
        : 0;
      const otherReadTime = otherLastRead
        ? new Date(otherLastRead as string).getTime()
        : 0;
      readByOther = otherReadTime >= myMsgTime;
    }
  }

  // ── Message grouping ─────────────────────────────────────────────────
  const grouped = (messages ?? []).map((msg, i) => {
    const prev = i > 0 ? messages[i - 1] : null;
    const prevDate = prev?.created_at ? new Date(prev.created_at as string) : null;
    const currDate = msg.created_at ? new Date(msg.created_at as string) : new Date();
    const sameSender = prev?.user?.id === msg.user?.id;
    const withinThreshold =
      prevDate &&
      currDate.getTime() - prevDate.getTime() < GROUPING_THRESHOLD_MS;
    const sameDay = prevDate ? isSameDay(currDate, prevDate) : false;

    return {
      msg,
      isGrouped: sameSender && !!withinThreshold,
      showDateSeparator: !sameDay || i === 0,
      isLastFromMe: msg.id === lastMyMessage?.id && msg.user?.id === myStreamId,
    };
  });

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        {/* Loading skeleton */}
        {loading && (
          <div className="py-4 space-y-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} wide={i % 2 === 0} />
            ))}
          </div>
        )}

        {/* Empty state — always shown at top of conversation */}
        {!loading && (
          <DMEmptyState
            userId={otherUserId}
            firstName={otherUserFirstName}
            lastName={otherUserLastName}
          />
        )}

        {/* Messages */}
        {!loading && grouped.length > 0 && (
          <div className="pb-2">
            {grouped.map(({ msg, isGrouped, showDateSeparator, isLastFromMe }) => (
              <MessageProvider key={msg.id} value={{ message: msg } as any}>
                <DMMessage
                  isGrouped={isGrouped}
                  showDateSeparator={showDateSeparator}
                  isLastFromMe={isLastFromMe}
                  otherUserName={otherUserName}
                  readByOther={readByOther}
                />
              </MessageProvider>
            ))}
          </div>
        )}

        <div ref={bottomRef} className="h-px" />
      </div>

      {/* New messages pill */}
      {showScrollPill && (
        <button
          onClick={() => scrollToBottom(true)}
          className={clsx(
            "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-primary-500 hover:bg-primary-600 text-white",
            "text-xs font-semibold shadow-lg",
            "animate-in fade-in slide-in-from-bottom-2",
          )}
        >
          <ArrowDown className="h-3.5 w-3.5" />
          {unreadBelow > 1 ? `${unreadBelow} new messages` : "New message"}
        </button>
      )}
    </div>
  );
};

export default DMMessageList;
