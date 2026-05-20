/* ============================================================
   MeetFlow V2 — Query Key Factory

   ARCHITECTURE:
     All TanStack Query cache keys are defined here.
     Feature query hooks import from this file — never
     define inline keys inside useQuery() calls.

   WHY:
     Centralized keys enable surgical cache invalidation.
     e.g. queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all() })
     invalidates every organization-related query in one call.

   STRUCTURE:
     queryKeys.{domain}.all()        → invalidates all domain queries
     queryKeys.{domain}.list(params) → specific paginated list
     queryKeys.{domain}.detail(id)   → single entity

   CONVENTION:
     Keys are const arrays. The first element is the domain string.
     This allows prefix-based invalidation via queryKey: ["organizations"].
   ============================================================ */

import type { BaseListParams, DateRangeParams } from "@/types/api/request.types";

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    me: () => ["auth", "me"] as const,
    session: () => ["auth", "session"] as const,
  },

  // ── Organizations ─────────────────────────────────────────────────────────
  organizations: {
    all: () => ["organizations"] as const,
    lists: () => ["organizations", "list"] as const,
    list: (params: BaseListParams) => ["organizations", "list", params] as const,
    detail: (id: string) => ["organizations", "detail", id] as const,
    members: (id: string, params?: BaseListParams) =>
      ["organizations", id, "members", params ?? {}] as const,
    stats: (id: string) => ["organizations", id, "stats"] as const,
  },

  // ── Plans ─────────────────────────────────────────────────────────────────
  plans: {
    all: () => ["plans"] as const,
    list: (params?: BaseListParams) => ["plans", "list", params ?? {}] as const,
    detail: (id: string) => ["plans", "detail", id] as const,
  },

  // ── Users (platform-level, super_admin only) ──────────────────────────────
  users: {
    all: () => ["users"] as const,
    list: (params: BaseListParams) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  // ── Workspaces ────────────────────────────────────────────────────────────
  workspaces: {
    all: (orgId: string) => ["workspaces", orgId] as const,
    lists: (orgId: string) => ["workspaces", orgId, "list"] as const,
    list: (orgId: string, params: BaseListParams) => ["workspaces", orgId, "list", params] as const,
    detail: (id: string) => ["workspaces", "detail", id] as const,
    members: (id: string, params?: BaseListParams) =>
      ["workspaces", id, "members", params ?? {}] as const,
  },

  // ── Meetings ──────────────────────────────────────────────────────────────
  meetings: {
    all: (workspaceId: string) => ["meetings", workspaceId] as const,
    lists: (workspaceId: string) => ["meetings", workspaceId, "list"] as const,
    list: (workspaceId: string, params: BaseListParams) =>
      ["meetings", workspaceId, "list", params] as const,
    detail: (id: string) => ["meetings", "detail", id] as const,
    participants: (id: string) => ["meetings", id, "participants"] as const,
    recordings: (id: string) => ["meetings", id, "recordings"] as const,
    upcoming: (workspaceId: string) => ["meetings", workspaceId, "upcoming"] as const,
  },

  // ── Channels ──────────────────────────────────────────────────────────────
  channels: {
    all: (workspaceId: string) => ["channels", workspaceId] as const,
    lists: (workspaceId: string) => ["channels", workspaceId, "list"] as const,
    list: (workspaceId: string, params: BaseListParams) =>
      ["channels", workspaceId, "list", params] as const,
    detail: (id: string) => ["channels", "detail", id] as const,
    messages: (id: string, params?: { cursor?: string; limit?: number }) =>
      ["channels", id, "messages", params ?? {}] as const,
    members: (id: string) => ["channels", id, "members"] as const,
    pinned: (id: string) => ["channels", id, "pinned"] as const,
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    all: (orgId: string) => ["analytics", orgId] as const,
    overview: (orgId: string, range: DateRangeParams) =>
      ["analytics", orgId, "overview", range] as const,
    meetings: (orgId: string, range: DateRangeParams) =>
      ["analytics", orgId, "meetings", range] as const,
    members: (orgId: string, range: DateRangeParams) =>
      ["analytics", orgId, "members", range] as const,
    usage: (orgId: string, range: DateRangeParams) => ["analytics", orgId, "usage", range] as const,
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  billing: {
    all: (orgId: string) => ["billing", orgId] as const,
    subscription: (orgId: string) => ["billing", orgId, "subscription"] as const,
    invoices: (orgId: string, params?: BaseListParams) =>
      ["billing", orgId, "invoices", params ?? {}] as const,
    paymentMethods: (orgId: string) => ["billing", orgId, "payment-methods"] as const,
    usage: (orgId: string) => ["billing", orgId, "usage"] as const,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    all: () => ["notifications"] as const,
    list: (params?: BaseListParams) => ["notifications", "list", params ?? {}] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  profile: {
    me: () => ["profile", "me"] as const,
    preferences: () => ["profile", "preferences"] as const,
  },
} as const;
