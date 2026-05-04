/* Constants */
const ROOT_PATH = "/";
const ROOT_MASTER_DASHBOARD = "master";
const ROOT_ORGANIZATION_DASHBOARD = "organization";
const ROOT_WORKSPACE_DASHBOARD = "workspace";

/* Home Page */
export { ROOT_PATH };

/* Root / Auth Pages */
export const PAGE_ROOT = {
  signIn: {
    relativePath: "signin",
    absolutePath: "/signin",
  },
  forgotPassword: {
    relativePath: "forgot-password",
    absolutePath: "/forgot-password",
  },
  resetPassword: {
    relativePath: "reset-password",
    absolutePath: "/reset-password",
  },
  notFound: {
    relativePath: "not-found",
    absolutePath: "/not-found",
  },
  notAllowed: {
    relativePath: "not-allowed",
    absolutePath: "/not-allowed",
  },
};

/* Master Dashboard Pages */
export const PAGE_MASTER_DASHBOARD = {
  root: {
    relativePath: ROOT_MASTER_DASHBOARD,
    absolutePath: `/${ROOT_MASTER_DASHBOARD}`,
  },
  account: {
    relativePath: "account",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/account`,
  },
  analytics: {
    relativePath: "analytics",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/analytics`,
  },
  roles: {
    relativePath: "roles",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/roles`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/roles/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/roles/edit/:id`,
    },
  },
  users: {
    relativePath: "users",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/users`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/users/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/users/edit/:id`,
    },
  },
  organizations: {
    relativePath: "organizations",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/organizations`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/organizations/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/organizations/edit/:id`,
    },
  },
  plans: {
    relativePath: "plans",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/plans`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/plans/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/plans/edit/:id`,
    },
  },
  features: {
    relativePath: "features",
    absolutePath: `/${ROOT_MASTER_DASHBOARD}/features`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/features/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_MASTER_DASHBOARD}/features/edit/:id`,
    },
  },
};

/* Organization Dashboard Pages */
export const PAGE_ORGANIZATION_DASHBOARD = {
  root: {
    relativePath: ROOT_ORGANIZATION_DASHBOARD,
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}`,
  },
  account: {
    relativePath: "account",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/account`,
  },
  analytics: {
    relativePath: "analytics",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/analytics`,
  },
  members: {
    relativePath: "members",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/members`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/members/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/members/edit/:id`,
    },
  },
  invitations: {
    relativePath: "invitations",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/invitations`,
  },
  roles: {
    relativePath: "roles",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/roles`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/roles/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/roles/edit/:id`,
    },
  },
  permissions: {
    relativePath: "permissions",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/permissions`,
  },
  workspaces: {
    relativePath: "workspaces",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/workspaces`,
    create: {
      relativePath: "create",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/workspaces/create`,
    },
    edit: {
      relativePath: "edit/:id",
      absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/workspaces/edit/:id`,
    },
  },
  settings: {
    relativePath: "settings",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/settings`,
  },
  support: {
    relativePath: "support",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/support`,
  },
  launchpad: {
    relativePath: "launchpad",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/launchpad`,
  },
  billing: {
    relativePath: "billing",
    absolutePath: `/${ROOT_ORGANIZATION_DASHBOARD}/billing`,
  },
};

/* Workspace Dashboard Pages */
export const PAGE_WORKSPACE_DASHBOARD = {
  root: {
    relativePath: ROOT_WORKSPACE_DASHBOARD,
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}`,
  },
  account: {
    relativePath: "account",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/account`,
  },
  home: {
    relativePath: "home",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/home`,
  },
  channels: {
    relativePath: "channels",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/channels`,
    view: {
      relativePath: "view/:id",
      absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/channels/view/:id`,
    },
  },
  chats: {
    relativePath: "chats",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/chats`,
    view: {
      relativePath: "view/:id",
      absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/chats/view/:id`,
    },
  },
  members: {
    relativePath: "members",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/members`,
  },
  // ── AI Intelligence ────────────────────────────────────────────────────────
  aiReview: {
    relativePath: "channels/:channelId/meetings/:meetingId/review",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/channels/:channelId/meetings/:meetingId/review`,
  },
  aiSummary: {
    relativePath: "channels/:channelId/meetings/:meetingId/summary",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/channels/:channelId/meetings/:meetingId/summary`,
  },
  voiceEnrollment: {
    relativePath: "enroll-voice",
    absolutePath: `/${ROOT_WORKSPACE_DASHBOARD}/enroll-voice`,
  },
};

/* Workspace Selection Page (org-member landing) */
export const PAGE_WORKSPACE_SELECTION = {
  root: {
    relativePath: "workspace-selection",
    absolutePath: "/workspace-selection",
  },
};

/* Others Pages */
export const PAGE_OTHERS = {
  settings: {
    relativePath: "settings",
    absolutePath: "/settings",
  },
  helpAndSupport: {
    relativePath: "help-and-support",
    absolutePath: "/help-and-support",
  },
};
