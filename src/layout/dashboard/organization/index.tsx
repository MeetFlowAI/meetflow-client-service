/* Imports */
import React, { type JSX } from "react";

/* Local Imports */
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import OrgAppSidebar from "./components/OrgAppSidebar";

// ----------------------------------------------------------------------

export interface OrgDashboardLayoutProps {
  children: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * OrgDashboardLayout — outer shell for all organization dashboard pages.
 * Uses shadcn SidebarProvider + the custom org sidebar.
 */
const OrgDashboardLayout: React.FC<OrgDashboardLayoutProps> = ({
  children,
}): JSX.Element => {
  return (
    <SidebarProvider>
      <OrgAppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white dark:bg-secondary-800">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OrgDashboardLayout;
