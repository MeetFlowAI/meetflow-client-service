// ----------------------------------------------------------------------
// 🔐 AUTH ENDPOINTS
// ----------------------------------------------------------------------

const AUTH_ENDPOINTS = {
  SIGN_IN: `/auth/login`,
  SIGN_OUT: `/auth/logout`,
  REFRESH_SESSION: `/auth/refresh-token`,
  FORGOT_PASSWORD: `/auth/forgot-password`,
  RESET_PASSWORD: `/auth/reset-password`,
};

// ----------------------------------------------------------------------
// 👤 ACCOUNT ENDPOINTS
// ----------------------------------------------------------------------

const ACCOUNT_ENDPOINTS = {
  GET_PROFILE: `/account/get-profile`,
  UPDATE_PROFILE: `/account/update-profile`,
  CHANGE_PASSWORD: `/account/change-password`,
};

// ----------------------------------------------------------------------
// 🏢 MASTER → ROLES
// ----------------------------------------------------------------------

const ROLE_ENDPOINTS = {
  GET_ALL: `/master/roles/get-all-roles`,
  GET_BY_ID: (id: string) => `/master/roles/get-role-by-id/${id}`,
  CREATE: `/master/roles/create-role`,
  UPDATE: (id: string) => `/master/roles/update-role/${id}`,
  DELETE: (id: string) => `/master/roles/delete-role/${id}`,
  BULK_CREATE: `/master/roles/bulk-create`,
  BULK_UPDATE: `/master/roles/bulk-update`,
  BULK_DELETE: `/master/roles/bulk-delete`,
};

// ----------------------------------------------------------------------
// 👥 MASTER → USERS
// ----------------------------------------------------------------------

const USER_ENDPOINTS = {
  GET_ALL: `/master/users/get-all-users`,
  GET_BY_ID: (id: string) => `/master/users/get-user-by-id/${id}`,
  CREATE: `/master/users/create-user`,
  UPDATE: (id: string) => `/master/users/update-user/${id}`,
  DELETE: (id: string) => `/master/users/delete-user/${id}`,
  BULK_CREATE: `/master/users/bulk-create`,
  BULK_UPDATE: `/master/users/bulk-update`,
  BULK_DELETE: `/master/users/bulk-delete`,
};

// ----------------------------------------------------------------------
// 💡 MASTER → FEATURES
// ----------------------------------------------------------------------

const FEATURE_ENDPOINTS = {
  GET_ALL: `/master/features/get-all-features`,
  GET_BY_ID: (id: string) => `/master/features/get-feature-by-id/${id}`,
  CREATE: `/master/features/create-feature`,
  UPDATE: (id: string) => `/master/features/update-feature/${id}`,
  DELETE: (id: string) => `/master/features/delete-feature/${id}`,
  BULK_CREATE: `/master/features/bulk-create`,
  BULK_UPDATE: `/master/features/bulk-update`,
  BULK_DELETE: `/master/features/bulk-delete`,
};

// ----------------------------------------------------------------------
// 🏢 MASTER → ORGANIZATIONS
// ----------------------------------------------------------------------

const ORGANIZATION_ENDPOINTS = {
  GET_ALL: `/master/organizations/get-all-organizations`,
  GET_BY_ID: (id: string) =>
    `/master/organizations/get-organization-by-id/${id}`,
  CREATE: `/master/organizations/create-organization`,
  UPDATE: (id: string) => `/master/organizations/update-organization/${id}`,
  ACTIVATE: (id: string) => `/master/organizations/activate-organization/${id}`,
  DEACTIVATE: (id: string) =>
    `/master/organizations/deactivate-organization/${id}`,
  ASSIGN_PLAN: (id: string) =>
    `/master/organizations/assign-plan-to-organization/${id}`,
  DELETE: (id: string) => `/master/organizations/delete-organization/${id}`,
  BULK_CREATE: `/master/organizations/bulk-create`,
  BULK_UPDATE: `/master/organizations/bulk-update`,
  BULK_DELETE: `/master/organizations/bulk-delete`,
  BULK_ACTIVATE: `/master/organizations/bulk-activate`,
  BULK_DEACTIVATE: `/master/organizations/bulk-deactivate`,
  BULK_ASSIGN_PLAN: `/master/organizations/bulk-assign-plan`,
};

