/**
 * components/chat/SlackMessageInput.tsx
 *
 * Slack-style message composer for the MAIN CHANNEL (not thread).
 * Passed as Input={...} on <Channel> or <MessageInput>.
 *
 * V13 HOOK CONTRACT:
 *  - useMessageComposer()        → textComposer + attachmentManager
 *  - useStateStore(state, sel)   → reactive text subscription
 *  - useMessageInputContext()    → handleSubmit, cooldownRemaining
 *
 * FEATURES:
 *  ✓ Auto-growing textarea (1–6 lines)
 *  ✓ Format toolbar: Bold / Italic / Code
 *  ✓ Keyboard: Enter sends, Shift+Enter newline, ⌘B/I/E wraps selection
 *  ✓ File attachment via hidden <input type="file">
 *  ✓ Slow-mode cooldown display
 *  ✓ Dark mode
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
  useMessageComposer,
  useStateStore,
} from "stream-chat-react";
import type { TextComposerState } from "stream-chat";
import { Smile, Paperclip, Send, Bold, Italic, Code } from "lucide-react";
import clsx from "clsx";

// ── Reactive selector — only re-render when text changes ──────────────────────
const textSelector = (state: TextComposerState) => ({ text: state.text });

// ── Types ──────────────────────────────────────────────────────────────────────
interface SlackMessageInputProps {
  channelName: string;
  disabled?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────
const SlackMessageInput: React.FC<SlackMessageInputProps> = ({
  channelName,
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
    const maxH = 22 * 6; // 6 lines max
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
    // Enter sends; Shift+Enter = newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text?.trim()) handleSubmit();
      return;
    }

    // ⌘B = bold, ⌘I = italic, ⌘E = code
    if ((e.metaKey || e.ctrlKey) && ["b", "i", "e"].includes(e.key)) {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart;
      const end = ta.selectionEnd;
      const wrap = e.key === "b" ? "**" : e.key === "i" ? "_" : "`";
      const selected = text.slice(s, end);
      textComposer.setText(
        text.slice(0, s) + wrap + selected + wrap + text.slice(end),
      );
      // Restore cursor inside wrapping chars
      setTimeout(() => {
        ta.setSelectionRange(s + wrap.length, end + wrap.length);
      }, 0);
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
    <div className="px-4 pb-4 pt-1 bg-white dark:bg-secondary-900">
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
        {/* ── Format toolbar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-3 pt-2.5 pb-0.5">
          {[
            { Icon: Bold, title: "Bold (⌘B)" },
            { Icon: Italic, title: "Italic (⌘I)" },
            { Icon: Code, title: "Inline code (⌘E)" },
          ].map(({ Icon, title }) => (
            <button
              key={title}
              title={title}
              disabled={disabled}
              type="button"
              className="h-6 w-6 flex items-center justify-center rounded text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* ── Textarea ────────────────────────────────────────────────── */}
        <textarea
          ref={textareaRef}
          value={text ?? ""}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || hasCooldown}
          placeholder={
            hasCooldown
              ? `Slow mode: ${cooldownRemaining}s remaining…`
              : `Message #${channelName}`
          }
          rows={1}
          className={clsx(
            "w-full px-4 py-2 bg-transparent outline-none resize-none",
            "text-[14px] leading-[1.5] text-secondary-800 dark:text-secondary-100",
            "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
            "disabled:cursor-not-allowed",
          )}
          style={{ minHeight: 38 }}
        />

        {/* ── Bottom toolbar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={disabled}
              title="Emoji"
              className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={disabled}
              title="Attach file"
              onClick={() => fileRef.current?.click()}
              className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={() => canSend && handleSubmit()}
            disabled={!canSend}
            title="Send message (Enter)"
            className={clsx(
              "h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-150",
              canSend
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

export default SlackMessageInput;
