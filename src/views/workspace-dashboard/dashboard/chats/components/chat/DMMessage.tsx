/**
 * components/chat/DMMessage.tsx
 *
 * Single message row for DM conversations.
 *
 * Differences from channel Message (Area 2):
 *  ✗ No "Reply in thread" button — DMs don't have threads
 *  ✗ No thread reply count link
 *  ✓ Read receipt shown below the LAST message sent by local user
 *  ✓ Simplified hover bar (react + edit + delete)
 *  ✓ Same grouping / date separator / avatar pattern as channels
 *
 * Props:
 *  - isGrouped: suppress avatar/name for consecutive messages
 *  - showDateSeparator: render date divider above
 *  - isLastFromMe: true on the most recent message sent by local user
 *  - otherUserName: name of the other participant (for read receipt label)
 *  - readByOther: whether the other user has seen this message
 */

import React, { useState, type JSX } from "react";
import {
  useMessageContext,
  useChannelActionContext,
  useChannelStateContext,
  Attachment,
} from "stream-chat-react";
import { Smile, Pencil, Trash2, MoreHorizontal, Check } from "lucide-react";
import clsx from "clsx";
import { format, isToday, isYesterday } from "date-fns";

/* Local Imports */
import { typography } from "@/theme/typography";
import DMReadReceipt, { type ReceiptStatus } from "./DMReadReceipt";

// ----------------------------------------------------------------------

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
function getAvatarColor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++)
    h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}
