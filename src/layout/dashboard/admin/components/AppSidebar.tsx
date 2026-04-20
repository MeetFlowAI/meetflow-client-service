/* Imports */
import React, { type JSX } from "react";

/* Relative Imports */
import { Link } from "react-router-dom";

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
import { ROOT_PATH } from "@/routes/paths";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import { useSidebarConfig } from "@/hooks/dashboard/useSidebarConfig";
import SidebarConfigRenderer from "./SidebarConfigRenderer";
import AuthenticatedUserCard from "./AuthenticatedUserCard";
import clsx from "clsx";
// ----------------------------------------------------------------------

/* Interface */

// ----------------------------------------------------------------------

/**
 * AppSidebar component using Shadcn Sidebar, with full typing.
 *
 * @component
 * @param props - All props supported by Sidebar
 * @returns JSX.Element
 */
const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({
  ...props
}): JSX.Element => {
  /* Hooks */
  const { sidebarConfig } = useSidebarConfig();

  /* Functions */
  /* Output */
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-r-secondary-200 dark:border-secondary-600 "
      {...props}
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem
            className={clsx(
              "flex items-center",

              // Expanded layout
              "justify-between",

              // 👉 Collapsed layout FIX
              "group-data-[collapsible=icon]:justify-center",
            )}
          >
            {/* Logo */}
            <Link
              to={ROOT_PATH}
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

            {/* Trigger */}
            <SidebarTrigger
              className={clsx(
                "rounded-lg text-secondary-300 dark:text-secondary-500",

                // 👉 Center properly in collapsed
                "group-data-[collapsible=icon]:mx-auto",
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarConfigRenderer config={sidebarConfig} />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <AuthenticatedUserCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
