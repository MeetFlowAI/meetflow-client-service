import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";

import { AuthGuard } from "./guards/AuthGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { ErrorPage } from "@/app/pages/ErrorPage";

// ── Route loading fallback ────────────────────────────────────────────────────
// Shown while a lazy route chunk is being downloaded.
// Phase 7 replaces this with the real PageShell + skeleton system.
// eslint-disable-next-line react-refresh/only-export-components
function RouteFallback() {
  return <div className="min-h-screen bg-background animate-pulse" />;
}

// ── Root layout ───────────────────────────────────────────────────────────────
// Wraps every route with a Suspense boundary.
// The Suspense fallback is shown while any lazy child chunk loads.
// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  );
}

// ── Lazy import factory ───────────────────────────────────────────────────────
// Centralised so TypeScript can infer the return type and the import
// pattern is consistent. Each call creates the React Router lazy config.
//
// REPLACEMENT PATTERN (Phase 9+):
//   Before: comingSoon()
//   After:  lazyRoute("@/modules/auth/components/SignInPage", "SignInPage")
//
// The comingSoon() function below is identical in shape — routes
// are swapped one at a time as feature modules are built.

function comingSoon() {
  return {
    lazy: async () => {
      const { ComingSoonPage } = await import("@/app/pages/ComingSoonPage");
      return { Component: ComingSoonPage };
    },
  };
}

// ── Router definition ─────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    // Root — wraps everything in a Suspense boundary
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,

    children: [
      // ── Index: redirect based on auth + role ─────────────────────────────
      {
        index: true,
        lazy: async () => {
          const { IndexRedirect } = await import("@/app/pages/IndexRedirect");
          return { Component: IndexRedirect };
        },
      },

      // ── Guest-only routes ─────────────────────────────────────────────────
      // Authenticated users are redirected to their dashboard.
      {
        element: <GuestGuard />,
        children: [
          {
            path: "auth",
            children: [
              {
                path: "sign-in",
                ...comingSoon(), // → Phase 9: SignInPage
              },
              {
                path: "sign-up",
                ...comingSoon(), // → Phase 9: SignUpPage
              },
              {
                path: "forgot-password",
                ...comingSoon(), // → Phase 9: ForgotPasswordPage
              },
              {
                path: "reset-password",
                ...comingSoon(), // → Phase 9: ResetPasswordPage
              },
            ],
          },
        ],
      },

      // ── Authenticated routes ──────────────────────────────────────────────
      // Unauthenticated users are redirected to sign-in.
      {
        element: <AuthGuard />,
        children: [
          // ── Onboarding (authenticated but no org yet) ───────────────────
          {
            path: "auth/onboarding",
            ...comingSoon(), // → Phase 9: OnboardingPage
          },

          // ── Master Dashboard (super_admin only) ─────────────────────────
          {
            element: <RoleGuard roles={["super_admin"]} />,
            children: [
              {
                path: "master",
                children: [
                  {
                    index: true,
                    ...comingSoon(), // → Phase 10: MasterOverviewPage
                  },
                  {
                    path: "organizations",
                    children: [
                      {
                        index: true,
                        ...comingSoon(), // → Phase 10: ManageOrganizations
                      },
                      {
                        path: "create",
                        ...comingSoon(), // → Phase 10: CreateOrganization
                      },
                      {
                        path: ":orgId",
                        ...comingSoon(), // → Phase 10: OrganizationDetail
                      },
                      {
                        path: ":orgId/edit",
                        ...comingSoon(), // → Phase 10: EditOrganization
                      },
                    ],
                  },
                  {
                    path: "plans",
                    children: [
                      {
                        index: true,
                        ...comingSoon(), // → Phase 10: ManagePlans
                      },
                      {
                        path: "create",
                        ...comingSoon(),
                      },
                      {
                        path: ":planId/edit",
                        ...comingSoon(),
                      },
                    ],
                  },
                  {
                    path: "users",
                    children: [
                      {
                        index: true,
                        ...comingSoon(), // → Phase 10: ManageUsers
                      },
                      {
                        path: ":userId",
                        ...comingSoon(),
                      },
                    ],
                  },
                ],
              },
            ],
          },

          // ── Org Dashboard (org_admin + member) ──────────────────────────
          {
            element: <RoleGuard minRole="member" />,
            children: [
              {
                path: "org/:orgId",
                children: [
                  {
                    index: true,
                    ...comingSoon(), // → Phase 11: Redirect to overview
                  },
                  {
                    path: "overview",
                    ...comingSoon(), // → Phase 11: OrgOverviewPage
                  },
                  {
                    path: "analytics",
                    ...comingSoon(), // → Phase 11: OrgAnalyticsPage
                  },
                  {
                    path: "reports",
                    ...comingSoon(), // → Phase 11: OrgReportsPage
                  },
                  {
                    path: "billing",
                    // Billing management requires org_admin or above
                    element: <RoleGuard minRole="org_admin" />,
                    children: [
                      {
                        index: true,
                        ...comingSoon(), // → Phase 11: BillingPage
                      },
                    ],
                  },
                  {
                    path: "members",
                    ...comingSoon(), // → Phase 11: OrgMembersPage
                  },
                  {
                    path: "settings",
                    element: <RoleGuard minRole="org_admin" />,
                    children: [
                      {
                        index: true,
                        ...comingSoon(), // → Phase 11: OrgSettingsPage
                      },
                    ],
                  },
                ],
              },
            ],
          },

          // ── Workspace ────────────────────────────────────────────────────
          {
            path: "workspace/:workspaceId",
            children: [
              {
                index: true,
                ...comingSoon(), // → Phase 12: Redirect to channels
              },
              {
                path: "channels",
                children: [
                  {
                    index: true,
                    ...comingSoon(), // → Phase 12: ChannelListPage
                  },
                  {
                    path: ":channelId",
                    ...comingSoon(), // → Phase 13: ChannelPage (real-time)
                  },
                ],
              },
              {
                path: "meetings",
                ...comingSoon(), // → Phase 12: MeetingsPage
              },
              {
                path: "members",
                ...comingSoon(), // → Phase 12: WorkspaceMembersPage
              },
              {
                path: "settings",
                element: <RoleGuard minRole="org_admin" />,
                children: [
                  {
                    index: true,
                    ...comingSoon(), // → Phase 12: WorkspaceSettingsPage
                  },
                ],
              },
            ],
          },

          // ── Meeting room (full-screen — no sidebar layout) ───────────────
          {
            path: "meeting/:meetingId",
            ...comingSoon(), // → Phase 13: MeetingRoomPage (LiveKit)
          },

          // ── Account pages ────────────────────────────────────────────────
          {
            path: "profile",
            ...comingSoon(), // → Phase 12: ProfilePage
          },
          {
            path: "notifications",
            ...comingSoon(), // → Phase 12: NotificationsPage
          },
        ],
      },

      // ── Error / utility pages (no auth required) ──────────────────────────
      {
        path: "403",
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
        // Catch-all: any unmatched URL renders the 404 page
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("@/app/pages/NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
