/**
 * components/chat/SlackThreadInput.tsx
 *
 * Slack-style composer for the THREAD PANEL.
 *
 * Why a separate component from SlackMessageInput:
 *  - Thread input needs "Also send as direct message" / "Also send to #channel"
 *    checkbox — exactly like Slack's thread reply composer
 *  - Thread input has smaller padding (fits in 360px panel)
 *  - Thread placeholder text differs ("Reply to thread…")
 *
 * Same v13 hook contract as SlackMessageInput.
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  type JSX,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  useMessageInputContext,
  useMessageComposer,
  useStateStore,
} from "stream-chat-react";
import type { TextComposerState } from "stream-chat";
import { Send, Paperclip, Smile } from "lucide-react";
import clsx from "clsx";

// ── Reactive selector ─────────────────────────────────────────────────────────
const textSelector = (state: TextComposerState) => ({ text: state.text });

// ── Types ──────────────────────────────────────────────────────────────────────
interface SlackThreadInputProps {
  channelName?: string;
  disabled?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────
const SlackThreadInput: React.FC<SlackThreadInputProps> = ({
  channelName = "channel",
  disabled = false,
}): JSX.Element => {
  const messageComposer = useMessageComposer();
  const { textComposer } = messageComposer;
  const { text } = useStateStore(textComposer.state, textSelector);
  const { handleSubmit, cooldownRemaining } = useMessageInputContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Auto-grow textarea ──────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxH = 22 * 5;
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    ta.style.overflowY = ta.scrollHeight > maxH ? "auto" : "hidden";
  }, [text]);

  // ── Text change ──────────────────────────────────────────────────────────
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      textComposer.handleChange({
        text: e.target.value,
        selection: {
          start: e.target.selectionStart ?? 0,
          end: e.target.selectionEnd ?? 0,
        },
      });
    },
    [textComposer],
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text?.trim()) handleSubmit();
    }
  };

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      await messageComposer.attachmentManager.uploadFiles(files);
      e.target.value = "";
    },
    [messageComposer],
  );

  const hasCooldown = (cooldownRemaining ?? 0) > 0;
  const canSend = !!text?.trim() && !disabled && !hasCooldown;

  return (
    <div className="px-3 pb-3 pt-2 bg-white dark:bg-secondary-900 border-t border-secondary-100 dark:border-secondary-800">
      {/* Input box */}
      <div
        className={clsx(
          "flex flex-col rounded-xl border transition-all duration-150",
          "bg-white dark:bg-secondary-800",
          disabled || hasCooldown
            ? "border-secondary-200 dark:border-secondary-700 opacity-60"
            : [
                "border-secondary-200 dark:border-secondary-700",
                "focus-within:border-primary-400/70 dark:focus-within:border-primary-500/50",
                "focus-within:shadow-[0_0_0_3px] focus-within:shadow-primary-400/10",
              ],
        )}
      >
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
              : "Reply to thread…"
          }
          rows={1}
          className={clsx(
            "w-full px-3 pt-2.5 pb-1.5 bg-transparent outline-none resize-none",
            "text-[13px] leading-[1.5] text-secondary-800 dark:text-secondary-100",
            "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
            "disabled:cursor-not-allowed",
          )}
          style={{ minHeight: 36 }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={disabled}
              title="Emoji"
              className="h-6 w-6 flex items-center justify-center rounded text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              title="Attach file"
              onClick={() => fileRef.current?.click()}
              className="h-6 w-6 flex items-center justify-center rounded text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="button"
            onClick={() => canSend && handleSubmit()}
            disabled={!canSend}
            title="Send reply (Enter)"
            className={clsx(
              "h-6 w-6 flex items-center justify-center rounded-lg transition-all duration-150",
              canSend
                ? "bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
                : "bg-secondary-100 dark:bg-secondary-700 text-secondary-300 dark:text-secondary-600 cursor-not-allowed",
            )}
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* "Also send to #channel" — matches Slack's thread composer exactly */}
      <label className="flex items-center gap-2 mt-2 cursor-pointer group">
        <input
          type="checkbox"
          className={clsx(
            "h-3.5 w-3.5 rounded border-secondary-300 dark:border-secondary-600",
            "text-primary-500 focus:ring-primary-400 focus:ring-offset-0",
            "cursor-pointer",
          )}
        />
        <span className="text-[11px] text-secondary-400 dark:text-secondary-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
          Also send to{" "}
          <span className="font-semibold text-secondary-600 dark:text-secondary-300">
            #{channelName}
          </span>
        </span>
      </label>
    </div>
  );
};

export default SlackThreadInput;
