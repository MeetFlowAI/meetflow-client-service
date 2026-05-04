/* Imports */
import React, { forwardRef, memo, useContext, type JSX } from "react";
import { Link } from "react-router-dom";
import { Bell, Search, Zap, User, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import usePageTitle from "@/hooks/usePageTitle";
import SessionContext from "@/context/SessionContext";
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import { typography } from "@/theme/typography";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

interface OrgDashboardPageProps {
  title?: string;
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * OrgDashboardPage — standard page wrapper for all org dashboard pages.
 *
 * Provides the fixed topbar (mobile sidebar trigger, page title, search,
 * notifications, avatar dropdown) and a scrollable main content area.
 *
 * Drop-in equivalent of AdminDashboardPage for the org dashboard context.
 */
const OrgDashboardPage = forwardRef<HTMLDivElement, OrgDashboardPageProps>(
  ({ title = "Dashboard", children = <></> }, ref): JSX.Element => {
    const { isMobile } = useSidebar();
    const { user, LogoutUser } = useContext(SessionContext);
    const navigate = useNavigate();
    usePageTitle(title);

    const initials = user
      ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
      : "?";

    const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";

    return (
      <div className="flex flex-col h-screen w-full overflow-hidden" ref={ref}>
        {/* ── Topbar ── */}
        <header className="shrink-0 flex items-center gap-4 px-6 py-2 bg-white/80 dark:bg-secondary-800/80 backdrop-blur border-b-2 border-secondary-100 dark:border-secondary-600">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <>
                <SidebarTrigger className="h-9 w-9 rounded-xl bg-secondary-100 dark:bg-secondary-700" />
                <Link to={PAGE_ORGANIZATION_DASHBOARD.analytics.absolutePath}>
                  <img
                    src={AppLogoDark}
                    className="h-7 dark:hidden"
                    alt="MeetFlow"
                  />
                  <img
                    src={AppLogoLight}
                    className="h-7 hidden dark:block"
                    alt="MeetFlow"
                  />
                </Link>
                <Separator orientation="vertical" className="h-6 mx-1" />
              </>
            )}
            <h1
              className={clsx(
                typography.semibold16,
                "text-secondary-900 dark:text-white truncate",
              )}
            >
              {title}
            </h1>
          </div>

          {/* Centre search */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Search…"
                className="pl-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-700 border-none cursor-pointer"
                readOnly
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Quick action */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              <Zap className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-3 text-sm font-medium">Notifications</div>
                <DropdownMenuItem className="text-secondary-400 dark:text-secondary-500 text-sm">
                  No new notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer select-none">
                  {initials}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-secondary-100 dark:border-secondary-700">
                  <p className={clsx(typography.medium14, "truncate")}>
                    {fullName}
                  </p>
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 truncate",
                    )}
                  >
                    {user?.role?.display_name ?? "Organization User"}
                  </p>
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
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    );
  },
);

OrgDashboardPage.displayName = "OrgDashboardPage";

export default memo(OrgDashboardPage);
