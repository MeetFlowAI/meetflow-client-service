/**
 * layout/dashboard/workspace/components/listing-panel/panels/HomePanel.tsx
 *
 * Listing panel content shown when the "Home" nav item is active.
 * Shows quick-action links to Channels and Chats.
 *
 * Extracted from WorkspaceListingPanel (was HomeListingPanel inline fn).
 * Kept intentionally lightweight — just navigation shortcuts.
 */

import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Hash, MessageCircle, Users, Zap } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { ScrollArea } from "@/components/ui/scroll-area";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface QuickAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  action: () => void;
}

// ----------------------------------------------------------------------

const HomePanel: React.FC = (): JSX.Element => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      label: "Channels",
      description: "Browse and join channels",
      icon: Hash,
      colorClass: "text-violet-600 dark:text-violet-400",
      bgClass: "bg-violet-50 dark:bg-violet-500/10",
      action: () => navigate(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath),
    },
    {
      label: "Direct Messages",
      description: "Message your teammates",
      icon: MessageCircle,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-500/10",
      action: () => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath),
    },
    {
      label: "Members",
      description: "See who's in this workspace",
      icon: Users,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
      action: () => navigate(PAGE_WORKSPACE_DASHBOARD.members.absolutePath),
    },
  ];

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-3 space-y-4">
        {/* Section label */}
        <div className="flex items-center gap-1.5 px-1 pt-1">
          <Zap className="h-3 w-3 text-amber-500" />
          <span
            className={clsx(
              typography.semibold12,
              "text-secondary-400 dark:text-secondary-500 uppercase tracking-widest",
            )}
            style={{ fontSize: "10px" }}
          >
            Quick Access
          </span>
        </div>

        {/* Quick action cards */}
        <div className="space-y-1">
          {quickActions.map(
            ({
              label,
              description,
              icon: Icon,
              colorClass,
              bgClass,
              action,
            }) => (
              <button
                key={label}
                onClick={action}
                className={clsx(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl text-left",
                  "border border-secondary-100 dark:border-secondary-800",
                  "bg-white dark:bg-secondary-800/40",
                  "hover:border-secondary-200 dark:hover:border-secondary-700",
                  "hover:bg-secondary-50 dark:hover:bg-secondary-800",
                  "transition-all duration-150 group",
                )}
              >
                {/* Icon */}
                <div
                  className={clsx(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    "transition-transform duration-150 group-hover:scale-105",
                    bgClass,
                  )}
                >
                  <Icon className={clsx("h-4 w-4", colorClass)} />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p
                    className={clsx(
                      typography.medium14,
                      "text-secondary-800 dark:text-secondary-100 leading-snug",
                    )}
                  >
                    {label}
                  </p>
                  <p
                    className={clsx(
                      "text-secondary-400 dark:text-secondary-500 truncate",
                    )}
                    style={{ fontSize: "11px" }}
                  >
                    {description}
                  </p>
                </div>
              </button>
            ),
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-secondary-100 dark:border-secondary-800" />

        {/* Help text */}
        <p
          className={clsx(
            typography.regular12,
            "text-secondary-400 dark:text-secondary-500 px-1 leading-relaxed",
          )}
        >
          Select a section from the left to get started, or use the nav rail
          above.
        </p>
      </div>
    </ScrollArea>
  );
};

export default HomePanel;
