import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { paths } from "@/routes/paths";

/**
 * Protects routes that require authentication.
 *
 * Redirects unauthenticated users to sign-in, preserving the
 * intended destination in location.state.from for post-auth redirect.
 *
 * IMPORTANT: This guard assumes SessionInitializer (in providers.tsx)
 * has already completed. By the time any guard renders, isHydrated is
 * always true — we do not need to handle the loading case here.
 *
 * USAGE in router:
 *   { element: <AuthGuard />, children: [...protected routes] }
 */
export function AuthGuard() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={paths.auth.signIn} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
