/* Imports */
import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";

/* Local Imports */
import OrgDashboardLayout from "@/layout/dashboard/organization";
import AuthGuard from "../guards/AuthGuard";
import { PAGE_ORGANIZATION_DASHBOARD } from "../paths";

// ----------------------------------------------------------------------

/* Lazy page imports */

const ManageAnalyticsPage = lazy(
  () =>
    import("@/views/organization-dashboard/dashboard/analytics/ManageAnalytics"),
);

const ManageMembersPage = lazy(
  () =>
    import("@/views/organization-dashboard/dashboard/members/ManageMembers"),
);

const ManageInvitationsPage = lazy(
  () =>
    import("@/views/organization-dashboard/dashboard/invitations/ManageInvitations"),
);

const ManageOrgRolesPage = lazy(
  () => import("@/views/organization-dashboard/dashboard/roles/ManageOrgRoles"),
);

const ManagePermissionsPage = lazy(
  () =>
    import("@/views/organization-dashboard/dashboard/permissions/ManagePermissions"),
);

const ManageWorkspacesPage = lazy(
  () =>
    import("@/views/organization-dashboard/dashboard/workspaces/ManageWorkspaces"),
);

const LaunchpadPage = lazy(
  () => import("@/views/organization-dashboard/dashboard/launchpad"),
);

const SettingsPage = lazy(
  () => import("@/views/organization-dashboard/settings"),
);

const SupportPage = lazy(
  () => import("@/views/organization-dashboard/support"),
);

const MyProfilePage = lazy(
  () => import("@/views/organization-dashboard/account/my-profile"),
);

const NotAllowedPage = lazy(() => import("@/views/page-not-allowed"));

// ----------------------------------------------------------------------

/**
 * getOrganizationDashboardRoutes
 *
 * All routes nested under /organization — accessible only to
 * ORGANIZATION_SUPER_ADMIN and ORGANIZATION_ADMIN roles.
 *
 * AuthGuard wraps the root outlet → unauthenticated users are
 * redirected to /signin.
 */
const getOrganizationDashboardRoutes = (): Array<object> => {
  return [
    {
      path: PAGE_ORGANIZATION_DASHBOARD.root.relativePath,
      element: (
        <AuthGuard>
          <OrgDashboardLayout>
            <Outlet />
          </OrgDashboardLayout>
        </AuthGuard>
      ),
      children: [
        /* ── Default redirect ── */
        {
          index: true,
          element: (
            <Navigate
              to={PAGE_ORGANIZATION_DASHBOARD.analytics.relativePath}
              replace
            />
          ),
        },

        /* ── Dashboard ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.analytics.relativePath,
          element: <ManageAnalyticsPage />,
        },

        /* ── Account ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.account.relativePath,
          element: <MyProfilePage />,
        },

        /* ── Users → Members ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.members.relativePath,
          children: [
            { index: true, element: <ManageMembersPage /> },
            // Create / Edit stubs — add views later
            {
              path: PAGE_ORGANIZATION_DASHBOARD.members.create.relativePath,
              element: <ManageMembersPage />,
            },
            {
              path: PAGE_ORGANIZATION_DASHBOARD.members.edit.relativePath,
              element: <ManageMembersPage />,
            },
          ],
        },

        /* ── Users → Invitations ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.invitations.relativePath,
          element: <ManageInvitationsPage />,
        },

        /* ── Access Control → Roles ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.roles.relativePath,
          children: [
            { index: true, element: <ManageOrgRolesPage /> },
            {
              path: PAGE_ORGANIZATION_DASHBOARD.roles.create.relativePath,
              element: <ManageOrgRolesPage />,
            },
            {
              path: PAGE_ORGANIZATION_DASHBOARD.roles.edit.relativePath,
              element: <ManageOrgRolesPage />,
            },
          ],
        },

        /* ── Access Control → Permissions ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.permissions.relativePath,
          element: <ManagePermissionsPage />,
        },

        /* ── Workspaces ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.workspaces.relativePath,
          children: [
            { index: true, element: <ManageWorkspacesPage /> },
            {
              path: PAGE_ORGANIZATION_DASHBOARD.workspaces.create.relativePath,
              element: <ManageWorkspacesPage />,
            },
            {
              path: PAGE_ORGANIZATION_DASHBOARD.workspaces.edit.relativePath,
              element: <ManageWorkspacesPage />,
            },
          ],
        },

        /* ── Launchpad ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.launchpad.relativePath,
          element: <LaunchpadPage />,
        },

        /* ── Settings ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.settings.relativePath,
          element: <SettingsPage />,
        },

        /* ── Support ── */
        {
          path: PAGE_ORGANIZATION_DASHBOARD.support.relativePath,
          element: <SupportPage />,
        },

        /* ── Catch-all inside /organization/* ── */
        {
          path: "*",
          element: <NotAllowedPage />,
        },
      ],
    },
  ];
};

export default getOrganizationDashboardRoutes;
