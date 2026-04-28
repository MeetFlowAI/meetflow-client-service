/**
 * components/chat/SlackMessage.tsx
 *
 * Slack-faithful message row for stream-chat-react v13.
 *
 * STREAM V13 CONTRACT:
 *  - Passed as Message={SlackMessage} to <Channel>
 *  - Stream's MessageList wraps each message in its own <MessageProvider>
 *    BEFORE calling this component — so all hooks work correctly here.
 *  - We accept ZERO props — everything comes from Stream hooks.
 *
 * HOOKS USED:
 *  - useMessageContext()       → message, isMyMessage(), groupedByUser
 *  - useChannelActionContext() → openThread, deleteMessage, updateMessage
 *  - useChannelStateContext()  → channel (for reactions, current user id)
 *
 * FEATURES:
 *  ✓ Message grouping (avatar only on first in group, Slack compact style)
 *  ✓ Hover-reveal action bar (react / thread / edit / delete / more)
 *  ✓ Quick emoji picker (6 quick emojis)
 *  ✓ Reaction pills with toggle + count
 *  ✓ Thread reply count link
 *  ✓ Inline edit mode (Enter to save, Esc to cancel)
 *  ✓ Deleted message placeholder
 *  ✓ Edited message indicator
 *  ✓ Attachment rendering via Stream's <Attachment>
 *  ✓ Dark mode throughout
 */

import { useState, useRef, useEffect, type JSX } from "react";
import {
  useMessageContext,
  useChannelActionContext,
  useChannelStateContext,
  Attachment,
} from "stream-chat-react";
import {
  Smile,
  MessageSquare,
  Pencil,
  Trash2,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";
import clsx from "clsx";
import { format, isToday, isYesterday } from "date-fns";
import { typography } from "@/theme/typography";

// ── Constants ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#7C3AED",
  "#059669",
  "#2563EB",
  "#DB2777",
  "#D97706",
  "#0891B2",
  "#E11D48",
  "#4F46E5",
];

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvatarColor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++)
    h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length >= 2)
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  return (name || "?").slice(0, 2).toUpperCase();
}

function formatMessageTime(d: Date): string {
  return format(d, "h:mm a");
}

