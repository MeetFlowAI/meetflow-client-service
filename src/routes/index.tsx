/* Imports */
import { Suspense, useContext, type JSX } from "react";
import { useRoutes } from "react-router-dom";

/* Local Imports */
import { RootRoutes, NotFoundRoutes } from "./auth";
import FullScreenLoader from "@/components/loader/FullScreenLoader";
import getMasterDashboardRoutes from "./master-dashboard";
import getOrganizationDashboardRoutes from "./organization-dashboard";
import { USER_ROLES } from "@/constants";
import SessionContext from "@/context/SessionContext";
import { SpinnerLoader } from "@/components/loader/InlineLoader";
import {
  getWorkspaceDashboardRoutes,
  getWorkspaceSelectionRoutes,
} from "./workspace-dashboard";

// ----------------------------------------------------------------------

const Routing: React.FC = (): JSX.Element => {
  const { isAuthenticated, user, isPageLoaded } = useContext(SessionContext);

  let dashboardRoutes: Array<object> = [];

  if (isAuthenticated && user) {
    switch (user.role.name) {
      case USER_ROLES.MASTER_SUPER_ADMIN:
      case USER_ROLES.MASTER_ADMIN:
        dashboardRoutes = getMasterDashboardRoutes();
        break;

      case USER_ROLES.ORGANIZATION_ADMIN:
      case USER_ROLES.ORGANIZATION_SUPER_ADMIN:
        dashboardRoutes = [
          ...getOrganizationDashboardRoutes(),
          ...getWorkspaceDashboardRoutes(),
        ];
        break;

      case USER_ROLES.ORGANIZATION_MEMBER:
        dashboardRoutes = [
          ...getWorkspaceSelectionRoutes(),
          ...getWorkspaceDashboardRoutes(),
        ];
        break;

      default:
        dashboardRoutes = [];
    }
  }

  const routes = [...RootRoutes, ...dashboardRoutes, ...NotFoundRoutes];
  const content = useRoutes(routes);

  if (isPageLoaded) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center">
          <SpinnerLoader />
        </div>
      }
    >
      {content}
    </Suspense>
  );
};

export default Routing;
