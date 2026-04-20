/* Imports */
import { useContext } from "react";

/* Local Imports */
import WorkspaceContext, {
  type WorkspaceNavItem,
} from "@/context/WorkspaceContext";

// ----------------------------------------------------------------------

/**
 * Custom hook to access workspace navigation state.
 *
 * @returns active nav item + setter
 */
export const useWorkspaceNav = () => {
  const { activeNav, setActiveNav } = useContext(WorkspaceContext);

  return {
    activeNav,
    setActiveNav,
    isHome: activeNav === "home",
    isChats: activeNav === "chats",
    isChannels: activeNav === "channels",
    isAdmin: activeNav === "admin",
  };
};

export type { WorkspaceNavItem };
