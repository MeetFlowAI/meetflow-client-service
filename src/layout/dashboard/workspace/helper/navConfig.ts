/* Imports */
import { Home, MessageCircle, Hash, Users } from "lucide-react";

/* Local Imports */
import type { WorkspaceNavItem } from "@/context/WorkspaceContext";

// ----------------------------------------------------------------------

export interface WorkspaceNavItemConfig {
  id: WorkspaceNavItem;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * 4 nav items: Home, Chats, Channels, Members
 * Admin console access moved to topbar "Back to Org Console" button (admin/superadmin only).
 */
export const workspaceNavConfig: WorkspaceNavItemConfig[] = [
  { id: "home", label: "Home", shortLabel: "Home", icon: Home },
  { id: "chats", label: "Chats", shortLabel: "Chats", icon: MessageCircle },
  { id: "channels", label: "Channels", shortLabel: "Channels", icon: Hash },
  { id: "members", label: "Members", shortLabel: "Members", icon: Users },
];
