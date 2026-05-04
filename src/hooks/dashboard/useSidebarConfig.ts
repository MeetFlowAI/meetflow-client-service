/* Imports */
import { useContext } from "react";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import {
  masterSidebarConfig,
  // organizationSidebarConfig,
  workspaceSidebarConfig,
} from "@/layout/dashboard/admin/helper/sidebarConfig";
import { USER_ROLES } from "@/constants";

// ----------------------------------------------------------------------

/**
 * Custom hook to get the appropriate sidebar configuration based on user role
 *
 * @returns {object} The sidebar configuration for the current user
 */
export const useSidebarConfig = () => {
  const { user } = useContext(SessionContext);

  let sidebarConfig: any = [];
  const userRoleName = user?.role?.name;

  switch (userRoleName) {
    case USER_ROLES.MASTER_SUPER_ADMIN:
    case USER_ROLES.MASTER_ADMIN:
      sidebarConfig = masterSidebarConfig;
      break;

    // case USER_ROLES.ORGANIZATION_SUPER_ADMIN:
    // case USER_ROLES.ORGANIZATION_ADMIN:
    //   sidebarConfig = organizationSidebarConfig;
    //   break;

    case USER_ROLES.ORGANIZATION_MEMBER:
      sidebarConfig = workspaceSidebarConfig;
      break;

    default:
      sidebarConfig = masterSidebarConfig;
  }

  return {
    sidebarConfig,
    userRole: userRoleName,
    isMasterAdmin:
      userRoleName === USER_ROLES.MASTER_ADMIN ||
      userRoleName === USER_ROLES.MASTER_SUPER_ADMIN,
    isOrganizationAdmin:
      userRoleName === USER_ROLES.ORGANIZATION_ADMIN ||
      userRoleName === USER_ROLES.ORGANIZATION_SUPER_ADMIN,
    isOrganizationMember: userRoleName === USER_ROLES.ORGANIZATION_MEMBER,
  };
};
