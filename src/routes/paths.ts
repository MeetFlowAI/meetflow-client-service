/* ============================================================
   MeetFlow V2 — Route Path Constants

   RULES:
     - Every route path in the application lives here.
     - Feature code imports from this file — never hardcodes strings.
     - Static paths are plain strings.
     - Dynamic paths are factory functions that return strings.
     - Route PATTERNS (with :param) are in ROUTE_PATTERNS below.
       The router uses patterns; navigation uses factory functions.

   WHY SEPARATE PATTERNS FROM PATHS:
     The router definition needs ":orgId" pattern syntax.
     Navigation helpers need the resolved "/org/abc123" string.
     Keeping both here in one file is the source of truth.
   ============================================================ */

// ── Static paths (for navigation and <Link to={...}>) ────────────────────────

export const paths = {
  root: "/",

  // ── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    onboarding: "/auth/onboarding",
  },

  // ── Master Dashboard (super_admin only) ────────────────────────────────
  master: {
    root: "/master",
    organizations: {
      list: "/master/organizations",
      create: "/master/organizations/create",
      detail: (id: string) => `/master/organizations/${id}`,
      edit: (id: string) => `/master/organizations/${id}/edit`,
    },
    plans: {
      list: "/master/plans",
      create: "/master/plans/create",
      detail: (id: string) => `/master/plans/${id}`,
      edit: (id: string) => `/master/plans/${id}/edit`,
    },
    users: {
      list: "/master/users",
      detail: (id: string) => `/master/users/${id}`,
    },
  },

  // ── Org Dashboard (org_admin + member) ─────────────────────────────────
  // Factory function: paths.org("abc").overview
  org: (orgId: string) => ({
    root: `/org/${orgId}`,
    overview: `/org/${orgId}/overview`,
    analytics: `/org/${orgId}/analytics`,
    reports: `/org/${orgId}/reports`,
    billing: `/org/${orgId}/billing`,
    members: `/org/${orgId}/members`,
    settings: `/org/${orgId}/settings`,
  }),

  // ── Workspace ─────────────────────────────────────────────────────────
  workspace: (workspaceId: string) => ({
    root: `/workspace/${workspaceId}`,
    channels: `/workspace/${workspaceId}/channels`,
    channel: (channelId: string) => `/workspace/${workspaceId}/channels/${channelId}`,
    meetings: `/workspace/${workspaceId}/meetings`,
    members: `/workspace/${workspaceId}/members`,
    settings: `/workspace/${workspaceId}/settings`,
  }),

  // ── Meeting room (full-screen, no sidebar) ─────────────────────────────
  meeting: (meetingId: string) => `/meeting/${meetingId}`,

  // ── Account ───────────────────────────────────────────────────────────
  profile: "/profile",
  notifications: "/notifications",

  // ── Error pages ───────────────────────────────────────────────────────
  forbidden: "/403",
  notFound: "/404",
} as const;

// ── Route PATTERNS (for createBrowserRouter definitions) ─────────────────────
// Use these in the router config, not in navigation.

export const routePatterns = {
  root: "/",

  auth: {
    root: "auth",
    signIn: "sign-in",
    signUp: "sign-up",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
    onboarding: "onboarding",
  },

  master: {
    root: "master",
    organizations: "organizations",
    orgDetail: "organizations/:orgId",
    orgEdit: "organizations/:orgId/edit",
    plans: "plans",
    planDetail: "plans/:planId",
    users: "users",
    userDetail: "users/:userId",
  },

  org: {
    root: "org/:orgId",
    overview: "overview",
    analytics: "analytics",
    reports: "reports",
    billing: "billing",
    members: "members",
    settings: "settings",
  },

  workspace: {
    root: "workspace/:workspaceId",
    channels: "channels",
    channel: "channels/:channelId",
    meetings: "meetings",
    members: "members",
    settings: "settings",
  },

  meeting: "meeting/:meetingId",
  profile: "profile",
  notifications: "notifications",
  forbidden: "403",
  notFound: "*",
} as const;
