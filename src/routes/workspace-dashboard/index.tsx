/* Imports */
import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";

/* Local Imports */
import WorkspaceDashboardLayout from "@/layout/dashboard/workspace";
import AuthGuard from "../guards/AuthGuard";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { PAGE_WORKSPACE_DASHBOARD, PAGE_WORKSPACE_SELECTION } from "../paths";

// ----------------------------------------------------------------------

const MyProfilePage = lazy(
  () => import("@/views/workspace-dashboard/account/my-profile/index"),
);
const WorkspaceSelectionPage = lazy(
  () => import("@/views/workspace-dashboard/workspace-selection/index"),
);
const WorkspaceHomePage = lazy(
  () => import("@/views/workspace-dashboard/dashboard/home/index"),
);
const ManageChannelsPage = lazy(
  () => import("@/views/workspace-dashboard/dashboard/channels/ManageChannels"),
);
const ViewChannelPage = lazy(
  () => import("@/views/workspace-dashboard/dashboard/channels/ViewChannel"),
);
const ManageChatsPage = lazy(
  () => import("@/views/workspace-dashboard/dashboard/chats/ManageChats"),
);
const ViewChatPage = lazy(
  () => import("@/views/workspace-dashboard/dashboard/chats/ViewChat"),
);
const ManageWorkspaceMembersPage = lazy(
  () =>
    import("@/views/workspace-dashboard/dashboard/members/ManageWorkspaceMembers"),
);
const NotAllowedPage = lazy(() => import("@/views/page-not-allowed"));

// ----------------------------------------------------------------------

/**
 * Workspace selection route — org-member workspace picker.
 * Wrapped in WorkspaceProvider so enterWorkspace() and context are available.
 */
const getWorkspaceSelectionRoutes = (): Array<object> => [
  {
    path: PAGE_WORKSPACE_SELECTION.root.relativePath,
    element: (
      <AuthGuard>
        <WorkspaceProvider>
          <WorkspaceSelectionPage />
        </WorkspaceProvider>
      </AuthGuard>
    ),
  },
];

/**
 * Workspace dashboard routes.
 * WorkspaceDashboardLayout internally wraps WorkspaceProvider.
 *
 * Routes:
 *   /workspace              → /workspace/home
 *   /workspace/home         → WorkspaceHomePage
 *   /workspace/channels     → ManageChannelsPage
 *   /workspace/channels/view/:id → ViewChannelPage
 *   /workspace/chats        → ManageChatsPage
 *   /workspace/chats/view/:id    → ViewChatPage
 *   /workspace/account      → MyProfilePage
 */
const getWorkspaceDashboardRoutes = (): Array<object> => [
  {
    path: PAGE_WORKSPACE_DASHBOARD.root.relativePath,
    element: (
      <AuthGuard>
        <WorkspaceDashboardLayout>
          <Outlet />
        </WorkspaceDashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={PAGE_WORKSPACE_DASHBOARD.home.relativePath} />,
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.account.relativePath,
        element: <MyProfilePage />,
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.home.relativePath,
        element: <WorkspaceHomePage />,
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.channels.relativePath,
        children: [
          { index: true, element: <ManageChannelsPage /> },
          {
            path: PAGE_WORKSPACE_DASHBOARD.channels.view.relativePath,
            element: <ViewChannelPage />,
          },
        ],
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.chats.relativePath,
        children: [
          { index: true, element: <ManageChatsPage /> },
          {
            path: PAGE_WORKSPACE_DASHBOARD.chats.view.relativePath,
            element: <ViewChatPage />,
          },
        ],
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.members.relativePath,
        element: <ManageWorkspaceMembersPage />,
      },
      { path: "*", element: <NotAllowedPage /> },
    ],
  },
];

export { getWorkspaceSelectionRoutes, getWorkspaceDashboardRoutes };
