/**
 * layout/dashboard/workspace/components/main-content/WorkspaceMainContent.tsx
 *
 * The right-side content area.
 * Renders routed children (channel view, chat view, home, members, etc.).
 * Falls back to an empty-state prompt when no child is active.
 *
 * Intentionally minimal — no business logic here.
 */

import React, { type JSX } from "react";
import { Hash, MessageCircle } from "lucide-react";
import clsx from "clsx";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const EmptyState: React.FC = (): JSX.Element => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center select-none">
    <div className="max-w-xs">
      {/* Illustration placeholder */}
      <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
        <Hash className="h-7 w-7 text-primary-400 dark:text-primary-500" />
      </div>

      <h2
        className={clsx(
          typography.semibold20,
          "text-secondary-700 dark:text-secondary-200 mb-2",
        )}
      >
        Pick up where you left off
      </h2>
      <p
        className={clsx(
          typography.regular14,
          "text-secondary-400 dark:text-secondary-500 leading-relaxed mb-6",
        )}
      >
        Select a channel or direct message from the left panel to get started.
      </p>

      {/* Hint rows */}
      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800">
          <Hash className="h-4 w-4 text-violet-500 shrink-0" />
          <p
            className={clsx(
              typography.medium14,
              "text-secondary-600 dark:text-secondary-300",
            )}
          >
            Open a channel — click <strong>Channels</strong> in the nav rail
          </p>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800">
          <MessageCircle className="h-4 w-4 text-blue-500 shrink-0" />
          <p
            className={clsx(
              typography.medium14,
              "text-secondary-600 dark:text-secondary-300",
            )}
          >
            Start a DM — click <strong>Chats</strong> and pick a teammate
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------

interface WorkspaceMainContentProps {
  children?: React.ReactNode;
}

const WorkspaceMainContent: React.FC<WorkspaceMainContentProps> = ({
  children,
}): JSX.Element => {
  // Determine if children has actual renderable content
  const hasContent =
    React.Children.count(children) > 0 &&
    React.Children.toArray(children).some(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-secondary-900">
      {hasContent ? (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default WorkspaceMainContent;
