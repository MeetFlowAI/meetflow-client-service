/* Imports */
import React, { useState, useContext, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  ROOT_PATH,
  PAGE_WORKSPACE_SELECTION,
  PAGE_ORGANIZATION_DASHBOARD,
} from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLES } from "@/constants";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export interface WorkspaceTopbarProps {
  className?: string;
}

// ----------------------------------------------------------------------

/**
 * WorkspaceTopbar — fixed global header for the workspace dashboard.
 * Shows: Logo | Workspace chip (click to switch) | Search | Notifications | User
 *
 * @component
 */
const WorkspaceTopbar: React.FC<WorkspaceTopbarProps> = ({
  className,
}): JSX.Element => {
  const navigate = useNavigate();
  const { user, LogoutUser } = useContext(SessionContext);
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const role = user?.role?.display_name ?? "Member";

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;
  const isAdminRole =
    user?.role?.name === USER_ROLES.ORGANIZATION_ADMIN ||
    user?.role?.name === USER_ROLES.ORGANIZATION_SUPER_ADMIN;

  const handleSwitchWorkspace = () => {
    setSelectedWorkspace(null);
    navigate(PAGE_WORKSPACE_SELECTION.root.absolutePath);
  };

  const handleGoToOrgConsole = () => {
    navigate(PAGE_ORGANIZATION_DASHBOARD.root.absolutePath);
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 h-14",
        "flex items-center gap-3 px-5",
        "bg-white dark:bg-secondary-900",
        "border-b border-secondary-200 dark:border-secondary-700",
        className,
      )}
    >
      {/* ── Logo ── */}
      <Link to={ROOT_PATH} className="flex items-center shrink-0">
        <img src={AppLogoDark} alt="MeetFlow" className="h-8 dark:hidden" />
        <img
          src={AppLogoLight}
          alt="MeetFlow"
          className="h-8 hidden dark:block"
        />
      </Link>

      <Separator
        orientation="vertical"
        className="h-5 bg-secondary-200 dark:bg-secondary-700"
      />

      {/* ── Workspace chip (only for org members — allows switching) ── */}
      {selectedWorkspace && isMember && (
        <button
          onClick={handleSwitchWorkspace}
          className={clsx(
            "hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors shrink-0",
            "hover:bg-secondary-100 dark:hover:bg-secondary-800",
            "border border-secondary-200 dark:border-secondary-700",
          )}
          title="Switch workspace"
        >
          <div className="h-5 w-5 rounded bg-primary-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold" style={{ fontSize: "9px" }}>
              {selectedWorkspace.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-700 dark:text-secondary-200 max-w-[120px] truncate",
            )}
          >
            {selectedWorkspace.name}
          </span>
          <Layers className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
        </button>
      )}

      {/* Workspace name for admin/superadmin (no switch) */}
      {selectedWorkspace && !isMember && (
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg shrink-0 border border-secondary-200 dark:border-secondary-700">
          <div className="h-5 w-5 rounded bg-primary-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold" style={{ fontSize: "9px" }}>
              {selectedWorkspace.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-700 dark:text-secondary-200 max-w-[120px] truncate",
            )}
          >
            {selectedWorkspace.name}
          </span>
        </div>
      )}

      {/* ── Global Search ── */}
      <div className="flex-1 max-w-lg">
        <div className="relative flex items-center h-9">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 dark:text-secondary-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search channels, people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={clsx(
              "w-full h-9 pl-9 pr-8 rounded-xl text-sm outline-none transition-all duration-200",
              "bg-secondary-100 text-secondary-800 placeholder:text-secondary-400",
              "dark:bg-secondary-800 dark:text-secondary-100 dark:placeholder:text-secondary-500",
              searchFocused
                ? "ring-2 ring-primary-500/40 bg-white dark:bg-secondary-700"
                : "",
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Back to Org Console — only for org admin / super-admin */}
        {isAdminRole && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToOrgConsole}
            className={clsx(
              "hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs",
              "border-secondary-200 dark:border-secondary-700",
              "text-secondary-600 dark:text-secondary-300",
              "hover:bg-secondary-100 dark:hover:bg-secondary-800",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Org Console
          </Button>
        )}
        {/* Bell (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-secondary-500 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Separator
          orientation="vertical"
          className="h-5 bg-secondary-200 dark:bg-secondary-700"
        />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={clsx(
                "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors",
                "hover:bg-secondary-100 dark:hover:bg-secondary-800",
              )}
            >
              <div className="relative">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white dark:border-secondary-900" />
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                <span
                  className={clsx(
                    typography.medium14,
                    "text-secondary-800 dark:text-secondary-100",
                  )}
                >
                  {fullName}
                </span>
                <span
                  className={clsx(
                    typography.regular12,
                    "text-secondary-400 dark:text-secondary-500",
                  )}
                >
                  {role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
            <div className="px-3 py-2.5 border-b border-secondary-100 dark:border-secondary-700">
              <p
                className={clsx(
                  typography.medium14,
                  "text-secondary-800 dark:text-secondary-100",
                )}
              >
                {fullName}
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500 mt-0.5 truncate",
                )}
              >
                {user?.email}
              </p>
            </div>
            <DropdownMenuItem className="mt-1">
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            {isAdminRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleGoToOrgConsole}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Org Console
                </DropdownMenuItem>
              </>
            )}
            {isMember && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSwitchWorkspace}>
                  <Layers className="mr-2 h-4 w-4" /> Switch Workspace
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={LogoutUser}
              className="text-red-500 focus:text-red-500 mb-1"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default WorkspaceTopbar;
