/* Imports */
import React, { useContext, type JSX } from "react";
import { LogOut, User, Settings, MoreVertical } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import SessionContext from "@/context/SessionContext";
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

/**
 * OrgAuthenticatedUserCard — org dashboard variant of the user card.
 * Shows org context (role display name) under the user's name.
 */
const OrgAuthenticatedUserCard: React.FC = (): JSX.Element => {
  const { user, LogoutUser } = useContext(SessionContext);
  const navigate = useNavigate();

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const role = user?.role?.display_name ?? "User";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <div
                  className={clsx(
                    "flex items-center w-full cursor-pointer transition-all duration-200",
                    "gap-3 justify-between rounded-xl px-3 py-2.5",
                    "bg-information-500 text-white dark:bg-primary-800",
                    "group-data-[collapsible=icon]:justify-center",
                    "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2",
                    "group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:dark:bg-transparent",
                    "group-data-[collapsible=icon]:rounded-none",
                    "hover:opacity-90 group-data-[collapsible=icon]:hover:opacity-100",
                    "active:scale-[0.98]",
                  )}
                >
                  <div
                    className={clsx(
                      "flex items-center gap-3",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full",
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={clsx(
                          "flex items-center justify-center text-white font-semibold",
                          "h-9 w-9 rounded-full bg-white/20",
                          "group-data-[collapsible=icon]:bg-information-500",
                          "group-data-[collapsible=icon]:dark:bg-primary-800",
                          "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
                        )}
                      >
                        {initials}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white dark:border-secondary-900" />
                    </div>

                    {/* Name + Role */}
                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium truncate">
                        {fullName}
                      </span>
                      <span className="text-xs text-white/70 truncate">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="group-data-[collapsible=icon]:hidden">
                    <MoreVertical className="h-4 w-4 text-white/70" />
                  </div>
                </div>
              </DropdownMenuTrigger>
            </TooltipTrigger>

            <TooltipContent side="right" align="center">
              <div className="text-sm">
                <p className="font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 text-sm font-medium border-b border-secondary-100 dark:border-secondary-700">
              <p className="truncate">{fullName}</p>
              <p className="text-xs text-secondary-400 truncate">{role}</p>
            </div>

            <DropdownMenuItem
              onClick={() =>
                navigate(PAGE_ORGANIZATION_DASHBOARD.account.absolutePath)
              }
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                navigate(PAGE_ORGANIZATION_DASHBOARD.settings.absolutePath)
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={LogoutUser}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default OrgAuthenticatedUserCard;
