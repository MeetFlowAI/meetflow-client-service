import { usePermission } from "./usePermission";
import type { Action, Resource } from "./abilities";
import type { Role } from "./roles";

// ── Resource + Action gate ────────────────────────────────────────────────────

interface PermissionGuardProps {
  /** The resource being accessed */
  resource: Resource;
  /** The action being performed on the resource */
  action: Action;
  /** Rendered when the user has permission */
  children: React.ReactNode;
  /** Rendered when the user lacks permission. Defaults to null. */
  fallback?: React.ReactNode;
}

/**
 * Renders `children` only when the current user can perform
 * `action` on `resource`. Renders `fallback` (default: null) otherwise.
 *
 * @example
 * <PermissionGuard resource="members" action="delete">
 *   <AppButton intent="danger">Remove Member</AppButton>
 * </PermissionGuard>
 *
 * <PermissionGuard resource="billing" action="manage" fallback={<UpgradeBanner />}>
 *   <BillingSettings />
 * </PermissionGuard>
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { can } = usePermission();
  return can(resource, action) ? <>{children}</> : <>{fallback}</>;
}

// ── Role gate ─────────────────────────────────────────────────────────────────

interface RoleGuardProps {
  /** The user must have one of these roles to see children */
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders `children` only when the current user has one of the given roles.
 *
 * @example
 * <RoleGuard roles={["super_admin"]}>
 *   <MasterDashboardLink />
 * </RoleGuard>
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = usePermission();
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>;
}
