/* Imports */
import React, { useEffect, type JSX } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

/* Local Imports */
import { workspaceNavConfig } from "@/layout/dashboard/workspace/helper/navConfig";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";
import type { WorkspaceNavItem } from "@/context/WorkspaceContext";

// ----------------------------------------------------------------------

const NAV_ROUTES: Record<WorkspaceNavItem, string> = {
  home: PAGE_WORKSPACE_DASHBOARD.home.absolutePath,
  chats: PAGE_WORKSPACE_DASHBOARD.chats.absolutePath,
  channels: PAGE_WORKSPACE_DASHBOARD.channels.absolutePath,
  members: PAGE_WORKSPACE_DASHBOARD.members.absolutePath,
};

/** Derives the active nav item from the current URL pathname */
function getNavFromPath(pathname: string): WorkspaceNavItem {
  if (pathname.startsWith(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath))
    return "chats";
  if (pathname.startsWith(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath))
    return "channels";
  if (pathname.startsWith(PAGE_WORKSPACE_DASHBOARD.members.absolutePath))
    return "members";
  return "home";
}

// ----------------------------------------------------------------------

/**
 * WorkspaceNavSidebar — 72px icon navigation.
 * All 4 items visible to everyone.
 * Admin console access is via topbar "Back to Org Console" button.
 *
 * @component
 */
const WorkspaceNavSidebar: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveNav } = useWorkspace();

  const currentNav = getNavFromPath(location.pathname);

  useEffect(() => {
    setActiveNav(currentNav);
  }, [currentNav, setActiveNav]);

  const handleClick = (id: WorkspaceNavItem) => {
    setActiveNav(id);
    navigate(NAV_ROUTES[id]);
  };

  return (
    <nav
      className={clsx(
        "flex flex-col h-full py-3 shrink-0",
        "bg-secondary-100 dark:bg-secondary-900",
        "border-r border-secondary-200 dark:border-secondary-700",
      )}
      style={{ width: "72px" }}
    >
      <ul className="flex flex-col items-center gap-0.5 flex-1 px-2">
        {workspaceNavConfig.map(({ id, label, shortLabel, icon: Icon }) => {
          const isActive = currentNav === id;
          return (
            <li key={id} className="w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleClick(id)}
                    className={clsx(
                      "relative w-full flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl",
                      "transition-all duration-150 group",
                      isActive
                        ? "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                        : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700/60 hover:text-secondary-700 dark:hover:text-secondary-200",
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary-500" />
                    )}
                    <Icon
                      className={clsx(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-secondary-500 dark:text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-200",
                      )}
                    />
                    <span
                      className={clsx(
                        typography.medium12,
                        "text-center leading-none",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-secondary-400 dark:text-secondary-500",
                      )}
                      style={{ fontSize: "10px" }}
                    >
                      {shortLabel}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default WorkspaceNavSidebar;
