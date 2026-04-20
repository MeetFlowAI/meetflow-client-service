/* Imports */
import React, { type JSX } from "react";
import { Hash, MessageCircle, Zap } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

/**
 * DefaultContent — shown when user is at /workspace/home root
 * without navigating to a specific section yet.
 */
const DefaultContent: React.FC = (): JSX.Element => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
    <div className="max-w-sm w-full">
      <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center mx-auto mb-5">
        <Zap className="h-8 w-8 text-primary-600 dark:text-primary-500" />
      </div>
      <h2
        className={clsx(
          typography.semibold20,
          "text-secondary-800 dark:text-secondary-100 mb-2",
        )}
      >
        Welcome to your workspace
      </h2>
      <p
        className={clsx(
          typography.regular14,
          "text-secondary-400 dark:text-secondary-500 leading-relaxed mb-8",
        )}
      >
        Select a channel or direct message from the left panel to get started.
      </p>
      <div className="flex flex-col gap-3 text-left">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/30 border border-secondary-100 dark:border-secondary-700">
          <Hash className="h-5 w-5 text-primary-500 shrink-0" />
          <div>
            <p
              className={clsx(
                typography.medium14,
                "text-secondary-700 dark:text-secondary-200",
              )}
            >
              Browse Channels
            </p>
            <p className={clsx(typography.regular12, "text-secondary-400")}>
              Click "Channels" in the left sidebar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/30 border border-secondary-100 dark:border-secondary-700">
          <MessageCircle className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p
              className={clsx(
                typography.medium14,
                "text-secondary-700 dark:text-secondary-200",
              )}
            >
              Direct Messages
            </p>
            <p className={clsx(typography.regular12, "text-secondary-400")}>
              Click "Chats" to message team members
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------

interface WorkspaceMainContentProps {
  children?: React.ReactNode;
}

/**
 * WorkspaceMainContent — right 60% of the workspace dashboard.
 * Renders routed children (from <Outlet />) or DefaultContent when empty.
 * All inline ChannelContent / DMContent moved to ViewChannel / ViewChat pages.
 *
 * @component
 */
const WorkspaceMainContent: React.FC<WorkspaceMainContentProps> = ({
  children,
}): JSX.Element => {
  const hasChildren =
    React.Children.count(children) > 0 &&
    React.Children.toArray(children).some(
      (child) => child !== null && child !== undefined,
    );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-secondary-800">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {children ?? <DefaultContent />}
      </div>
    </div>
  );
};

export default WorkspaceMainContent;
