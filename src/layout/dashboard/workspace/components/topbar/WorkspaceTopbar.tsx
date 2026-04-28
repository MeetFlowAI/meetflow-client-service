/**
 * layout/dashboard/workspace/components/topbar/WorkspaceTopbar.tsx
 */

import React, { useContext, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LayoutDashboard, Layers } from "lucide-react";
import clsx from "clsx";

import {
  ROOT_PATH,
  PAGE_WORKSPACE_SELECTION,
  PAGE_ORGANIZATION_DASHBOARD,
} from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { USER_ROLES } from "@/constants";
import GlobalSearch from "./GlobalSearch";
import UserMenu from "./UserMenu";

interface WorkspaceTopbarProps {
  className?: string;
}

const WorkspaceTopbar: React.FC<WorkspaceTopbarProps> = ({
  className,
}): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;
  const isAdminRole =
    user?.role?.name === USER_ROLES.ORGANIZATION_ADMIN ||
    user?.role?.name === USER_ROLES.ORGANIZATION_SUPER_ADMIN;

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50",
        "h-(--workspace-topbar-height)",
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4",
        "bg-white dark:bg-secondary-900",
        "border-b border-secondary-200 dark:border-secondary-800",
        className,
      )}
    >
      {/* ── LEFT: Logo + Workspace chip ───────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <Link
          to={ROOT_PATH}
          className="flex items-center shrink-0"
          aria-label="MeetFlow home"
        >
          <img
            src={AppLogoDark}
            alt="MeetFlow"
            className="h-7 w-auto dark:hidden"
          />
          <img
            src={AppLogoLight}
            alt="MeetFlow"
            className="h-7 w-auto hidden dark:block"
          />
        </Link>

        {selectedWorkspace && (
          <>
            <div className="h-5 w-px bg-secondary-200 dark:bg-secondary-700 shrink-0" />

            {isMember ? (
              <button
                onClick={() => {
                  setSelectedWorkspace(null);
                  navigate(PAGE_WORKSPACE_SELECTION.root.absolutePath);
                }}
                title={`Switch workspace — currently in ${selectedWorkspace.name}`}
                className={clsx(
                  "hidden sm:flex items-center gap-1.5 h-7 px-2 rounded-lg shrink-0",
                  "border border-secondary-200 dark:border-secondary-700",
                  "hover:bg-secondary-100 dark:hover:bg-secondary-800",
                  "transition-colors duration-150",
                )}
              >
                <div className="h-4 w-4 rounded bg-primary-500 flex items-center justify-center shrink-0">
                  <span
                    className="text-white font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    {selectedWorkspace.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-secondary-700 dark:text-secondary-200 max-w-[96px] truncate">
                  {selectedWorkspace.name}
                </span>
                <Layers className="h-3 w-3 text-secondary-400 dark:text-secondary-500 shrink-0" />
              </button>
            ) : (
              <div
                title="Admins manage workspaces from Org Console"
                className={clsx(
                  "hidden sm:flex items-center gap-1.5 h-7 px-2 rounded-lg shrink-0",
                  "border border-secondary-200 dark:border-secondary-700",
                  "bg-secondary-50 dark:bg-secondary-800/50",
                )}
              >
                <div className="h-4 w-4 rounded bg-primary-500 flex items-center justify-center shrink-0">
                  <span
                    className="text-white font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    {selectedWorkspace.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-secondary-700 dark:text-secondary-200 max-w-[96px] truncate">
                  {selectedWorkspace.name}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── CENTER: Global search ─────────────────────────────────── */}
      {/*
        This column is `1fr` — it takes all remaining space between left
        and right zones. GlobalSearch fills it with max-w to stay readable.
      */}
      <div className="flex justify-center">
        <GlobalSearch className="w-full max-w-md" />
      </div>

      {/* ── RIGHT: Org Console + Bell + Divider + UserMenu ────────── */}
      <div className="flex items-center gap-1">
        {isAdminRole && (
          <button
            onClick={() =>
              navigate(PAGE_ORGANIZATION_DASHBOARD.root.absolutePath)
            }
            className={clsx(
              "hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-lg shrink-0",
              "text-xs font-medium",
              "border border-secondary-200 dark:border-secondary-700",
              "text-secondary-600 dark:text-secondary-300",
              "hover:bg-secondary-100 dark:hover:bg-secondary-800",
              "transition-colors duration-150",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Org Console
          </button>
        )}

        <button
          aria-label="Notifications"
          className={clsx(
            "relative flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
            "text-secondary-500 dark:text-secondary-400",
            "hover:bg-secondary-100 dark:hover:bg-secondary-800",
            "transition-colors duration-150",
          )}
        >
          <Bell className="h-4 w-4" />
          {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-secondary-900" /> */}
        </button>

        <div className="h-5 w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

        <UserMenu />
      </div>
    </header>
  );
};

export default WorkspaceTopbar;
