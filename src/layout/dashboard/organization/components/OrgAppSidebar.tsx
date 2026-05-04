/* Imports */
import React, { type JSX } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

/* Local Imports */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import { organizationDashboardSidebarConfig } from "../helper/sidebarConfig";
import OrgSidebarNav from "./OrgSidebarNav";
import OrgAuthenticatedUserCard from "./OrgAuthenticatedUserCard";

// ----------------------------------------------------------------------

/**
 * OrgAppSidebar — Sidebar for the organization dashboard.
 *
 * Structure:
 *   Header  — Logo + collapse trigger
 *   Content — Main nav items (with collapsible groups)
 *   Footer  — Settings, Support (bottom items) + user card
 */
const OrgAppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({
  ...props
}): JSX.Element => {
  const { main, bottom } = organizationDashboardSidebarConfig;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-r-secondary-200 dark:border-secondary-600"
      {...props}
    >
      {/* ── Header ── */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem
            className={clsx(
              "flex items-center justify-between",
              "group-data-[collapsible=icon]:justify-center",
            )}
          >
            <Link
              to={PAGE_ORGANIZATION_DASHBOARD.analytics.absolutePath}
              className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
            >
              <img
                src={AppLogoDark}
                alt="MeetFlow"
                className="h-9 dark:hidden"
              />
              <img
                src={AppLogoLight}
                alt="MeetFlow"
                className="h-9 hidden dark:block"
              />
            </Link>

            <SidebarTrigger
              className={clsx(
                "rounded-lg text-secondary-300 dark:text-secondary-500",
                "group-data-[collapsible=icon]:mx-auto",
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Main nav ── */}
      <SidebarContent className="px-4 pt-2 pb-0 flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <OrgSidebarNav items={main} />
        </div>
      </SidebarContent>

      {/* ── Footer — bottom items + user card ── */}
      <SidebarFooter className="p-4 flex flex-col gap-2">
        <Separator className="mb-2 group-data-[collapsible=icon]:hidden" />
        <OrgSidebarNav items={bottom} />
        <div className="mt-2">
          <OrgAuthenticatedUserCard />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default OrgAppSidebar;
