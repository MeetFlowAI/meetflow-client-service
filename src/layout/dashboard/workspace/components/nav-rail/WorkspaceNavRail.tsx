/**
 * layout/dashboard/workspace/components/nav-rail/WorkspaceNavRail.tsx
 *
 * The narrow icon rail on the far left of the workspace dashboard.
 * Width: --workspace-nav-rail-width CSS custom property.
 *
 * Design: Slack-style icon rail with:
 *  - Active state: filled pill background + left indicator bar
 *  - Hover state: soft background tint
 *  - Tooltip on each item (right side)
 *  - Items centered vertically with Home at top
 *
 * This component is intentionally presentation-only.
 * Navigation logic: reads URL, updates WorkspaceContext.
 */

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
import type { WorkspaceNavItem } from "@/context/WorkspaceContext";

// ----------------------------------------------------------------------

const NAV_ROUTES: Record<WorkspaceNavItem, string> = {
  home: PAGE_WORKSPACE_DASHBOARD.home.absolutePath,
  chats: PAGE_WORKSPACE_DASHBOARD.chats.absolutePath,
  channels: PAGE_WORKSPACE_DASHBOARD.channels.absolutePath,
  members: PAGE_WORKSPACE_DASHBOARD.members.absolutePath,
  admin: PAGE_WORKSPACE_DASHBOARD.members.absolutePath,
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

const WorkspaceNavRail: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveNav } = useWorkspace();

  const currentNav = getNavFromPath(location.pathname);

  // Keep WorkspaceContext in sync with the URL
  useEffect(() => {
    setActiveNav(currentNav);
  }, [currentNav, setActiveNav]);

  const handleClick = (id: WorkspaceNavItem) => {
    setActiveNav(id);
    navigate(NAV_ROUTES[id]);
  };

  return (
    <nav
      aria-label="Workspace navigation"
      className={clsx(
        // Sizing — width from CSS var
        "flex flex-col h-full py-2 shrink-0",
        "w-[var(--workspace-nav-rail-width)]",
        // Colors
        "bg-secondary-100/60 dark:bg-secondary-900",
        "border-r border-secondary-200 dark:border-secondary-800",
      )}
    >
      <ul
        role="list"
        className="flex flex-col items-center gap-0.5 flex-1 px-2 pt-1"
      >
        {workspaceNavConfig.map(({ id, label, shortLabel, icon: Icon }) => {
          const isActive = currentNav === id;

          return (
            <li key={id} className="w-full" role="listitem">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleClick(id)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={label}
                    className={clsx(
                      // Layout
                      "relative w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl",
                      // Transitions
                      "transition-all duration-150 group",
                      // States
                      isActive
                        ? [
                            "bg-primary-100 dark:bg-primary-500/20",
                            "text-primary-600 dark:text-primary-400",
                          ]
                        : [
                            "text-secondary-500 dark:text-secondary-400",
                            "hover:bg-secondary-200/70 dark:hover:bg-secondary-700/60",
                            "hover:text-secondary-700 dark:hover:text-secondary-200",
                          ],
                    )}
                  >
                    {/* Active left-edge indicator bar */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary-500 dark:bg-primary-400"
                      />
                    )}

                    {/* Icon */}
                    <Icon
                      className={clsx(
                        "h-[18px] w-[18px] transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-secondary-500 dark:text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-200",
                      )}
                    />

                    {/* Label */}
                    <span
                      className={clsx(
                        "text-center leading-none select-none",
                        "text-[9.5px] font-medium tracking-wide",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-secondary-400 dark:text-secondary-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-300",
                      )}
                    >
                      {shortLabel}
                    </span>
                  </button>
                </TooltipTrigger>

                <TooltipContent side="right" sideOffset={6} className="text-xs">
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

export default WorkspaceNavRail;
