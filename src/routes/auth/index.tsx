/* Imports */
import { lazy } from "react";

/* Local Imports */
import AuthLayout from "@/layout/auth";
import { ROOT_PATH, PAGE_ROOT } from "../paths";
import UserGuard from "@/routes/guards/UserGuard";

// ----------------------------------------------------------------------

const SignInPage = lazy(() => import("@/views/auth/signIn"));
const ForgotPasswordPage = lazy(() => import("@/views/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/views/auth/reset-password"));
const NotFoundPage = lazy(() => import("@/views/page-not-found"));

// ----------------------------------------------------------------------

/**
 * Public auth routes — wrapped in UserGuard so authenticated users
 * are redirected to their respective dashboards.
 */
const RootRoutes: Array<object> = [
  {
    path: ROOT_PATH,
    element: (
      <UserGuard>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </UserGuard>
    ),
  },
  {
    path: PAGE_ROOT.signIn.relativePath,
    element: (
      <UserGuard>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </UserGuard>
    ),
  },
  {
    path: PAGE_ROOT.forgotPassword.relativePath,
    element: (
      <UserGuard>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </UserGuard>
    ),
  },
  // Reset password is NOT wrapped in UserGuard — a logged-in user
  // clicking an email reset link should still be able to reset.
  {
    path: PAGE_ROOT.resetPassword.relativePath,
    element: (
      <AuthLayout>
        <ResetPasswordPage />
      </AuthLayout>
    ),
  },
];

const NotFoundRoutes: Array<object> = [
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export { RootRoutes, NotFoundRoutes };
