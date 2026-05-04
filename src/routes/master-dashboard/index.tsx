/* Imports */
import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";

/* Local Imports */
import AdminDashboardLayout from "@/layout/dashboard/admin";
import AuthGuard from "../guards/AuthGuard";
import { PAGE_MASTER_DASHBOARD } from "../paths";

// ----------------------------------------------------------------------

/* Master Dashboard Module Imports */

const MyProfilePage = lazy(
  () => import("@/views/master-dashboard/account/my-profile/index"),
);

const ManageAnalyticsPage = lazy(
  () => import("@/views/master-dashboard/dashboard/analytics/ManageAnalytics"),
);

const ManageRolesPage = lazy(
  () => import("@/views/master-dashboard/dashboard/roles/ManageRoles"),
);

const CreateRolePage = lazy(
  () => import("@/views/master-dashboard/dashboard/roles/CreateRole"),
);

const ManageUsersPage = lazy(
  () => import("@/views/master-dashboard/dashboard/users/ManageUsers"),
);

const CreateUserPage = lazy(
  () => import("@/views/master-dashboard/dashboard/users/CreateUser"),
);

const ManageOrganizationsPage = lazy(
  () =>
    import("@/views/master-dashboard/dashboard/organizations/ManageOrganizations"),
);

const CreateOrganizationPage = lazy(
  () =>
    import("@/views/master-dashboard/dashboard/organizations/CreateOrganization"),
);

const EditOrganizationPage = lazy(
  () =>
    import("@/views/master-dashboard/dashboard/organizations/EditOrganization"),
);

const ManagePlansPage = lazy(
  () => import("@/views/master-dashboard/dashboard/plans/ManagePlans"),
);

const CreatePlanPage = lazy(
  () => import("@/views/master-dashboard/dashboard/plans/CreatePlan"),
);

const EditPlanPage = lazy(
  () => import("@/views/master-dashboard/dashboard/plans/EditPlan"),
);

const ManageFeaturesPage = lazy(
  () => import("@/views/master-dashboard/dashboard/features/ManageFeatures"),
);

const CreateFeaturePage = lazy(
  () => import("@/views/master-dashboard/dashboard/features/CreateFeature"),
);

const NotAllowedPage = lazy(() => import("@/views/page-not-allowed"));

// ----------------------------------------------------------------------

/* Functions */
/**
 * function to fetch routes
 * @returns {void}
 */

const getMasterDashboardRoutes = (): Array<object> => {
  console.log("inside getMasterDashRoutes");
  let dashboardRoutes: Array<object> = [
    {
      path: PAGE_MASTER_DASHBOARD.root.relativePath,
      element: (
        <AuthGuard>
          <AdminDashboardLayout>
            <></>
          </AdminDashboardLayout>
        </AuthGuard>
      ),
    },
  ];

  dashboardRoutes = [
    {
      path: PAGE_MASTER_DASHBOARD.root.relativePath,
      element: (
        <AuthGuard>
          <AdminDashboardLayout>
            <Outlet />
          </AdminDashboardLayout>
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: (
            <Navigate to={PAGE_MASTER_DASHBOARD.analytics.relativePath} />
          ),
        },

        {
          path: PAGE_MASTER_DASHBOARD.account.relativePath,
          element: <MyProfilePage />,
        },

        {
          path: PAGE_MASTER_DASHBOARD.analytics.relativePath,
          element: <ManageAnalyticsPage />,
        },

        {
          path: PAGE_MASTER_DASHBOARD.roles.relativePath,
          children: [
            {
              index: true,
              element: <ManageRolesPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.roles.create.relativePath,
              element: <CreateRolePage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.roles.edit.relativePath,
              element: <CreateRolePage />,
            },
          ],
        },
        {
          path: PAGE_MASTER_DASHBOARD.users.relativePath,
          children: [
            {
              index: true,
              element: <ManageUsersPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.users.create.relativePath,
              element: <CreateUserPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.users.edit.relativePath,
              element: <CreateUserPage />,
            },
          ],
        },

        {
          path: PAGE_MASTER_DASHBOARD.organizations.relativePath,
          children: [
            {
              index: true,
              element: <ManageOrganizationsPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.organizations.create.relativePath,
              element: <CreateOrganizationPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.organizations.edit.relativePath,
              element: <EditOrganizationPage />,
            },
          ],
        },

        {
          path: PAGE_MASTER_DASHBOARD.plans.relativePath,
          children: [
            {
              index: true,
              element: <ManagePlansPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.plans.create.relativePath,
              element: <CreatePlanPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.plans.edit.relativePath,
              element: <EditPlanPage />,
            },
          ],
        },

        {
          path: PAGE_MASTER_DASHBOARD.features.relativePath,
          children: [
            {
              index: true,
              element: <ManageFeaturesPage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.features.create.relativePath,
              element: <CreateFeaturePage />,
            },
            {
              path: PAGE_MASTER_DASHBOARD.features.edit.relativePath,
              element: <CreateFeaturePage />,
            },
          ],
        },

        {
          path: "*",
          element: <NotAllowedPage />,
        },
      ],
    },
  ];

  console.log("after dashbroutes", dashboardRoutes);

  return dashboardRoutes;
};

export default getMasterDashboardRoutes;
