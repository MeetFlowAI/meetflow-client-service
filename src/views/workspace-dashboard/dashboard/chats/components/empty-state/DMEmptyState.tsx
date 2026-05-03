/**
 * components/empty-state/DMEmptyState.tsx
 *
 * Shown at the top of a DM conversation when there are no messages yet.
 * Matches Slack's pattern: large avatar + "This is the beginning of your
 * direct message history with [Name]."
 *
 * Also shown as the full-screen state when the message list is empty.
 */

import React, { type JSX } from "react";
import clsx from "clsx";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const AVATAR_PALETTE = [
  "#7C3AED", "#059669", "#2563EB", "#DB2777",
  "#D97706", "#0891B2", "#E11D48", "#4F46E5",
];
function getAvatarColor(id: number): string {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

// ----------------------------------------------------------------------

interface DMEmptyStateProps {
  userId: number;
  firstName: string;
  lastName: string;
}

// ----------------------------------------------------------------------

const DMEmptyState: React.FC<DMEmptyStateProps> = ({
  userId,
  firstName,
  lastName,
}): JSX.Element => {
  const fullName = `${firstName} ${lastName}`.trim() || "this person";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const avatarColor = getAvatarColor(userId);

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Large avatar */}
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>

      {/* Name */}
      <h2
        className={clsx(
          typography.semibold20,
          "text-secondary-900 dark:text-white mb-2",
        )}
      >
        {fullName}
      </h2>

      {/* Slack-style description */}
      <p
        className={clsx(
          typography.regular14,
          "text-secondary-500 dark:text-secondary-400 leading-relaxed max-w-md",
        )}
      >
        This is the beginning of your direct message history with{" "}
        <span className="font-semibold text-secondary-700 dark:text-secondary-200">
          {fullName}
        </span>
        . Say hello!
      </p>
    </div>
  );
};

export default DMEmptyState;
