/**
 * @temporary — Static RBAC ability matrix
 *
 * CURRENT STATE:
 *   This static matrix is a development-phase placeholder.
 *   It gives the UI a working permission system from day one
 *   without requiring a backend permissions API.
 *
 * THE PROBLEM WITH THIS APPROACH AT SCALE:
 *   Real org-level permissions are contextual and overridable.
 *   An org_admin may have restricted billing access in one org
 *   and full access in another. A member may have been granted
 *   a one-off permission override. A static matrix cannot
 *   represent any of this.
 *
 * PLANNED REPLACEMENT (Phase 9+):
 *   The /auth/me response will include:
 *     { capabilities: ["billing:manage", "members:delete", ...] }
 *
 *   When that lands, replace this matrix with a capabilities check:
 *     can(role, resource, action) →
 *       session.capabilities.includes(`${resource}:${action}`)
 *
 *   The usePermission() hook API does NOT change — only this
 *   file's `can()` function implementation changes. Every
 *   PermissionGuard and usePermission() call site is untouched.
 *
 * WHAT NEVER CHANGES:
 *   - usePermission() hook interface
 *   - PermissionGuard / RoleGuard component APIs
 *   - Resource and Action type definitions
 *
 * SECURITY REMINDER:
 *   Frontend permissions are UI hints only.
 *   Every sensitive API operation is authorized server-side.
 *   This matrix controls what the user SEES, not what they CAN DO.
 */

import type { Role } from "./roles";

export type Resource =
  | "organizations"
  | "members"
  | "workspaces"
  | "meetings"
  | "channels"
  | "analytics"
  | "billing"
  | "settings"
  | "plans"
  | "users";

export type Action = "view" | "create" | "edit" | "delete" | "manage";

type AbilityMatrix = Partial<Record<Resource, Action[]>>;

export const ABILITIES: Record<Role, AbilityMatrix> = {
  // ── Super Admin ───────────────────────────────────────────────────────────
  super_admin: {
    organizations: ["view", "create", "edit", "delete", "manage"],
    members: ["view", "create", "edit", "delete", "manage"],
    workspaces: ["view", "create", "edit", "delete", "manage"],
    meetings: ["view", "create", "edit", "delete", "manage"],
    channels: ["view", "create", "edit", "delete", "manage"],
    analytics: ["view", "manage"],
    billing: ["view", "manage"],
    settings: ["view", "manage"],
    plans: ["view", "create", "edit", "delete", "manage"],
    users: ["view", "create", "edit", "delete", "manage"],
  },

  // ── Org Admin ─────────────────────────────────────────────────────────────
  org_admin: {
    organizations: ["view", "edit"],
    members: ["view", "create", "edit", "delete"],
    workspaces: ["view", "create", "edit", "delete"],
    meetings: ["view", "create", "edit", "delete"],
    channels: ["view", "create", "edit", "delete"],
    analytics: ["view"],
    billing: ["view", "manage"],
    settings: ["view", "manage"],
    plans: ["view"],
    users: ["view"],
  },

  // ── Member ────────────────────────────────────────────────────────────────
  member: {
    workspaces: ["view"],
    meetings: ["view", "create"],
    channels: ["view", "create"],
    analytics: ["view"],
    settings: ["view"],
    members: ["view"],
  },

  // ── Guest ─────────────────────────────────────────────────────────────────
  guest: {
    meetings: ["view"],
    channels: ["view"],
  },
};

/**
 * Pure function for permission checks outside of React components.
 * In React components, use usePermission() from permissions/usePermission.ts.
 *
 * @temporary — See module JSDoc for planned replacement strategy.
 */
export function can(role: Role, resource: Resource, action: Action): boolean {
  return ABILITIES[role]?.[resource]?.includes(action) ?? false;
}
