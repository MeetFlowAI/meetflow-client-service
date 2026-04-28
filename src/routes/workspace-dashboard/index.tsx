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

// ── AI Intelligence pages ─────────────────────────────────────────────────────
const MeetingAIReviewPage = lazy(
  () =>
    import("@/views/workspace-dashboard/dashboard/meetings/MeetingAIReview"),
);
const MeetingAISummaryPage = lazy(
  () =>
    import("@/views/workspace-dashboard/dashboard/meetings/MeetingAISummary"),
);
const VoiceEnrollmentPage = lazy(
  () =>
    import("@/views/workspace-dashboard/dashboard/enrollment/VoiceEnrollment"),
);

// ----------------------------------------------------------------------

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
      // ── AI Intelligence routes ──────────────────────────────────────────────
      {
        path: PAGE_WORKSPACE_DASHBOARD.aiReview.relativePath,
        element: <MeetingAIReviewPage />,
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.aiSummary.relativePath,
        element: <MeetingAISummaryPage />,
      },
      {
        path: PAGE_WORKSPACE_DASHBOARD.voiceEnrollment.relativePath,
        element: <VoiceEnrollmentPage />,
      },
      { path: "*", element: <NotAllowedPage /> },
    ],
  },
];

export { getWorkspaceSelectionRoutes, getWorkspaceDashboardRoutes };