function formatDateLabel(d: Date): string {
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy h:mm a");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Small action button in the hover toolbar */
const ActionBtn = ({
  onClick,
  title,
  danger = false,
  disabled = false,
  children,
}: {
  onClick?: () => void;
  title: string;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    type="button"
    className={clsx(
      "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
      danger
        ? "text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        : "text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700",
      "disabled:opacity-40 disabled:cursor-not-allowed",
    )}
  >
    {children}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const SlackMessage = (): JSX.Element => {
  const {
    message,
    isMyMessage,
    groupedByUser, // true = same sender, short time gap → compact row
  } = useMessageContext();

  const { openThread, deleteMessage, updateMessage } =
    useChannelActionContext();
  const { channel } = useChannelStateContext();

  // ── Local state ──────────────────────────────────────────────────────────
  const [hovered, setHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const sender = message.user;
  const displayName = sender?.name || sender?.id || "Unknown";
  const createdAt = message.created_at
    ? new Date(message.created_at)
    : new Date();
  const reactionGroups = message.reaction_groups ?? {};
  const reactions = message.latest_reactions ?? [];
  const threadCount = message.reply_count ?? 0;
  const isEdited = !!message.message_text_updated_at;
  const isDeleted = !!message.deleted_at;
  const isGrouped = !!groupedByUser;

  const avatarColor = getAvatarColor(sender?.id ?? "x");
  const initials = getInitials(displayName);

  // Current user id — needed for reaction toggle detection
  const myUserId = (): string => {
    try {
      return channel?.getClient()?.user?.id ?? "";
    } catch {
      return "";
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing]);

  // Auto-grow edit textarea
  useEffect(() => {
    if (!isEditing || !editRef.current) return;
    const ta = editRef.current;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [editText, isEditing]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleReact = async (emoji: string) => {
    if (!channel) return;
    setShowEmojiPicker(false);
    try {
      const alreadyReacted = reactions.some(
        (r) => r.type === emoji && r.user_id === myUserId(),
      );
      if (alreadyReacted) {
        await channel.deleteReaction(message.id, emoji);
      } else {
        await channel.sendReaction(message.id, { type: emoji });
      }
    } catch (e) {
      console.error("Reaction failed", e);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteMessage(message);
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditText(message.text ?? "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.text ?? "");
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.text) {
      handleCancelEdit();
      return;
    }
    setSaving(true);
    try {
      await updateMessage({ ...message, text: trimmed });
      setIsEditing(false);
    } catch (e) {
      console.error("Edit failed", e);
    } finally {
      setSaving(false);
    }
  };

  const handleThread = () => {
    if (openThread) openThread(message);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowEmojiPicker(false);
      }}
      className={clsx(
        "relative flex gap-3 px-5 group w-full",
        // Slack spacing: first message in a group gets more top gap
        isGrouped ? "py-[1px]" : "pt-[14px] pb-[1px]",
        hovered ? "bg-secondary-50 dark:bg-white/[0.02]" : "bg-transparent",
        "transition-colors duration-75",
      )}
    >
      {/* ── LEFT COLUMN: avatar (first) or hover-time (grouped) ──────── */}
      <div className="w-10 shrink-0 flex items-start">
        {!isGrouped ? (
          // Avatar — shown only on first message of a group
          sender?.image ? (
            <img
              src={sender.image}
              alt={displayName}
              className="h-9 w-9 rounded-lg object-cover mt-0.5 select-none"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold select-none mt-0.5 shrink-0"
              style={{ backgroundColor: avatarColor }}
              title={displayName}
            >
              {initials}
            </div>
          )
        ) : (
          // Hover-only compact timestamp for grouped rows (exact Slack pattern)
          <span
            className={clsx(
              "text-[10px] text-secondary-400 dark:text-secondary-600",
              "w-full text-right tabular-nums leading-none pt-[3px]",
              "transition-opacity duration-100",
              hovered ? "opacity-100" : "opacity-0",
            )}
          >
            {formatMessageTime(createdAt)}
          </span>
        )}
      </div>

      {/* ── RIGHT COLUMN: header + body ──────────────────────────────── */}
      <div className="flex-1 min-w-0 pb-[2px]">
        {/* Header: only on first message in a group */}
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-[3px] flex-wrap">
            <span
              className={clsx(
                typography.semibold14,
                "text-secondary-900 dark:text-white cursor-pointer hover:underline",
              )}
            >
              {displayName}
            </span>
            <time
              title={formatDateLabel(createdAt)}
              className="text-[11px] text-secondary-400 dark:text-secondary-500 tabular-nums leading-none cursor-default"
            >
              {formatMessageTime(createdAt)}
            </time>
            {isEdited && (
              <span className="text-[11px] text-secondary-400 italic leading-none">
                (edited)
              </span>
            )}
          </div>
        )}

        {/* ── Message body ─────────────────────────────────────────── */}
        {isDeleted ? (
          <p className="text-[13px] italic text-secondary-400 dark:text-secondary-500 py-0.5">
            This message was deleted.
          </p>
        ) : isEditing ? (
          /* ── Inline edit mode ─────────────────────────────────── */
          <div className="mt-0.5 mb-1">
            <div
              className={clsx(
                "rounded-lg border transition-all",
                "bg-white dark:bg-secondary-800",
                "border-primary-400/60 dark:border-primary-500/40",
                "shadow-[0_0_0_3px] shadow-primary-400/10",
              )}
            >
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") handleCancelEdit();
                }}
                rows={2}
                className={clsx(
                  "w-full px-3 pt-2 pb-1 bg-transparent outline-none resize-none",
                  "text-[14px] leading-[1.5] text-secondary-800 dark:text-secondary-100",
                  "placeholder:text-secondary-400",
                )}
                style={{ minHeight: 56 }}
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <p className="text-[11px] text-secondary-400">
                  <kbd className="font-medium">Esc</kbd> to cancel ·{" "}
                  <kbd className="font-medium">Enter</kbd> to save
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCancelEdit}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || !editText.trim()}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Normal message text ─────────────────────────────── */
          <div
            className={clsx(
              "text-[14px] leading-[1.55] whitespace-pre-wrap break-words",
              "text-secondary-800 dark:text-secondary-100",
            )}
          >
            {message.text}
          </div>
        )}

        {/* ── Attachments ──────────────────────────────────────────── */}
        {!isDeleted && (message.attachments ?? []).length > 0 && (
          <div className="mt-2">
            <Attachment attachments={message.attachments ?? []} />
          </div>
        )}

        {/* ── Reaction pills ───────────────────────────────────────── */}
        {!isDeleted && Object.keys(reactionGroups).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(reactionGroups).map(([type, group]) => {
              const iReacted = reactions.some(
                (r) => r.type === type && r.user_id === myUserId(),
              );
              const count = (group as any).count ?? 0;
              return (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  title={`${count} ${count === 1 ? "reaction" : "reactions"}`}
                  type="button"
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                    "border transition-all duration-100",
                    iReacted
                      ? "bg-primary-50 dark:bg-primary-500/15 border-primary-300 dark:border-primary-500/40 text-primary-700 dark:text-primary-300"
                      : "bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-secondary-300 dark:hover:border-secondary-500",
                  )}
                >
                  <span>{type}</span>
                  <span className="font-semibold">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Thread reply count button ─────────────────────────────── */}
        {!isDeleted && threadCount > 0 && (
          <button
            onClick={handleThread}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 mt-1.5 py-0.5 px-1 -ml-1 rounded",
              "text-[12px] font-semibold text-primary-500 dark:text-primary-400",
              "hover:bg-primary-50 dark:hover:bg-primary-500/10",
              "transition-colors",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {threadCount} {threadCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* ── HOVER ACTION BAR ─────────────────────────────────────────── */}
      {!isDeleted && !isEditing && (
        <div
          className={clsx(
            "absolute right-4 -top-[18px] z-20",
            "flex items-center gap-0.5 p-0.5 rounded-lg",
            "bg-white dark:bg-secondary-800",
            "border border-secondary-200 dark:border-secondary-700",
            "shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
            "transition-all duration-100",
            hovered
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none translate-y-0.5",
          )}
        >
          {/* Emoji reaction */}
          <div className="relative" ref={emojiRef}>
            <ActionBtn
              onClick={() => setShowEmojiPicker((v) => !v)}
              title="Add reaction"
            >
              <Smile className="h-4 w-4" />
            </ActionBtn>

            {/* Quick emoji flyout */}
            {showEmojiPicker && (
              <div
                className={clsx(
                  "absolute bottom-full right-0 mb-1.5 z-30",
                  "flex items-center gap-0.5 p-1.5 rounded-xl",
                  "bg-white dark:bg-secondary-800",
                  "border border-secondary-200 dark:border-secondary-700",
                  "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
                )}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    type="button"
                    className="h-8 w-8 flex items-center justify-center text-[16px] rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply in thread */}
          <ActionBtn onClick={handleThread} title="Reply in thread">
            <MessageSquare className="h-4 w-4" />
          </ActionBtn>

          {/* Edit — own messages only */}
          {isMyMessage() && (
            <ActionBtn onClick={handleStartEdit} title="Edit message">
              <Pencil className="h-4 w-4" />
            </ActionBtn>
          )}

          {/* Delete — own messages only */}
          {isMyMessage() && (
            <ActionBtn
              onClick={handleDelete}
              title="Delete message"
              danger
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </ActionBtn>
          )}

          {/* More actions */}
          <ActionBtn title="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </ActionBtn>
        </div>
      )}
    </div>
  );
};

export default SlackMessage;
