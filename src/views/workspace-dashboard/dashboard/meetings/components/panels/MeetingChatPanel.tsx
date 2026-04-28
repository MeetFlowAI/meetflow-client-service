/**
 * components/panels/MeetingChatPanel.tsx
 *
 * In-meeting ephemeral chat panel.
 *
 * Unread tracking: this component fires incrementUnreadChat via a
 * callback prop injected by MeetingRoom when it's closed and new
 * messages arrive. The parent (MeetingRoom) owns the panel open/close
 * state and calls markChatRead when it opens the panel.
 *
 * useChat API (v2.9.x):
 *   const { chatMessages, send } = useChat()
 *   chatMessages: ReceivedChatMessage[]
 *   ReceivedChatMessage.from: { identity, name, ... } | undefined
 *   ReceivedChatMessage.timestamp: number (ms epoch)
 *   ReceivedChatMessage.message: string
 *   ReceivedChatMessage.id: string
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type JSX,
  type KeyboardEvent,
} from "react";
import { useChat, useLocalParticipant } from "@livekit/components-react";
import { Send, MessageSquare } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import PanelHeader from "../shared/PanelHeader";
import {
  getParticipantColor,
  getParticipantInitials,
  getDisplayName,
} from "../../utils/participant";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MeetingChatPanelProps {
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

const MeetingChatPanel: React.FC<MeetingChatPanelProps> = ({
  onClose,
}): JSX.Element => {
  const { chatMessages, send } = useChat();
  const { localParticipant } = useLocalParticipant();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  // Auto-resize textarea as user types
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
  };

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || isSending) return;
    setIsSending(true);
    try {
      await send(msg);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (e) {
      console.error("[MeetFlow] Chat send failed:", e);
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, send]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col w-72 shrink-0 h-full",
        "bg-[#111115] border-l border-white/[0.07]",
        "animate-in slide-in-from-right-3 duration-200",
      )}
    >
      <PanelHeader
        title="Meeting Chat"
        icon={<MessageSquare className="h-4 w-4" />}
        onClose={onClose}
      />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white/15" />
            </div>
            <p className="text-white/25 text-sm leading-relaxed">
              Messages are visible to everyone in this meeting
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isMe =
            msg.from?.identity === localParticipant.identity;
          const senderName = getDisplayName(
            msg.from?.name,
            msg.from?.identity,
          );
          const color = getParticipantColor(msg.from?.identity ?? "");
          const initials = getParticipantInitials(senderName);
          const timestamp = msg.timestamp
            ? format(new Date(msg.timestamp), "h:mm a")
            : "";

          return (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-2",
                isMe ? "flex-row-reverse" : "flex-row",
              )}
            >
              {/* Avatar */}
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: color }}
                title={senderName}
                aria-label={senderName}
              >
                {initials}
              </div>

              <div
                className={clsx(
                  "flex flex-col gap-1 min-w-0 max-w-[calc(100%-44px)]",
                  isMe && "items-end",
                )}
              >
                {/* Sender + timestamp */}
                <div
                  className={clsx(
                    "flex items-baseline gap-1.5",
                    isMe && "flex-row-reverse",
                  )}
                >
                  <span className="text-[10px] font-semibold text-white/50 leading-none truncate">
                    {isMe ? "You" : senderName}
                  </span>
                  {timestamp && (
                    <span className="text-[9px] text-white/25 leading-none shrink-0">
                      {timestamp}
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={clsx(
                    "px-3 py-2 rounded-2xl text-[13px] leading-snug break-words",
                    isMe
                      ? "bg-primary-500 text-white rounded-tr-sm"
                      : "bg-white/[0.09] text-white/90 rounded-tl-sm",
                  )}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-white/[0.07]">
        <div
          className={clsx(
            "flex items-end gap-2 rounded-xl px-3 py-2",
            "bg-white/[0.06] border border-white/[0.09]",
            "focus-within:border-primary-500/50 transition-colors duration-200",
          )}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Message everyone… (Enter to send)"
            rows={1}
            aria-label="Chat message input"
            className={clsx(
              "flex-1 bg-transparent outline-none resize-none",
              "text-[13px] text-white placeholder:text-white/25",
              "leading-relaxed py-0.5",
            )}
            style={{ maxHeight: "96px", minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            aria-label="Send message"
            className={clsx(
              "h-7 w-7 flex items-center justify-center rounded-lg transition-all shrink-0 mb-0.5",
              text.trim() && !isSending
                ? "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
                : "bg-white/[0.06] text-white/25 cursor-not-allowed",
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-white/20 mt-1.5 text-center">
          Messages are not saved after the meeting ends · Shift+Enter for new
          line
        </p>
      </div>
    </div>
  );
};

export default MeetingChatPanel;
