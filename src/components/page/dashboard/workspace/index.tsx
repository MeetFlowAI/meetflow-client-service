/* Imports */
import React, { forwardRef, memo, type JSX } from "react";

/* Local Imports */
import usePageTitle from "@/hooks/usePageTitle";

// ----------------------------------------------------------------------

/* Interface */

/**
 * Interface for the WorkspaceDashboardPage wrapper component.
 *
 * @interface WorkspaceDashboardPageProps
 * @property {string} title    - Browser tab title (default: "Workspace").
 * @property {node}   children - Page body content.
 */
export interface WorkspaceDashboardPageProps {
  title?: string;
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * WorkspaceDashboardPage — page wrapper for all workspace dashboard views.
 * Sets the browser tab title and provides a scrollable content area.
 * Mirrors the AdminDashboardPage pattern used by the master dashboard.
 * Fully compatible with light and dark modes.
 *
 * @component
 * @param {string} title    - Browser tab title (default: "Workspace")
 * @param {node}   children - Page body content
 */
const WorkspaceDashboardPage = forwardRef<
  HTMLDivElement,
  WorkspaceDashboardPageProps
>(({ title = "Workspace", children = <></> }, ref): JSX.Element => {
  /* Hooks */
  usePageTitle(title);

  /* Output */
  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-secondary-800"
      ref={ref}
    >
      {/* Scrollable content area */}
      <main className="flex-1 overflow-auto p-6 scroll-smooth">{children}</main>
    </div>
  );
});

WorkspaceDashboardPage.displayName = "WorkspaceDashboardPage";

export default memo(WorkspaceDashboardPage);
