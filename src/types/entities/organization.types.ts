export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  planId: string;
  ownerId: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  allowGuestAccess: boolean;
  requireMeetingApproval: boolean;
  maxMeetingDurationMin: number;
  recordingEnabled: boolean;
  defaultTimezone: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  orgId: string;
  role: "org_admin" | "member" | "guest";
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

/** Lightweight org reference used inside other entities */
export interface OrgRef {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}