// ----------------------------------------------------------------------
// 💳 MASTER → PLANS
// ----------------------------------------------------------------------

const PLAN_ENDPOINTS = {
  GET_ALL: `/master/plans/get-all-plans`,
  GET_BY_ID: (id: string) => `/master/plans/get-plan-by-id/${id}`,
  CREATE: `/master/plans/create-plan`,
  UPDATE: (id: string) => `/master/plans/update-plan/${id}`,
  DELETE: (id: string) => `/master/plans/delete-plan/${id}`,
  BULK_CREATE: `/master/plans/bulk-create`,
  BULK_UPDATE: `/master/plans/bulk-update`,
  BULK_DELETE: `/master/plans/bulk-delete`,
  GET_FEATURES: (planId: string) => `/master/plans/get-plan-features/${planId}`,
  ASSIGN_FEATURE: (planId: string) =>
    `/master/plans/assign-plan-feature/${planId}`,
  TOGGLE_FEATURE: (planId: string, featureId: string) =>
    `/master/plans/toggle-plan-feature/${planId}/${featureId}`,
  REMOVE_FEATURE: (planId: string, featureId: string) =>
    `/master/plans/remove-plan-feature/${planId}/${featureId}`,
  BULK_ASSIGN_FEATURES: (planId: string) =>
    `/master/plans/bulk-assign-features/${planId}`,
  BULK_REMOVE_FEATURES: (planId: string) =>
    `/master/plans/bulk-remove-features/${planId}`,
  GET_LIMITS: (planId: string) => `/master/plans/get-plan-limits/${planId}`,
  ADD_LIMIT: (planId: string) => `/master/plans/add-plan-limit/${planId}`,
  UPDATE_LIMIT: (planId: string, limitId: string) =>
    `/master/plans/update-plan-limit/${planId}/${limitId}`,
  DELETE_LIMIT: (planId: string, limitId: string) =>
    `/master/plans/delete-plan-limit/${planId}/${limitId}`,
  BULK_ADD_LIMITS: (planId: string) =>
    `/master/plans/bulk-add-limits/${planId}`,
  BULK_DELETE_LIMITS: (planId: string) =>
    `/master/plans/bulk-delete-limits/${planId}`,
};

// ----------------------------------------------------------------------
// 🗂️ WORKSPACE → WORKSPACES
// ----------------------------------------------------------------------

const WORKSPACE_ENDPOINTS = {
  MY_WORKSPACES: `/workspace/workspaces/my-workspaces`,
  GET_ALL: `/workspace/workspaces/get-all-workspaces`,
  GET_BY_ID: (id: string) => `/workspace/workspaces/get-workspace-by-id/${id}`,
  CREATE: `/workspace/workspaces/create-workspace`,
  UPDATE: (id: string) => `/workspace/workspaces/update-workspace/${id}`,
  DELETE: (id: string) => `/workspace/workspaces/delete-workspace/${id}`,
};

// ----------------------------------------------------------------------
// 👥 WORKSPACE → MEMBERS  (scoped per workspace)
// /workspace/:workspaceId/members/...
// ----------------------------------------------------------------------

const WORKSPACE_MEMBER_ENDPOINTS = {
  GET_ALL: (workspaceId: number | string) =>
    `/workspace/${workspaceId}/members/get-all-members`,
  ADD: (workspaceId: number | string) =>
    `/workspace/${workspaceId}/members/add-member`,
  UPDATE_ROLE: (workspaceId: number | string, userId: number | string) =>
    `/workspace/${workspaceId}/members/update-member/${userId}`,
  REMOVE: (workspaceId: number | string, userId: number | string) =>
    `/workspace/${workspaceId}/members/remove-member/${userId}`,
};

// ----------------------------------------------------------------------
// 📡 WORKSPACE → CHANNELS  (scoped per workspace)
// /workspace/:workspaceId/channels/...
// ----------------------------------------------------------------------

