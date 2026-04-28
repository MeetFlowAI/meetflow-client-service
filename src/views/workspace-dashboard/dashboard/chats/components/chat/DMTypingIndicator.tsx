/**
 * components/chat/DMTypingIndicator.tsx
 *
 * Typing indicator for DM conversations.
 * Shows "[Name] is typing…" with animated bouncing dots.
 *
 * DM-specific: only ever one other person typing (vs channels where N people
 * can type simultaneously). So the label is always singular.
 *
 * Uses Stream Chat's useTypingContext hook.
 */

import React, { type JSX } from "react";
import { useTypingContext } from "stream-chat-react";
import clsx from "clsx";

// ----------------------------------------------------------------------

interface DMTypingIndicatorProps {
  otherUserName: string;
}

// ----------------------------------------------------------------------

const DMTypingIndicator: React.FC<DMTypingIndicatorProps> = ({
  otherUserName,
}): JSX.Element | null => {
  const { typing } = useTypingContext();

  // Check if the other user (not "local") is in the typing map
  const isTyping = Object.values(typing ?? {}).some(
    (t) => t.user?.name === otherUserName || t.user?.id,
  );

  if (!isTyping) return null;

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-5 py-2",
        "text-[12px] text-secondary-400 dark:text-secondary-500",
      )}
    >
      {/* Animated dots */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-secondary-400 dark:bg-secondary-500 animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
      <span>
        <strong className="font-medium text-secondary-500 dark:text-secondary-400">
          {otherUserName}
        </strong>{" "}
        is typing…
      </span>
    </div>
  );
};

export default DMTypingIndicator;
