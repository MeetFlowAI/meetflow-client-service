/**
 * layout/dashboard/workspace/components/topbar/UserMenu.tsx
 *
 * User avatar + dropdown. Fixed to fit within 48px topbar height.
 * - Superadmin/Admin: see Org Console link
 * - Members: see Switch Workspace link
 */

import React, { useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Layers,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { USER_ROLES } from "@/constants";
import {
  PAGE_WORKSPACE_SELECTION,
  PAGE_ORGANIZATION_DASHBOARD,
} from "@/routes/paths";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserMenu: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, LogoutUser } = useContext(SessionContext);
  const { setSelectedWorkspace } = useWorkspace();

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";
  const fullName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "Guest";
  const role = user?.role?.display_name ?? "Member";

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;
  const isAdminRole =
    user?.role?.name === USER_ROLES.ORGANIZATION_ADMIN ||
    user?.role?.name === USER_ROLES.ORGANIZATION_SUPER_ADMIN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/*
         * h-8 keeps the trigger within the 48px topbar.
         * The two-line name+role block is shown only on sm+ screens.
         * On mobile only the avatar is shown.
         */}
        <button
          aria-label="Open user menu"
          className={clsx(
            "flex items-center gap-2 h-8 px-1.5 rounded-lg",
            "hover:bg-secondary-100 dark:hover:bg-secondary-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
            "transition-colors duration-150",
          )}
        >
          {/* Avatar circle */}
          <div className="relative shrink-0">
            <div
              className={clsx(
                "h-7 w-7 rounded-full flex items-center justify-center",
                "bg-linear-to-br from-primary-400 to-primary-600",
                "text-white text-xs font-semibold select-none",
              )}
            >
              {initials}
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-white dark:border-secondary-900" />
          </div>

          {/* Name + role — hidden on small screens */}
          <div className="hidden md:flex flex-col items-start leading-tight max-w-40">
            <span className="text-sm font-medium text-secondary-800 dark:text-secondary-100 truncate w-full leading-snug">
              {fullName}
            </span>
            <span className="text-[11px] text-secondary-400 dark:text-secondary-500 leading-snug">
              {role}
            </span>
          </div>

          <ChevronDown className="hidden md:block h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        {/* Identity header */}
        <div className="px-3 py-2.5 border-b border-secondary-100 dark:border-secondary-700">
          <p className="text-sm font-medium text-secondary-800 dark:text-secondary-100 truncate">
            {fullName}
          </p>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-0.5 truncate">
            {user?.email}
          </p>
        </div>

        {/* General actions */}
        <div className="py-1">
          <DropdownMenuItem className="gap-2 text-sm">
            <User className="h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm">
            <Settings className="h-4 w-4" /> Settings
          </DropdownMenuItem>
        </div>

        {/* Admin: Org Console */}
        {isAdminRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate(PAGE_ORGANIZATION_DASHBOARD.root.absolutePath)
              }
              className="gap-2 text-sm"
            >
              <LayoutDashboard className="h-4 w-4" /> Org Console
            </DropdownMenuItem>
          </>
        )}

        {/* Member: Switch Workspace */}
        {isMember && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedWorkspace(null);
                navigate(PAGE_WORKSPACE_SELECTION.root.absolutePath);
              }}
              className="gap-2 text-sm"
            >
              <Layers className="h-4 w-4" /> Switch Workspace
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={LogoutUser}
          className="gap-2 text-sm text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 mb-1"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
