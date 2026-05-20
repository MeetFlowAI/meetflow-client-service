import { Navigate } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { ROLES } from "@/permissions/roles";
import { paths } from "@/routes/paths";

/**
 * Handles the root "/" redirect.
 *
 * Routing logic:
 *   Not authenticated  → sign-in
 *   super_admin        → master dashboard
 *   Has currentOrg     → org overview
 *   Has currentWs      → workspace root
 *   No context yet     → onboarding
 *
 * NOTE: Session is always hydrated by the time this renders.
 * SessionInitializer blocks the RouterProvider until hydration completes.
 */
export function IndexRedirect() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const role = useSessionStore((s) => s.role);
  const currentOrg = useSessionStore((s) => s.currentOrg);
  const currentWorkspace = useSessionStore((s) => s.currentWorkspace);

  if (!isAuthenticated) {
    return <Navigate to={paths.auth.signIn} replace />;
  }

  if (role === ROLES.SUPER_ADMIN) {
    return <Navigate to={paths.master.root} replace />;
  }

  if (currentOrg) {
    return <Navigate to={paths.org(currentOrg.id).overview} replace />;
  }

  if (currentWorkspace) {
    return <Navigate to={paths.workspace(currentWorkspace.id).root} replace />;
  }

  return <Navigate to={paths.auth.onboarding} replace />;
}
