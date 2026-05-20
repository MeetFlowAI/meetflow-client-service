import type { Role } from "@/permissions/roles";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface UserProfile extends User {
  phone: string | null;
  timezone: string;
  locale: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  desktopNotifications: boolean;
}

/** Lightweight user reference used inside other entities */
export interface UserRef {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}
