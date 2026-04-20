/* Imports */
import React, { forwardRef, memo, useContext, type JSX } from "react";
import { Link } from "react-router-dom";
import { Bell, Search, Zap, User, Settings, LogOut } from "lucide-react";

/* shadcn */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* Local Imports */
import { ROOT_PATH } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import usePageTitle from "@/hooks/usePageTitle";
import SessionContext from "@/context/SessionContext";

// ----------------------------------------------------------------------

const AdminDashboardPage = forwardRef<HTMLDivElement, any>(
  ({ title = "Dashboard", children = <></> }, ref): JSX.Element => {
    const { isMobile } = useSidebar();
    const { user, LogoutUser } = useContext(SessionContext);
    usePageTitle(title);

    const initials = user
      ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
      : "?";

    const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";

    return (
      <div className="flex flex-col h-screen w-full overflow-hidden" ref={ref}>
        {/* ── HEADER (FIXED) ── */}
        <header className="shrink-0 flex items-center gap-4 px-6 py-2 bg-white/80 dark:bg-secondary-800/80 backdrop-blur border-b-2 border-secondary-100 dark:border-secondary-600">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <>
                <SidebarTrigger className="h-9 w-9 rounded-xl bg-secondary-100 dark:bg-secondary-700" />
                <Link to={ROOT_PATH}>
                  <img src={AppLogoDark} className="h-7 dark:hidden" />
                  <img src={AppLogoLight} className="h-7 hidden dark:block" />
                </Link>
                <Separator orientation="vertical" className="h-6 mx-1" />
              </>
            )}

            <h1 className="text-base font-semibold text-secondary-900 dark:text-white truncate">
              {title}
            </h1>
          </div>

          {/* CENTER → SEARCH */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Search or press Ctrl + K"
                className="pl-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-700 border-none cursor-pointer"
                readOnly
                onClick={() => console.log("Open command palette")}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 ml-auto">
            {/* ⚡ Quick Action */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 active:scale-95"
            >
              <Zap className="h-4 w-4" />
            </Button>

            {/* 🔔 Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <div className="p-3 text-sm font-medium">Notifications</div>
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 👤 Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                  {initials}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-sm font-medium">{fullName}</div>

                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={LogoutUser} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── MAIN CONTENT (ONLY SCROLLABLE AREA) ── */}
        <main className="flex-1 min-h-0 overflow-hidden p-6">{children}</main>
      </div>
    );
  },
);

AdminDashboardPage.displayName = "AdminDashboardPage";

export default memo(AdminDashboardPage);
