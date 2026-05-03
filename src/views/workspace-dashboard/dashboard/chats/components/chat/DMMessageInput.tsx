/**
 * components/chat/DMMessageInput.tsx
 *
 * Message composer for DM conversations.
 * Same patterns as Area 2's MessageInput — auto-grow textarea,
 * Enter-to-send, Shift+Enter for newline, Cmd+B/I/E formatting,
 * emoji picker, file attach, typing indicator.
 *
 * DM-specific differences:
 *  - Placeholder says "Message [Name]" not "Message #channel"
 *  - No slash commands or mention dropdown (DM-specific UX simplification)
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  type JSX,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import {
  useMessageInputContext,
  useChannelStateContext,
} from "stream-chat-react";
import { Smile, Paperclip, Send, Bold, Italic, Code, X } from "lucide-react";
import clsx from "clsx";

// ----------------------------------------------------------------------

interface DMMessageInputProps {
  otherUserName: string;
  disabled?: boolean;
}

// ----------------------------------------------------------------------

const DMMessageInput: React.FC<DMMessageInputProps> = ({
  otherUserName,
  disabled = false,
}): JSX.Element => {
  const {
    text,
    setText,
    handleSubmit,
    handleChange,
    openEmojiPicker,
    uploadNewFiles,
    attachments,
    removeAttachments,
    quotedMessage,
    setQuotedMessage,
    cooldownRemaining,
  } = useMessageInputContext();

  const { channel } = useChannelStateContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 22 * 6;
    ta.style.height = `${Math.min(ta.scrollHeight, max)}px`;
    ta.style.overflowY = ta.scrollHeight > max ? "auto" : "hidden";
  }, [text]);

  // Typing indicator
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      handleChange(e);
      channel?.keystroke().catch(() => {});
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(
        () => channel?.stopTyping().catch(() => {}),
        3000,
      );
    },
    [handleChange, channel],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text?.trim() || attachments?.length) handleSubmit(e as any);
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: end } = ta;
      const sel = text?.slice(s, end) ?? "";
      let wrapped: string | null = null;
      if (e.key === "b") { e.preventDefault(); wrapped = `**${sel}**`; }
      if (e.key === "i") { e.preventDefault(); wrapped = `_${sel}_`; }
      if (e.key === "e") { e.preventDefault(); wrapped = `\`${sel}\``; }
      if (wrapped !== null) {
        const pre = e.key === "b" ? "**" : e.key === "i" ? "_" : "`";
        setText((text?.slice(0, s) ?? "") + wrapped + (text?.slice(end) ?? ""));
        setTimeout(() => ta.setSelectionRange(s + pre.length, end + pre.length), 0);
      }
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) uploadNewFiles(files);
    e.target.value = "";
  };

  const canSend = !!(text?.trim()) || !!(attachments?.length);
  const hasCooldown = (cooldownRemaining ?? 0) > 0;

  return (
    <div className="shrink-0 px-4 pb-4 pt-2 bg-white dark:bg-secondary-900">
      {/* Quoted reply preview */}
      {quotedMessage && (
        <div className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-secondary-600 dark:text-secondary-300 mb-0.5">
              Replying to{" "}
              <span className="text-primary-500">{quotedMessage.user?.name}</span>
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
              {quotedMessage.text}
            </p>
          </div>
          <button
            onClick={() => setQuotedMessage(undefined)}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachment previews */}
      {!!attachments?.length && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <div
              key={att.asset_url ?? att.title}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-xs text-secondary-600 dark:text-secondary-300"
            >
              <span className="max-w-[120px] truncate">{att.title ?? "file"}</span>
              <button
                onClick={() => removeAttachments([att.asset_url ?? att.title ?? ""])}
                className="text-secondary-400 hover:text-secondary-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input box */}
      <div
        className={clsx(
          "flex flex-col rounded-xl border transition-all duration-200",
          "bg-white dark:bg-secondary-800",
          disabled || hasCooldown
            ? "border-secondary-200 dark:border-secondary-700 opacity-60"
            : "border-secondary-200 dark:border-secondary-700 focus-within:border-primary-400/60 dark:focus-within:border-primary-500/40 focus-within:shadow-[0_0_0_3px] focus-within:shadow-primary-400/10",
        )}
      >
        {/* Format toolbar */}
        <div className="flex items-center gap-0.5 px-3 pt-2.5 pb-1">
          {[Bold, Italic, Code].map((Icon, i) => (
            <button
              key={i}
              disabled={disabled}
              className="h-6 w-6 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text ?? ""}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || hasCooldown}
          placeholder={
            hasCooldown
              ? `Slow mode: ${cooldownRemaining}s…`
              : `Message ${otherUserName}`
          }
          rows={1}
          className={clsx(
            "w-full px-4 py-2 bg-transparent outline-none resize-none",
            "text-[14px] leading-[1.5] text-secondary-800 dark:text-secondary-100",
            "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
            "disabled:cursor-not-allowed",
          )}
          style={{ minHeight: "38px" }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-0.5">
            <button
              onClick={openEmojiPicker}
              disabled={disabled}
              title="Emoji"
              className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              title="Attach file"
              className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* Send */}
          <button
            onClick={(e) => canSend && handleSubmit(e as any)}
            disabled={!canSend || disabled || hasCooldown}
            title="Send (Enter)"
            className={clsx(
              "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
              canSend && !disabled && !hasCooldown
                ? "bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
                : "bg-secondary-100 dark:bg-secondary-700 text-secondary-300 dark:text-secondary-600 cursor-not-allowed",
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DMMessageInput;
