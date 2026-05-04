/* Imports */
import { useState, type JSX } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { type OrgSidebarItem } from "../helper/sidebarConfig";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ----------------------------------------------------------------------

interface OrgSidebarNavProps {
  items: OrgSidebarItem[];
}

// ----------------------------------------------------------------------

/**
 * OrgSidebarNav — renders the org dashboard sidebar navigation.
 *
 * Supports two item types:
 *  1. Direct link — single item with `url`
 *  2. Collapsible group — item with `children[]`
 *     Auto-expands if any child URL matches the current route.
 *
 * Collapsed sidebar (icon-only mode): group triggers show only the icon,
 * children are hidden. Direct links show the icon centred.
 */
const OrgSidebarNav = ({ items }: OrgSidebarNavProps): JSX.Element => {
  const location = useLocation();

  return (
    <SidebarMenu className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <CollapsibleNavGroup
              key={item.name}
              item={item}
              pathname={location.pathname}
            />
          );
        }

        // Direct link
        const isActive = item.url
          ? location.pathname.startsWith(item.url)
          : false;

        return (
          <SidebarMenuItem key={item.name}>
            <Link
              to={item.url!}
              className={clsx(
                "flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200",
                "gap-3 justify-start",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                "text-secondary-600 dark:text-secondary-300",
                !isActive &&
                  "hover:bg-secondary-100 dark:hover:bg-secondary-700",
                isActive && "bg-information-500 text-white dark:bg-primary-800",
              )}
            >
              <item.icon
                className={clsx(
                  "h-5 w-5 shrink-0",
                  "group-data-[collapsible=icon]:mx-auto",
                  isActive
                    ? "text-white"
                    : "text-secondary-500 dark:text-secondary-400",
                )}
              />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden truncate">
                {item.name}
              </span>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

// ----------------------------------------------------------------------

interface CollapsibleNavGroupProps {
  item: OrgSidebarItem;
  pathname: string;
}

const CollapsibleNavGroup = ({
  item,
  pathname,
}: CollapsibleNavGroupProps): JSX.Element => {
  // Auto-open if any child is active
  const isAnyChildActive = item.children!.some((c) =>
    pathname.startsWith(c.url),
  );
  const [open, setOpen] = useState(isAnyChildActive);

  const isGroupActive = isAnyChildActive;

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Group trigger */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={clsx(
              "flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200",
              "gap-3 justify-start",
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              "text-secondary-600 dark:text-secondary-300",
              !isGroupActive &&
                "hover:bg-secondary-100 dark:hover:bg-secondary-700",
              isGroupActive &&
                "bg-information-50 dark:bg-primary-900/20 text-information-700 dark:text-primary-300",
            )}
          >
            <item.icon
              className={clsx(
                "h-5 w-5 shrink-0",
                "group-data-[collapsible=icon]:mx-auto",
                isGroupActive
                  ? "text-information-600 dark:text-primary-400"
                  : "text-secondary-500 dark:text-secondary-400",
              )}
            />
            <span className="flex-1 text-sm font-medium text-left group-data-[collapsible=icon]:hidden truncate">
              {item.name}
            </span>
            <ChevronDown
              className={clsx(
                "h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                "text-secondary-400 dark:text-secondary-500",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>

        {/* Children — hidden in icon mode */}
        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l-2 border-secondary-100 dark:border-secondary-700 pl-3">
            {item.children!.map((child) => {
              const isChildActive = pathname.startsWith(child.url);

              return (
                <Link
                  key={child.name}
                  to={child.url}
                  className={clsx(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    "font-medium",
                    !isChildActive &&
                      "text-secondary-500 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700",
                    isChildActive &&
                      "text-information-600 dark:text-primary-400 bg-information-50 dark:bg-primary-900/20 font-semibold",
                  )}
                >
                  {/* Active indicator dot */}
                  <span
                    className={clsx(
                      "mr-2.5 h-1.5 w-1.5 rounded-full shrink-0 transition-all",
                      isChildActive
                        ? "bg-information-500 dark:bg-primary-400"
                        : "bg-secondary-300 dark:bg-secondary-600",
                    )}
                  />
                  {child.name}
                </Link>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default OrgSidebarNav;
