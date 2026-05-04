/* Imports */
import { useContext, type JSX } from "react";

/* Relative Imports */
import { Navigate, useLocation } from "react-router-dom";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import {
  PAGE_MASTER_DASHBOARD,
  PAGE_ORGANIZATION_DASHBOARD,
  PAGE_WORKSPACE_SELECTION,
} from "../paths";
import { USER_ROLES } from "@/constants";

// ----------------------------------------------------------------------

/* Types/Interfaces */
/**
 * Interface used to create component to define protection layout for pages, which are not accessible after sign in.
 *
 * @interface UserGuardProps
 * @property {node} children - contains the child components.
 */
export interface UserGuardProps {
  children: React.ReactElement;
}

// ----------------------------------------------------------------------
/**
 * Component to define protection layout for pages, which are not accessible after sign in
 *
 * @component
 * @param {node} children - contains the child components
 * @returns {JSX.Element}
 */

const UserGuard: React.FC<UserGuardProps> = ({ children }): JSX.Element => {
  /* Hooks */
  const { isAuthenticated, user } = useContext(SessionContext);
  const location = useLocation();

  /* Output */
  if (isAuthenticated && user) {
    let redirectPath = "";

    switch (user.role.name) {
      case USER_ROLES.MASTER_SUPER_ADMIN:
      case USER_ROLES.MASTER_ADMIN:
        redirectPath = PAGE_MASTER_DASHBOARD.root.absolutePath;
        break;

      case USER_ROLES.ORGANIZATION_SUPER_ADMIN:
      case USER_ROLES.ORGANIZATION_ADMIN:
        redirectPath = PAGE_ORGANIZATION_DASHBOARD.root.absolutePath;
        break;

      case USER_ROLES.ORGANIZATION_MEMBER:
        redirectPath = PAGE_WORKSPACE_SELECTION.root.absolutePath;
        break;

      default:
        redirectPath = PAGE_MASTER_DASHBOARD.root.absolutePath;
    }

    return <Navigate to={redirectPath} replace state={location.state} />;
  }

  return children;
};

export default UserGuard;
