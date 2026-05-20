export type BillingInterval = "monthly" | "annual";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number; // in cents
  priceAnnual: number; // in cents
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  key: string;
  label: string;
  included: boolean;
  value?: string; // e.g. "Unlimited", "5GB"
}

export interface PlanLimits {
  maxMembers: number; // -1 = unlimited
  maxWorkspaces: number;
  maxMeetingDurationMin: number;
  maxStorageGb: number;
  maxRecordingsCount: number;
  canRecord: boolean;
  canCustomBranding: boolean;
  canAdvancedAnalytics: boolean;
  canApiAccess: boolean;
}

export interface Subscription {
  id: string;
  orgId: string;
  planId: string;
  plan: Plan;
  status: "active" | "trialing" | "past_due" | "cancelled" | "unpaid";
  billingInterval: BillingInterval;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}
