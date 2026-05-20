/* ============================================================
   MeetFlow V2 — Permission Ability Matrix

   READ THIS BEFORE MODIFYING:
     This file is the SINGLE SOURCE OF TRUTH for all access
     control rules in the frontend. Changes here affect every
     PermissionGuard and usePermission() call in the entire app.

   STRUCTURE:
     ABILITIES[role][resource] = Action[]
     
   RESOURCES:
     organizations  — org CRUD (super_admin only for create/delete)
     members        — org member management
     workspaces     — workspace CRUD
     meetings       — meeting CRUD and management
     channels       — channel CRUD and messaging
     analytics      — read-only analytics views
     billing        — plan + payment management
     settings       — org / workspace settings
     plans          — platform plan management (super_admin only)
     users          — platform user management (super_admin only)
   ============================================================ */

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
  // ── Super Admin — full platform access ───────────────────────────────────
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

  // ── Org Admin — full org access, no platform management ──────────────────
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

  // ── Member — standard product usage ──────────────────────────────────────
  member: {
    workspaces: ["view"],
    meetings: ["view", "create"],
    channels: ["view", "create"],
    analytics: ["view"],
    settings: ["view"],
    members: ["view"],
  },

  // ── Guest — read-only access ──────────────────────────────────────────────
  guest: {
    meetings: ["view"],
    channels: ["view"],
  },
};

/**
 * Returns true if the given role can perform the action on the resource.
 * This is the pure function — use usePermission() in React components.
 *
 * @example can("org_admin", "members", "delete") → true
 */
export function can(role: Role, resource: Resource, action: Action): boolean {
  return ABILITIES[role]?.[resource]?.includes(action) ?? false;
}
