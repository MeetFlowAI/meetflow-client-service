/* ============================================================
   MeetFlow V2 — Role Definitions

   HIERARCHY (higher number = more permissions):
     super_admin  100  Internal MeetFlow staff
     org_admin     50  Organization owner / administrator
     member        10  Regular organization member
     guest          1  Limited-access guest (view only)

   ADDING A ROLE:
     1. Add the value to ROLES
     2. Add the hierarchy weight to ROLE_HIERARCHY
     3. Add the ability matrix row to abilities.ts
     4. Update API to return the new role string where applicable
   ============================================================ */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Higher number = higher privilege level */
export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  org_admin: 50,
  member: 10,
  guest: 1,
};

/** Human-readable role labels for UI display */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  org_admin: "Admin",
  member: "Member",
  guest: "Guest",
};

/**
 * Returns true if roleA has at least as much privilege as roleB.
 * @example hasMinRole("org_admin", "member") → true
 */
export function hasMinRole(role: Role, minRequired: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRequired];
}
