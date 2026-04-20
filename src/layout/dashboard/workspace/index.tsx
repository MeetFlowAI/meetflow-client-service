/* Imports */
import React, { useState, useContext, type JSX } from "react";
import { Outlet, Navigate } from "react-router-dom";

/* Local Imports */
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { StreamChatProvider } from "@/context/StreamChatContext";
import SessionContext from "@/context/SessionContext";
import { USER_ROLES } from "@/constants";
import { PAGE_WORKSPACE_SELECTION } from "@/routes/paths";
import WorkspaceTopbar from "./components/WorkspaceTopbar";
import WorkspaceNavSidebar from "./components/WorkspaceNavSidebar";
import WorkspaceListingPanel from "./components/WorkspaceListingPanel";
import WorkspaceMainContent from "./components/WorkspaceMainContent";
import CreateChannelModal from "@/views/workspace-dashboard/dashboard/channels/components/CreateChannelModal";

// ----------------------------------------------------------------------

export interface WorkspaceDashboardLayoutProps {
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * Inner layout — needs WorkspaceProvider + StreamChatProvider already mounted above.
 */
const WorkspaceLayoutInner: React.FC = (): JSX.Element => {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const { user } = useContext(SessionContext);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;

  if (isMember && !selectedWorkspace) {
    return <Navigate to={PAGE_WORKSPACE_SELECTION.root.absolutePath} replace />;
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-secondary-50 dark:bg-secondary-900">
        {/* ── TOPBAR ── */}
        <WorkspaceTopbar />

        {/* ── BODY ── */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: "56px" }}
        >
          {/* ── LEFT: nav + listing panel ── */}
          <div
            className="flex flex-col shrink-0 overflow-hidden border-r border-secondary-200 dark:border-secondary-700"
            style={{ width: "30%" }}
          >
            <div className="flex flex-1 overflow-hidden">
              <WorkspaceNavSidebar />
              <div className="flex-1 overflow-hidden">
                <WorkspaceListingPanel
                  onCreateChannel={() => setCreateChannelOpen(true)}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: main content ── */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-secondary-800">
            <WorkspaceMainContent>
              <Outlet />
            </WorkspaceMainContent>
          </div>
        </div>
      </div>

      {selectedWorkspaceId && (
        <CreateChannelModal
          open={createChannelOpen}
          onClose={() => setCreateChannelOpen(false)}
          workspaceId={selectedWorkspaceId}
          onCreated={() => setCreateChannelOpen(false)}
        />
      )}
    </>
  );
};

// ----------------------------------------------------------------------

/**
 * WorkspaceDashboardLayout — mounts WorkspaceProvider then StreamChatProvider,
 * then renders the inner layout.
 *
 * StreamChatProvider connects to Stream Chat using the logged-in user's token.
 * It must be inside WorkspaceProvider (needs auth context) but outside the
 * inner layout so the client is shared across all workspace pages.
 */
const WorkspaceDashboardLayout: React.FC<
  WorkspaceDashboardLayoutProps
> = (): JSX.Element => (
  <WorkspaceProvider>
    <StreamChatProvider>
      <WorkspaceLayoutInner />
    </StreamChatProvider>
  </WorkspaceProvider>
);

export default WorkspaceDashboardLayout;
