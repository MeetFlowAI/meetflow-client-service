/* Relative Imports */
import {
  Building2,
  CreditCard,
  Layers,
  Home,
  MessageSquare,
  Video,
  CheckSquare,
  BarChart3,
  Activity,
  Settings,
  HelpCircle,
} from "lucide-react";

/* Local Imports */
import {
  PAGE_MASTER_DASHBOARD,
  // PAGE_ORGANIZATION_DASHBOARD,
  PAGE_WORKSPACE_DASHBOARD,
  PAGE_OTHERS,
} from "@/routes/paths";

// ----------------------------------------------------------------------

/* Constants */
export const masterSidebarConfig = [
  {
    name: "Dashboard",
    url: PAGE_MASTER_DASHBOARD.analytics.absolutePath,
    icon: BarChart3,
  },
  {
    name: "Roles",
    url: PAGE_MASTER_DASHBOARD.roles.absolutePath,
    icon: Activity,
  },
  {
    name: "Users",
    url: PAGE_MASTER_DASHBOARD.users.absolutePath,
    icon: CheckSquare,
  },
  {
    name: "Plans",
    url: PAGE_MASTER_DASHBOARD.plans.absolutePath,
    icon: CreditCard,
  },
  {
    name: "Features",
    url: PAGE_MASTER_DASHBOARD.features.absolutePath,
    icon: Layers,
  },
  {
    name: "Organizations",
    url: PAGE_MASTER_DASHBOARD.organizations.absolutePath,
    icon: Building2,
  },
];

// export const organizationSidebarConfig = [
//   {
//     name: "Dashboard",
//     url: PAGE_ORGANIZATION_DASHBOARD.analytics.absolutePath,
//     icon: BarChart3,
//   },
//   {
//     name: "Roles",
//     url: PAGE_ORGANIZATION_DASHBOARD.roles.absolutePath,
//     icon: Activity,
//   },
// ];

export const workspaceSidebarConfig = [
  {
    name: "Home",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: Home,
  },
  {
    name: "Channels",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: MessageSquare,
  },
  {
    name: "Meetings",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: Video,
  },
  {
    name: "Chats",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: Video,
  },

  {
    name: "Tasks",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: CheckSquare,
  },
  {
    name: "Analytics",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: BarChart3,
  },
  {
    name: "Activity",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: Activity,
  },

  {
    name: "Admin Console",
    url: PAGE_WORKSPACE_DASHBOARD.root.absolutePath,
    icon: Building2,
  },
];

export const sidebarOthersConfig = [
  {
    sectionGroupLabel: "OTHERS",
    sections: [
      {
        name: "Settings",
        url: PAGE_OTHERS.settings.absolutePath,
        icon: Settings,
      },
      {
        name: "Help & Support",
        url: PAGE_OTHERS.helpAndSupport.absolutePath,
        icon: HelpCircle,
      },
    ],
  },
];
