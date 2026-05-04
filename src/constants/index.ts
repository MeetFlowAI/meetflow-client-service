export const USER_ROLES = {
  // Master
  MASTER_SUPER_ADMIN: "master_super_admin",
  MASTER_ADMIN: "master_admin",
  MASTER_MEMBER: "master_member",

  // Organization
  ORGANIZATION_SUPER_ADMIN: "organization_super_admin",
  ORGANIZATION_ADMIN: "organization_admin",
  ORGANIZATION_MEMBER: "organization_member",

  // Workspace
  WORKSPACE_OWNER: "workspace_owner",
  WORKSPACE_ADMIN: "workspace_admin",
  WORKSPACE_MEMBER: "workspace_member",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
