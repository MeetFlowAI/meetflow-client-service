import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { ROLE_HIERARCHY, type Role } from "@/permissions/roles";
import { paths } from "@/routes/paths";

interface RoleGuardProps {
  /**
   * The user must have one of these exact roles to access the route.
   * If you need hierarchical role checking, use minRole instead.
   */
  roles?: Role[];

  /**
   * The user must have at least this role level.
   * Uses ROLE_HIERARCHY weights for comparison.
   * @example minRole="org_admin" allows org_admin AND super_admin
   */
  minRole?: Role;

  /**
   * Where to redirect when access is denied.
   * Defaults to the 403 Forbidden page.
   */
  redirectTo?: string;
}

/**
 * Enforces role-based access on a group of routes.
 *
 * Must be nested inside AuthGuard — assumes the user is authenticated.
 * Use `roles` for exact role matching or `minRole` for hierarchical access.
 *
 * USAGE in router:
 *   // Exact role:
 *   { element: <RoleGuard roles={["super_admin"]} />, children: [...] }
 *
 *   // Hierarchical:
 *   { element: <RoleGuard minRole="org_admin" />, children: [...] }
 */
export function RoleGuard({ roles, minRole, redirectTo = paths.forbidden }: RoleGuardProps) {
  const role = useSessionStore((s) => s.role);

  // No role means not authenticated — AuthGuard should have caught this
  if (!role) {
    return <Navigate to={redirectTo} replace />;
  }

  // Exact role check
  if (roles && roles.length > 0) {
    if (!roles.includes(role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Hierarchical role check
  if (minRole) {
    const userLevel = ROLE_HIERARCHY[role];
    const requiredLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < requiredLevel) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
}
