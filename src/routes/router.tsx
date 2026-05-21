import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";

import { AuthGuard } from "./guards/AuthGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { ErrorPage } from "@/app/pages/ErrorPage";
import { routePatterns } from "./paths";

// ── Route loading fallback ────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
function RouteFallback() {
  return <div className="min-h-screen bg-background animate-pulse" />;
}

// ── Root layout ───────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  );
}

// ── Lazy placeholder factory ──────────────────────────────────────────────────
// Used for all routes not yet implemented (Phases 9–13).
// Replace: comingSoon() → lazyRoute(import("@/modules/.../Page"), "Page")
// Zero change to the route structure; only the factory call changes.
function comingSoon() {
  return {
    lazy: async () => {
      const { ComingSoonPage } = await import("@/app/pages/ComingSoonPage");
      return { Component: ComingSoonPage };
    },
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
// All path strings are sourced from routePatterns — never inline strings.
// TypeScript catches path typos at compile time.

export const router = createBrowserRouter([
  {
    path: routePatterns.root,
    element: <RootLayout />,
    errorElement: <ErrorPage />,

    children: [
      // ── Index redirect (role-aware root navigation) ───────────────────────
      {
        index: true,
        lazy: async () => {
          const { IndexRedirect } = await import("@/app/pages/IndexRedirect");
          return { Component: IndexRedirect };
        },
      },

      // ── Guest-only routes ─────────────────────────────────────────────────
      {
        element: <GuestGuard />,
        children: [
          {
            path: routePatterns.auth.root,
            children: [
              { path: routePatterns.auth.signIn, ...comingSoon() }, // Phase 9
              { path: routePatterns.auth.signUp, ...comingSoon() }, // Phase 9
              { path: routePatterns.auth.forgotPassword, ...comingSoon() }, // Phase 9
              { path: routePatterns.auth.resetPassword, ...comingSoon() }, // Phase 9
            ],
          },
        ],
      },

      // ── Authenticated routes ──────────────────────────────────────────────
      {
        element: <AuthGuard />,
        children: [
          // Onboarding — authenticated but org context not yet established
          {
            path: `${routePatterns.auth.root}/${routePatterns.auth.onboarding}`,
            ...comingSoon(), // Phase 9
          },

          // ── Master Dashboard — super_admin only ─────────────────────────
          {
            element: <RoleGuard roles={["super_admin"]} />,
            children: [
              {
                path: routePatterns.master.root,
                children: [
                  { index: true, ...comingSoon() }, // Phase 10

                  // Organizations
                  {
                    path: routePatterns.master.organizations,
                    children: [
                      { index: true, ...comingSoon() }, // Phase 10
                      { path: "create", ...comingSoon() }, // Phase 10
                      { path: ":orgId", ...comingSoon() }, // Phase 10
                      { path: ":orgId/edit", ...comingSoon() }, // Phase 10
                    ],
                  },

                  // Plans
                  {
                    path: routePatterns.master.plans,
                    children: [
                      { index: true, ...comingSoon() }, // Phase 10
                      { path: "create", ...comingSoon() }, // Phase 10
                      { path: ":planId/edit", ...comingSoon() }, // Phase 10
                    ],
                  },

                  // Users
                  {
                    path: routePatterns.master.users,
                    children: [
                      { index: true, ...comingSoon() }, // Phase 10
                      { path: ":userId", ...comingSoon() }, // Phase 10
                    ],
                  },
                ],
              },
            ],
          },

          // ── Org Dashboard — member and above ────────────────────────────
          {
            element: <RoleGuard minRole="member" />,
            children: [
              {
                path: routePatterns.org.root,
                children: [
                  { index: true, ...comingSoon() }, // Phase 11 redirect
                  { path: routePatterns.org.overview, ...comingSoon() }, // Phase 11
                  { path: routePatterns.org.analytics, ...comingSoon() }, // Phase 11
                  { path: routePatterns.org.reports, ...comingSoon() }, // Phase 11
                  { path: routePatterns.org.members, ...comingSoon() }, // Phase 11

                  // Billing — org_admin and above only
                  {
                    path: routePatterns.org.billing,
                    element: <RoleGuard minRole="org_admin" />,
                    children: [{ index: true, ...comingSoon() }], // Phase 11
                  },

                  // Settings — org_admin and above only
                  {
                    path: routePatterns.org.settings,
                    element: <RoleGuard minRole="org_admin" />,
                    children: [{ index: true, ...comingSoon() }], // Phase 11
                  },
                ],
              },
            ],
          },

          // ── Workspace ────────────────────────────────────────────────────
          {
            path: routePatterns.workspace.root,
            children: [
              { index: true, ...comingSoon() }, // Phase 12 redirect
              { path: routePatterns.workspace.meetings, ...comingSoon() }, // Phase 12
              { path: routePatterns.workspace.members, ...comingSoon() }, // Phase 12

              // Channels
              {
                path: routePatterns.workspace.channels,
                children: [
                  { index: true, ...comingSoon() }, // Phase 12
                  { path: ":channelId", ...comingSoon() }, // Phase 13 (real-time)
                ],
              },

              // Settings — org_admin and above only
              {
                path: routePatterns.workspace.settings,
                element: <RoleGuard minRole="org_admin" />,
                children: [{ index: true, ...comingSoon() }], // Phase 12
              },
            ],
          },

          // ── Meeting room — full-screen, no sidebar layout ────────────────
          { path: routePatterns.meeting, ...comingSoon() }, // Phase 13

          // ── Account pages ────────────────────────────────────────────────
          { path: routePatterns.profile, ...comingSoon() }, // Phase 12
          { path: routePatterns.notifications, ...comingSoon() }, // Phase 12
        ],
      },

      // ── Error / utility pages — no auth required ──────────────────────────
      {
        path: routePatterns.forbidden,
        lazy: async () => {
          const { ForbiddenPage } = await import("@/app/pages/ForbiddenPage");
          return { Component: ForbiddenPage };
        },
      },
      {
        path: "404",
        lazy: async () => {
          const { NotFoundPage } = await import("@/app/pages/NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
      {
        path: routePatterns.notFound,
        lazy: async () => {
          const { NotFoundPage } = await import("@/app/pages/NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
