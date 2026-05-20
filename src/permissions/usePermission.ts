import { useSessionStore } from "@/store/session.store";
import { can, type Action, type Resource } from "./abilities";
import { hasMinRole, type Role } from "./roles";

export interface UsePermissionReturn {
  /**
   * Check if the current user can perform an action on a resource.
   * @example can("members", "delete")
   */
  can: (resource: Resource, action: Action) => boolean;

  /**
   * Check if the current user has one of the given roles.
   * @example hasRole(["org_admin", "super_admin"])
   */
  hasRole: (roles: Role[]) => boolean;

  /**
   * Check if the current user has at least the minimum required role.
   * @example hasMinRole("member")
   */
  hasMinRole: (minRequired: Role) => boolean;

  /** The current user's role, or null if not authenticated */
  role: Role | null;
}

/**
 * Returns permission-check utilities for the currently authenticated user.
 *
 * Must be used inside a component tree that is wrapped in SessionInitializer
 * (i.e., after session hydration is complete).
 *
 * @example
 * const { can, hasRole } = usePermission();
 *
 * if (can("members", "delete")) {
 *   // show delete button
 * }
 *
 * if (hasRole(["super_admin"])) {
 *   // show master dashboard link
 * }
 */
export function usePermission(): UsePermissionReturn {
  const role = useSessionStore((s) => s.role);

  return {
    can: (resource: Resource, action: Action): boolean => {
      if (!role) return false;
      return can(role, resource, action);
    },

    hasRole: (roles: Role[]): boolean => {
      if (!role) return false;
      return roles.includes(role);
    },

    hasMinRole: (minRequired: Role): boolean => {
      if (!role) return false;
      return hasMinRole(role, minRequired);
    },

    role,
  };
}
