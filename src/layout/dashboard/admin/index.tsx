/* Imports */
import React, { type JSX } from "react";

/* Relative Imports */

/* Local Imports */
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";

// ----------------------------------------------------------------------

/* Interface */

/**
 * Interface used to create outer design layout for all admin dashboard pages.
 *
 * @interface AdminDashboardLayoutProps
 * @property {node} children - contains the child components.
 */
export interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * Outer design layout for all admin dashboard pages
 *
 * @component
 * @param {node} children - contains the child components
 */
const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
}): JSX.Element => {
  /* Hooks */

  /* Output */
  return (
    <SidebarProvider>
      {/* <div className="flex h-screen w-full overflow-hidden bg-secondary-100 dark:bg-secondary-900"> */}
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white dark:bg-secondary-800">
        {children}
      </SidebarInset>
      {/* </div> */}
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
