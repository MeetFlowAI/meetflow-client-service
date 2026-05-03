/**
 * layout/dashboard/workspace/components/listing-panel/shared/PanelItem.tsx
 *
 * Unified list item for all listing panels.
 * Used by ChannelsPanel, ChatsPanel, and MembersPanel.
 *
 * Features:
 *  - Active state with left indicator + fill background
 *  - Unread badge support
 *  - Online presence dot support
 *  - Icon or avatar slot (left)
 *  - Title + subtitle (optional)
 *  - Right slot (meta text, badges, etc.)
 *
 * Keeping this one component means consistent Slack-like list item
 * appearance across all three panels.
 */

import React, { type JSX } from "react";
import clsx from "clsx";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface PanelItemProps {
  /** Whether this item is the currently selected/active one */
  isActive?: boolean;
  /** Left icon/avatar slot */
  icon: React.ReactNode;
  /** Primary text */
  title: string;
  /** Secondary text below the title */
  subtitle?: string;
  /** Unread count badge */
  unreadCount?: number;
  /** Show green online presence dot */
  isOnline?: boolean;
  /** Right-side metadata text */
  meta?: string;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

// ----------------------------------------------------------------------

const PanelItem: React.FC<PanelItemProps> = ({
  isActive = false,
  icon,
  title,
  subtitle,
  unreadCount,
  isOnline,
  meta,
  onClick,
  className,
}): JSX.Element => {
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={clsx(
        // Layout
        "relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mx-0",
        "text-left transition-all duration-100 group",
        // Active vs idle
        isActive
          ? [
              "bg-primary-50 dark:bg-primary-500/15",
              "text-primary-700 dark:text-primary-300",
            ]
          : [
              "text-secondary-600 dark:text-secondary-400",
              "hover:bg-secondary-100/80 dark:hover:bg-secondary-800/60",
              "hover:text-secondary-800 dark:hover:text-secondary-200",
            ],
        className,
      )}
    >
      {/* Active left edge indicator */}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary-500 dark:bg-primary-400"
        />
      )}

      {/* Icon / avatar slot */}
      <div className="relative shrink-0">{icon}</div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={clsx(
              "truncate leading-snug",
              hasUnread
                ? "text-xs font-semibold text-secondary-800 dark:text-secondary-100"
                : isActive
                  ? "text-xs font-semibold"
                  : "text-xs font-medium",
            )}
          >
            {title}
          </span>
          {/* Meta (timestamp, etc.) */}
          {meta && (
            <span className="text-[10px] text-secondary-400 dark:text-secondary-500 shrink-0 leading-none">
              {meta}
            </span>
          )}
        </div>

        {/* Subtitle row */}
        {subtitle && (
          <p
            className={clsx(
              typography.regular12,
              "truncate mt-0.5 leading-snug",
              isActive
                ? "text-primary-500/80 dark:text-primary-400/70"
                : "text-secondary-400 dark:text-secondary-500",
            )}
            style={{ fontSize: "11px" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Unread count badge */}
      {hasUnread && (
        <span
          className={clsx(
            "shrink-0 h-4 min-w-[16px] px-1 rounded-full",
            "flex items-center justify-center",
            "text-[10px] font-bold leading-none",
            "bg-primary-500 dark:bg-primary-400 text-white",
          )}
        >
          {unreadCount! > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default PanelItem;
