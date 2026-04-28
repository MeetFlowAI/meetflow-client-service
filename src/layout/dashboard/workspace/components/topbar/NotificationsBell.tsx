/**
 * NotificationsBell.tsx
 *
 * Notification icon button. Badge wired up when notifications are implemented.
 */

import React, { type JSX } from "react";
import { Bell } from "lucide-react";
import clsx from "clsx";

const NotificationsBell: React.FC = (): JSX.Element => (
  <button
    aria-label="Notifications"
    className={clsx(
      "relative flex items-center justify-center h-8 w-8 rounded-lg",
      "text-secondary-500 dark:text-secondary-400",
      "hover:bg-secondary-100 dark:hover:bg-secondary-800",
      "transition-colors duration-150",
    )}
  >
    <Bell className="h-4 w-4" />
    {/* Unread dot — uncomment when notifications are wired up */}
    {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-secondary-900" /> */}
  </button>
);

export default NotificationsBell;
