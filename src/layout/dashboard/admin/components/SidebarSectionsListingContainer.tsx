/* Imports */
import React, { type JSX } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

/* Local Imports */
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

// ----------------------------------------------------------------------

export interface SidebarSectionsListingContainerProps {
  sections: {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const SidebarSectionsListingContainer: React.FC<
  SidebarSectionsListingContainerProps
> = ({ sections }): JSX.Element => {
  const location = useLocation();

  return (
    <SidebarMenu className="flex flex-col gap-2 px-2 py-2">
      {sections.map((section) => {
        const isActive = location.pathname.startsWith(section.url);

        return (
          <SidebarMenuItem key={section.name}>
            <Link
              to={section.url}
              className={clsx(
                "flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200",

                // Default layout
                "gap-3 justify-start",

                // 👉 Collapsed mode (ICON CENTER FIX)
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",

                // Text color
                "text-secondary-600 dark:text-secondary-300",

                // Hover only when NOT active
                !isActive &&
                  "hover:bg-secondary-100 dark:hover:bg-secondary-700",

                // Active state
                isActive && "bg-information-500 text-white dark:bg-primary-800",
              )}
            >
              {/* Icon */}
              {section.icon && (
                <section.icon
                  className={clsx(
                    "h-5 w-5 shrink-0",

                    // Center icon in collapsed
                    "group-data-[collapsible=icon]:mx-auto",

                    isActive
                      ? "text-white"
                      : "text-secondary-500 dark:text-secondary-400",
                  )}
                />
              )}

              {/* Text */}
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                {section.name}
              </span>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export default SidebarSectionsListingContainer;