function getInitials(name: string): string {
  const p = name.trim().split(" ");
  return p.length >= 2
    ? `${p[0][0]}${p[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}
function formatTime(d: Date): string {
  return format(d, "h:mm a");
}
function formatDateSep(d: Date): string {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

// ----------------------------------------------------------------------

interface DMMessageProps {
  isGrouped?: boolean;
  showDateSeparator?: boolean;
  /** True only on the latest message sent by the local user */
  isLastFromMe?: boolean;
  otherUserName?: string;
  readByOther?: boolean;
}

// ----------------------------------------------------------------------

const DMMessage: React.FC<DMMessageProps> = ({
  isGrouped = false,
  showDateSeparator = false,
  isLastFromMe = false,
  otherUserName = "",
  readByOther = false,
}): JSX.Element => {
  const { message, isMyMessage } = useMessageContext();
  const { deleteMessage, updateMessage } = useChannelActionContext();
  const { channel } = useChannelStateContext();

  const [hovered, setHovered] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text ?? "");
  const [deleting, setDeleting] = useState(false);

  const sender = message.user;
  const createdAt = message.created_at
    ? new Date(message.created_at as unknown as string)
    : new Date();
  const reactionGroups = message.reaction_groups ?? {};
  const reactions = message.latest_reactions ?? [];
  const isEdited = !!message.message_text_updated_at;

  // ── Receipt status for own last message ──────────────────────────────
  let receiptStatus: ReceiptStatus = "sent";
  if (isLastFromMe) {
    receiptStatus = readByOther ? "seen" : "delivered";
  }

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleReact = async (emoji: string) => {
    try {
      const myId = channel?.state?.membership?.user?.id ?? "";
      const existing = reactions.find(
        (r) => r.type === emoji && r.user_id === myId,
      );
      if (existing) {
        await channel?.deleteReaction(message.id, emoji);
      } else {
        await channel?.sendReaction(message.id, { type: emoji });
      }
    } catch {
      /* silent */
    }
    setShowEmojiBar(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMessage(message);
    } catch {
      /* silent */
    }
    setDeleting(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === message.text) {
      setIsEditing(false);
      return;
    }
    try {
      await updateMessage({ ...message, text: editText });
    } catch {
      /* silent */
    }
    setIsEditing(false);
  };

  const avatarColor = getAvatarColor(sender?.id ?? "");
  const initials = getInitials(sender?.name ?? sender?.id ?? "?");
  const displayName = sender?.name ?? sender?.id ?? "Unknown";

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Date separator */}
      {showDateSeparator && (
        <div className="flex items-center gap-3 px-5 py-3 select-none">
          <div className="flex-1 h-px bg-secondary-200 dark:bg-secondary-800" />
          <span
            className={clsx(
              "shrink-0 px-3 py-0.5 rounded-full text-[11px] font-semibold",
              "text-secondary-500 dark:text-secondary-400",
              "border border-secondary-200 dark:border-secondary-700",
              "bg-white dark:bg-secondary-900",
            )}
          >
            {formatDateSep(createdAt)}
          </span>
          <div className="flex-1 h-px bg-secondary-200 dark:bg-secondary-800" />
        </div>
      )}

      {/* Message row */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setShowEmojiBar(false);
        }}
        className={clsx(
          "relative flex gap-3 px-5 group",
          isGrouped ? "py-0.5" : "pt-3 pb-0.5",
          hovered
            ? "bg-secondary-50 dark:bg-secondary-800/50"
            : "bg-transparent",
          "transition-colors duration-75",
        )}
      >
        {/* Avatar / timestamp spacer */}
        <div className="w-9 shrink-0 flex items-start pt-0.5">
          {!isGrouped ? (
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          ) : (
            <span
              className={clsx(
                "text-[10px] text-secondary-400 dark:text-secondary-600",
                "leading-none mt-1 w-full text-right transition-opacity",
                hovered ? "opacity-100" : "opacity-0",
              )}
            >
              {formatTime(createdAt)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Sender + time (first in group only) */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className={clsx(
                  typography.semibold14,
                  "text-secondary-900 dark:text-white leading-snug",
                )}
              >
                {displayName}
              </span>
              <span className="text-[11px] text-secondary-400 dark:text-secondary-500 leading-none">
                {formatTime(createdAt)}
              </span>
              {isEdited && (
                <span className="text-[10px] text-secondary-400 italic">
                  (edited)
                </span>
              )}
            </div>
          )}

          {/* Body */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                rows={3}
                className={clsx(
                  "w-full px-3 py-2 rounded-lg resize-none outline-none text-sm",
                  "text-secondary-800 dark:text-secondary-100",
                  "bg-white dark:bg-secondary-800",
                  "border border-primary-400 dark:border-primary-500",
                  "focus:ring-2 focus:ring-primary-400/30",
                )}
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600"
                >
                  <Check className="h-3 w-3" /> Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text ?? "");
                  }}
                  className="text-xs text-secondary-400 hover:text-secondary-600"
                >
                  Cancel (Esc)
                </button>
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                "text-[14.5px] leading-[1.55] whitespace-pre-wrap break-words",
                message.deleted_at
                  ? "italic text-secondary-400 dark:text-secondary-500"
                  : "text-secondary-800 dark:text-secondary-100",
              )}
            >
              {message.deleted_at ? "This message was deleted." : message.text}
            </div>
          )}

          {/* Attachments */}
          {!message.deleted_at && (message.attachments ?? []).length > 0 && (
            <div className="mt-2">
              <Attachment attachments={message.attachments ?? []} />
            </div>
          )}

          {/* Reaction pills */}
          {!message.deleted_at && Object.keys(reactionGroups).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(reactionGroups).map(([type, group]) => {
                const myId = channel?.state?.membership?.user?.id ?? "";
                const iReacted = reactions.some(
                  (r) => r.type === type && r.user_id === myId,
                );
                return (
                  <button
                    key={type}
                    onClick={() => handleReact(type)}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all",
                      iReacted
                        ? "bg-primary-50 dark:bg-primary-500/15 border-primary-300 dark:border-primary-500/40 text-primary-700 dark:text-primary-300"
                        : "bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400",
                    )}
                  >
                    <span>{type}</span>
                    <span className="font-medium">{(group as any).count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Read receipt — only on last message sent by me */}
          {isMyMessage() && isLastFromMe && !message.deleted_at && (
            <DMReadReceipt
              status={receiptStatus}
              seenByName={readByOther ? otherUserName : undefined}
              compact={false}
            />
          )}
        </div>

        {/* Hover action bar — no thread button for DMs */}
        {!message.deleted_at && (
          <div
            className={clsx(
              "absolute right-4 top-1 z-10",
              "flex items-center gap-0.5 p-0.5 rounded-lg",
              "bg-white dark:bg-secondary-800",
              "border border-secondary-200 dark:border-secondary-700 shadow-sm",
              "transition-all duration-100",
              hovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 pointer-events-none translate-y-0.5",
            )}
          >
            {/* Emoji react */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiBar((v) => !v)}
                title="Add reaction"
                className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                <Smile className="h-4 w-4" />
              </button>
              {showEmojiBar && (
                <div className="absolute bottom-full right-0 mb-1 flex items-center gap-0.5 p-1 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 shadow-md">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="h-7 w-7 flex items-center justify-center text-base rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit (own only) */}
            {isMyMessage() && (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit"
                className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {/* Delete (own only) */}
            {isMyMessage() && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
                className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* More */}
            <button
              title="More"
              className="h-7 w-7 flex items-center justify-center rounded-md text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DMMessage;
