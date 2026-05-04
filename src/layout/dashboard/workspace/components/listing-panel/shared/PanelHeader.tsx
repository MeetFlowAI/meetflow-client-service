/**
 * layout/dashboard/workspace/components/listing-panel/shared/PanelHeader.tsx
 *
 * Reusable header for each listing panel (Channels, Chats, Members, Home).
 * Shows title, optional loading spinner, and optional add button.
 */

import React, { type JSX } from "react";
import { Plus, Loader2 } from "lucide-react";
import clsx from "clsx";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  loading?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  addLabel = "Add",
  loading,
  className,
}): JSX.Element => (
  <div
    className={clsx(
      "px-3 pt-3 pb-2.5 shrink-0",
      "border-b border-secondary-200 dark:border-secondary-800",
      className,
    )}
  >
    <div className="flex items-center justify-between">
      {/* Title + spinner */}
      <div className="flex items-center gap-2 min-w-0">
        <h2
          className={clsx(
            typography.semibold14,
            "text-secondary-800 dark:text-secondary-100 truncate",
          )}
        >
          {title}
        </h2>
        {loading && (
          <Loader2 className="h-3.5 w-3.5 text-secondary-400 animate-spin shrink-0" />
        )}
      </div>

      {/* Add button */}
      {onAdd && (
        <button
          onClick={onAdd}
          title={addLabel}
          aria-label={addLabel}
          className={clsx(
            "h-6 w-6 flex items-center justify-center rounded-md transition-colors shrink-0",
            "text-secondary-500 dark:text-secondary-400",
            "hover:bg-secondary-200 dark:hover:bg-secondary-700",
            "hover:text-secondary-700 dark:hover:text-secondary-200",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>

    {subtitle && (
      <p
        className={clsx(
          typography.regular12,
          "text-secondary-400 dark:text-secondary-500 mt-0.5",
        )}
      >
        {subtitle}
      </p>
    )}
  </div>
);

export default PanelHeader;
