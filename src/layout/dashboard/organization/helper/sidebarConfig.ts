/* Imports */
import {
  BarChart3,
  Users,
  ShieldCheck,
  LayoutGrid,
  Rocket,
  Settings,
  LifeBuoy,
} from "lucide-react";

/* Local Imports */
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

/**
 * A top-level sidebar item — either a direct link or a collapsible group.
 */
export interface OrgSidebarItem {
  /** Display name */
  name: string;
  /** Lucide icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Direct URL — present only for non-group items */
  url?: string;
  /** Child items — present only for collapsible groups */
  children?: { name: string; url: string }[];
}

export interface OrgSidebarConfig {
  /** Main navigation items */
  main: OrgSidebarItem[];
  /** Bottom items shown above the user card */
  bottom: OrgSidebarItem[];
}

// ----------------------------------------------------------------------

export const organizationDashboardSidebarConfig: OrgSidebarConfig = {
  main: [
    {
      name: "Dashboard",
      icon: BarChart3,
      url: PAGE_ORGANIZATION_DASHBOARD.analytics.absolutePath,
    },
    {
      name: "Users",
      icon: Users,
      children: [
        {
          name: "Members",
          url: PAGE_ORGANIZATION_DASHBOARD.members.absolutePath,
        },
        {
          name: "Invitations",
          url: PAGE_ORGANIZATION_DASHBOARD.invitations.absolutePath,
        },
      ],
    },
    {
      name: "Access Control",
      icon: ShieldCheck,
      children: [
        { name: "Roles", url: PAGE_ORGANIZATION_DASHBOARD.roles.absolutePath },
        {
          name: "Permissions",
          url: PAGE_ORGANIZATION_DASHBOARD.permissions.absolutePath,
        },
      ],
    },
    {
      name: "Workspaces",
      icon: LayoutGrid,
      url: PAGE_ORGANIZATION_DASHBOARD.workspaces.absolutePath,
    },
    {
      name: "Launchpad",
      icon: Rocket,
      url: PAGE_ORGANIZATION_DASHBOARD.launchpad.absolutePath,
    },
  ],

  bottom: [
    {
      name: "Settings",
      icon: Settings,
      url: PAGE_ORGANIZATION_DASHBOARD.settings.absolutePath,
    },
    {
      name: "Support",
      icon: LifeBuoy,
      url: PAGE_ORGANIZATION_DASHBOARD.support.absolutePath,
    },
  ],
};
