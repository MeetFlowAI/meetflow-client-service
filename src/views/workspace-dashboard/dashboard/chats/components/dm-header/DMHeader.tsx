/**
 * components/dm-header/DMHeader.tsx
 *
 * Header bar for a 1-to-1 DM conversation.
 *
 * Shows:
 *  - Avatar with online presence dot
 *  - Full name
 *  - "Active" / "Offline" status label
 *  - Email (sub-text)
 *
 * Uses Stream Chat's useChannelStateContext to get live watchers
 * (presence) — if the other user is watching the channel they're "active".
 *
 * Intentionally presentation-focused. No data fetching.
 */

import React, { type JSX } from "react";
import clsx from "clsx";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

// Deterministic avatar color
const AVATAR_PALETTE = [
  "#7C3AED", "#059669", "#2563EB", "#DB2777",
  "#D97706", "#0891B2", "#E11D48", "#4F46E5",
  "#7C3AED", "#059669",
];
function getAvatarColor(id: number): string {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

// ----------------------------------------------------------------------

interface DMHeaderProps {
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  isOnline: boolean;
}

// ----------------------------------------------------------------------

const DMHeader: React.FC<DMHeaderProps> = ({
  userId,
  firstName,
  lastName,
  email,
  isOnline,
}): JSX.Element => {
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown User";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const avatarColor = getAvatarColor(userId);

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-5 py-3 shrink-0",
        "bg-white dark:bg-secondary-900",
        "border-b border-secondary-200 dark:border-secondary-800",
      )}
    >
      {/* Avatar with presence dot */}
      <div className="relative shrink-0">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        {/* Presence dot */}
        <span
          className={clsx(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full",
            "border-2 border-white dark:border-secondary-900",
            isOnline ? "bg-emerald-400" : "bg-secondary-300 dark:bg-secondary-600",
          )}
        />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            typography.semibold14,
            "text-secondary-900 dark:text-white truncate leading-snug",
          )}
        >
          {fullName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={clsx(
              "h-1.5 w-1.5 rounded-full shrink-0",
              isOnline ? "bg-emerald-400" : "bg-secondary-300 dark:bg-secondary-600",
            )}
          />
          <p
            className={clsx(
              typography.regular12,
              isOnline
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-secondary-400 dark:text-secondary-500",
            )}
          >
            {isOnline ? "Active now" : "Offline"}
          </p>
          {email && (
            <>
              <span className="text-secondary-300 dark:text-secondary-700">·</span>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500 truncate",
                )}
              >
                {email}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DMHeader;
