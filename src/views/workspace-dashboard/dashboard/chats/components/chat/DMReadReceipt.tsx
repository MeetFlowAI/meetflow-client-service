/**
 * components/chat/DMReadReceipt.tsx
 *
 * Shows a "Seen" indicator below the last message sent by the local user
 * that has been read by the other participant.
 *
 * Slack / iMessage / WhatsApp all do this. It's a DM-specific feature
 * not needed in channels.
 *
 * Implementation:
 *  - Stream Chat's message.readBy[] contains users who have read the message
 *  - We check if the other user (non-local) is in readBy for the latest
 *    message sent by the local user
 *  - If yes → show "Seen" with the other user's avatar
 *
 * Used inside DMMessage.tsx — rendered beneath the message bubble
 * when the condition is met.
 */

import React, { type JSX } from "react";
import { Check, CheckCheck } from "lucide-react";
import clsx from "clsx";

// ----------------------------------------------------------------------

type ReceiptStatus = "sent" | "delivered" | "seen";

interface DMReadReceiptProps {
  status: ReceiptStatus;
  seenByName?: string;
  /** Small mode: just the icon, no label — for tight spacing */
  compact?: boolean;
}

// ----------------------------------------------------------------------

const DMReadReceipt: React.FC<DMReadReceiptProps> = ({
  status,
  seenByName,
  compact = false,
}): JSX.Element | null => {
  if (status === "sent") {
    return (
      <div className={clsx("flex items-center gap-1 mt-0.5", compact ? "justify-end" : "")}>
        <Check className="h-3 w-3 text-secondary-300 dark:text-secondary-600" />
        {!compact && (
          <span className="text-[10px] text-secondary-300 dark:text-secondary-600">
            Sent
          </span>
        )}
      </div>
    );
  }

  if (status === "delivered") {
    return (
      <div className={clsx("flex items-center gap-1 mt-0.5", compact ? "justify-end" : "")}>
        <CheckCheck className="h-3 w-3 text-secondary-400 dark:text-secondary-500" />
        {!compact && (
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500">
            Delivered
          </span>
        )}
      </div>
    );
  }

  if (status === "seen") {
    return (
      <div className={clsx("flex items-center gap-1 mt-0.5", compact ? "justify-end" : "")}>
        <CheckCheck className="h-3 w-3 text-primary-500 dark:text-primary-400" />
        {!compact && (
          <span className="text-[10px] text-primary-500 dark:text-primary-400 font-medium">
            {seenByName ? `Seen by ${seenByName}` : "Seen"}
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default DMReadReceipt;
export type { ReceiptStatus };
