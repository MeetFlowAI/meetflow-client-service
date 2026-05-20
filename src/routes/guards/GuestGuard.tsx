import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { paths } from "@/routes/paths";
import { ROLES } from "@/permissions/roles";

/**
 * Protects guest-only routes (sign-in, sign-up, etc.).
 *
 * Redirects already-authenticated users to the appropriate
 * dashboard based on their role. If they arrived at the auth
 * page from a protected route (state.from), they are sent back
 * to that route instead.
 *
 * USAGE in router:
 *   { element: <GuestGuard />, children: [...auth routes] }
 */
export function GuestGuard() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const role = useSessionStore((s) => s.role);
  const currentOrg = useSessionStore((s) => s.currentOrg);
  const currentWorkspace = useSessionStore((s) => s.currentWorkspace);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Restore the intended destination if the user was redirected here
  const intendedDestination = (location.state as { from?: Location } | null)?.from?.pathname;

  if (intendedDestination && intendedDestination !== paths.auth.signIn) {
    return <Navigate to={intendedDestination} replace />;
  }

  // Route to the appropriate dashboard based on role
  if (role === ROLES.SUPER_ADMIN) {
    return <Navigate to={paths.master.root} replace />;
  }

  if (currentOrg) {
    return <Navigate to={paths.org(currentOrg.id).overview} replace />;
  }

  if (currentWorkspace) {
    return <Navigate to={paths.workspace(currentWorkspace.id).root} replace />;
  }

  // Authenticated but no context yet — send to onboarding
  return <Navigate to={paths.auth.onboarding} replace />;
}
