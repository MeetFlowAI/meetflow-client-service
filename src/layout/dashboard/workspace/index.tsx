/**
 * layout/dashboard/workspace/index.tsx
 */

import React, { useState, useContext, type JSX } from "react";
import { Outlet, Navigate } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { StreamChatProvider } from "@/context/StreamChatContext";
import SessionContext from "@/context/SessionContext";
import { USER_ROLES } from "@/constants";
import { PAGE_WORKSPACE_SELECTION } from "@/routes/paths";

import WorkspaceTopbar from "./components/topbar/WorkspaceTopbar";
import WorkspaceNavRail from "./components/nav-rail/WorkspaceNavRail";
import WorkspaceListingPanel from "./components/listing-panel/WorkspaceListingPanel";
import WorkspaceMainContent from "./components/main-content/WorkspaceMainContent";
import CreateChannelModal from "@/views/workspace-dashboard/dashboard/channels/components/CreateChannelModal";
import {
  LISTING_PANEL_DEFAULT_SIZE,
  LISTING_PANEL_MIN_SIZE,
  LISTING_PANEL_MAX_SIZE,
  // MAIN_PANEL_MAX_SIZE,
  // MAIN_PANEL_MIN_SIZE,
} from "./constants";

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
      <WorkspaceTopbar />

      <div
        className="flex overflow-hidden mt-(--workspace-topbar-height)"
        style={{ height: "calc(100dvh - var(--workspace-topbar-height))" }}
      >
        <WorkspaceNavRail />

        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 h-full min-w-0 rounded-lg border"
        >
          <ResizablePanel
            defaultSize={LISTING_PANEL_DEFAULT_SIZE}
            // minSize={LISTING_PANEL_MIN_SIZE}
            // maxSize={LISTING_PANEL_MAX_SIZE}
            className="flex flex-col overflow-hidden border-r border-secondary-200 dark:border-secondary-800"
          >
            <WorkspaceListingPanel
              onCreateChannel={() => setCreateChannelOpen(true)}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-secondary-200 dark:bg-secondary-800 hover:bg-primary-200 dark:hover:bg-primary-700/30 transition-colors"
          />

          <ResizablePanel
            defaultSize={100 - LISTING_PANEL_DEFAULT_SIZE}
            // minSize={MAIN_PANEL_MIN_SIZE}
            // maxSize={MAIN_PANEL_MAX_SIZE}
          >
            <WorkspaceMainContent>
              <Outlet />
            </WorkspaceMainContent>
          </ResizablePanel>
        </ResizablePanelGroup>
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

export interface WorkspaceDashboardLayoutProps {
  children?: React.ReactNode;
}

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
