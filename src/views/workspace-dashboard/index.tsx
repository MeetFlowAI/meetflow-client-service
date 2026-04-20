/* Imports */
import React, { type JSX } from "react";

/* Local Imports */
import WorkspaceDashboardLayout from "@/layout/dashboard/workspace";

// ----------------------------------------------------------------------

/**
 * Workspace Dashboard Page
 * Renders the full workspace dashboard layout.
 *
 * @component
 */
const WorkspaceDashboardPage: React.FC = (): JSX.Element => {
  return <WorkspaceDashboardLayout />;
};

export default WorkspaceDashboardPage;
