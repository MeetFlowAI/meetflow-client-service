/**
 * MeetingChatPanel.tsx  (v3 — premium redesign, CSS token theming)
 */

import React, { useState, useEffect, useRef, useCallback, type JSX, type KeyboardEvent } from "react";
import { useChat, useLocalParticipant } from "@livekit/components-react";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import PanelHeader from "../shared/PanelHeader";
import { getParticipantColor, getParticipantInitials, getDisplayName } from "../../utils/participant";

const MeetingChatPanel: React.FC<{ onClose: () => void }> = ({ onClose }): JSX.Element => {
  const { chatMessages, send } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

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
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch { /* silent */ }
    finally { setIsSending(false); }
  }, [text, isSending, send]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div
      data-panel
      className="flex flex-col w-72 shrink-0 h-full animate-in slide-in-from-right-3 duration-200"
      style={{
        background: "var(--mf-panel-bg, var(--mf-bg-raised))",
        borderLeft: "1px solid var(--mf-panel-border, var(--mf-border))",
      }}
    >
      <PanelHeader title="Chat" icon={<MessageSquare className="h-4 w-4" />} onClose={onClose} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--mf-bg-elevated)" }}
            >
              <MessageSquare className="h-5 w-5" style={{ color: "var(--mf-text-muted)" }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--mf-text-muted)" }}>
              Messages only visible to meeting participants
            </p>
          </div>
        )}

        {chatMessages.map(msg => {
          const isMe = msg.from?.identity === localParticipant.identity;
          const senderName = getDisplayName(msg.from?.name, msg.from?.identity);
          const color = getParticipantColor(msg.from?.identity ?? "");
          const initials = getParticipantInitials(senderName);
          const ts = msg.timestamp ? format(new Date(msg.timestamp), "h:mm a") : "";

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: color }}
                title={senderName}
              >
                {initials}
              </div>

              <div className={`flex flex-col gap-1 min-w-0 max-w-[calc(100%-44px)] ${isMe ? "items-end" : ""}`}>
                <div className={`flex items-baseline gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] font-semibold truncate" style={{ color: "var(--mf-text-muted)" }}>
                    {isMe ? "You" : senderName}
                  </span>
                  {ts && <span className="text-[9px] shrink-0" style={{ color: "var(--mf-text-disabled)" }}>{ts}</span>}
                </div>

                <div
                  className="px-3 py-2 text-[13px] leading-snug break-words"
                  style={{
                    background: isMe ? "var(--mf-accent)" : "var(--mf-bg-elevated)",
                    color: isMe ? "#fff" : "var(--mf-text-primary)",
                    borderRadius: isMe ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    boxShadow: isMe ? "var(--mf-shadow-accent)" : "none",
                  }}
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
      <div
        className="shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: "1px solid var(--mf-border)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all duration-150"
          style={{
            background: "var(--mf-bg-elevated)",
            border: "1px solid var(--mf-border-medium)",
          }}
          onFocus={() => {}}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Message everyone… (Enter to send)"
            rows={1}
            aria-label="Chat message"
            className="flex-1 bg-transparent outline-none resize-none leading-relaxed py-0.5 text-[13px] placeholder:text-[var(--mf-text-disabled)]"
            style={{ color: "var(--mf-text-primary)", maxHeight: "96px", minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            aria-label="Send message"
            className="h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-150 shrink-0 mb-0.5"
            style={{
              background: text.trim() && !isSending ? "var(--mf-accent)" : "var(--mf-bg-surface)",
              color: text.trim() && !isSending ? "#fff" : "var(--mf-text-disabled)",
              cursor: text.trim() && !isSending ? "pointer" : "not-allowed",
            }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-center mt-1.5" style={{ color: "var(--mf-text-disabled)" }}>
          Shift+Enter for new line · messages not saved after meeting
        </p>
      </div>
    </div>
  );
};

export default MeetingChatPanel;