const WORKSPACE_CHANNEL_ENDPOINTS = {
  GET_ALL: (workspaceId: number | string) =>
    `/workspace/${workspaceId}/channels/get-all-channels`,
  GET_BY_ID: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/get-channel-by-id/${channelId}`,
  CREATE: (workspaceId: number | string) =>
    `/workspace/${workspaceId}/channels/create-channel`,
  UPDATE: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/update-channel/${channelId}`,
  DELETE: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/delete-channel/${channelId}`,
};

// ----------------------------------------------------------------------
// 👥 CHANNEL → MEMBERS  (scoped per workspace + channel)
// /workspace/:workspaceId/channels/:channelId/members/...
// ----------------------------------------------------------------------

const CHANNEL_MEMBER_ENDPOINTS = {
  GET_ALL: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/${channelId}/members/get-all-members`,
  ADD: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/${channelId}/members/add-member`,
  REMOVE: (
    workspaceId: number | string,
    channelId: number | string,
    userId: number | string,
  ) =>
    `/workspace/${workspaceId}/channels/${channelId}/members/remove-member/${userId}`,
  JOIN: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/${channelId}/members/join-channel`,
  LEAVE: (workspaceId: number | string, channelId: number | string) =>
    `/workspace/${workspaceId}/channels/${channelId}/members/leave-channel`,
};

// ----------------------------------------------------------------------
// 🏢 ORGANIZATION → PROFILE
// ----------------------------------------------------------------------

const ORG_PROFILE_ENDPOINTS = {
  GET: `/organization/profile/get-org-profile`,
  UPDATE: `/organization/profile/update-org-settings`,
};

// ----------------------------------------------------------------------
// 🛡️ ORGANIZATION → ROLES
// ----------------------------------------------------------------------

const ORG_ROLE_ENDPOINTS = {
  GET_ALL: `/organization/roles/get-all-roles`,
  GET_BY_ID: (id: string) => `/organization/roles/get-role-by-id/${id}`,
  CREATE: `/organization/roles/create-role`,
  UPDATE: (id: string) => `/organization/roles/update-role/${id}`,
  DELETE: (id: string) => `/organization/roles/delete-role/${id}`,
};

// ----------------------------------------------------------------------
// 👥 ORGANIZATION → USERS (MEMBERS)
// ----------------------------------------------------------------------

const ORG_USER_ENDPOINTS = {
  GET_ALL: `/organization/users/get-all-users`,
  GET_BY_ID: (id: string) => `/organization/users/get-user-by-id/${id}`,
  DELETE: (id: string) => `/organization/users/delete-user/${id}`,
  ACTIVATE: (id: string) => `/organization/users/activate-user/${id}`,
  DEACTIVATE: (id: string) => `/organization/users/deactivate-user/${id}`,
};

// ----------------------------------------------------------------------
// ✉️ ORGANIZATION → INVITATIONS
// ----------------------------------------------------------------------

const ORG_INVITATION_ENDPOINTS = {
  GET_ALL: `/organization/invitations/get-all-invitations`,
  SEND: `/organization/invitations/send-invitation`,
  RESEND: (id: string) => `/organization/invitations/resend-invitation/${id}`,
  CANCEL: (id: string) => `/organization/invitations/cancel-invitation/${id}`,
  ACCEPT: `/organization/invitations/accept-invitation`,
};

// ----------------------------------------------------------------------
// 📦 FINAL EXPORT
// ----------------------------------------------------------------------

const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ACCOUNT: ACCOUNT_ENDPOINTS,

  MASTER: {
    ROLES: ROLE_ENDPOINTS,
    USERS: USER_ENDPOINTS,
    FEATURES: FEATURE_ENDPOINTS,
    ORGANIZATIONS: ORGANIZATION_ENDPOINTS,
    PLANS: PLAN_ENDPOINTS,
  },

  ORGANIZATION: {
    PROFILE: ORG_PROFILE_ENDPOINTS,
    ROLES: ORG_ROLE_ENDPOINTS,
    USERS: ORG_USER_ENDPOINTS,
    INVITATIONS: ORG_INVITATION_ENDPOINTS,
  },

  WORKSPACE: {
    WORKSPACES: WORKSPACE_ENDPOINTS,
    MEMBERS: WORKSPACE_MEMBER_ENDPOINTS,
    CHANNELS: WORKSPACE_CHANNEL_ENDPOINTS,
    CHANNEL_MEMBERS: CHANNEL_MEMBER_ENDPOINTS,
  },
};

export default API_ENDPOINTS;
