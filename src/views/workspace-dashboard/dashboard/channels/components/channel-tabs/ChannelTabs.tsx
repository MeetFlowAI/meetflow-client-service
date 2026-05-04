/**
 * components/channel-tabs/ChannelTabs.tsx
 *
 * Floating glassmorphic tab pill — Chat | Members (N) | Meetings
 * Floats centered over the content area with frosted glass effect.
 */

import React, { type JSX } from "react";
import clsx from "clsx";
import { MessageSquare, Users, Video, CheckSquare } from "lucide-react";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export type ChannelTab = "chat" | "members" | "meetings" | "tasks";

interface TabConfig {
  id: ChannelTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "members", label: "Members", icon: Users },
  { id: "meetings", label: "Meetings", icon: Video },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
];

// ----------------------------------------------------------------------

interface ChannelTabsProps {
  active: ChannelTab;
  onChange: (tab: ChannelTab) => void;
  memberCount?: number;
  taskCount?: number;
}

// ----------------------------------------------------------------------

const ChannelTabs: React.FC<ChannelTabsProps> = ({
  active,
  onChange,
  memberCount,
  taskCount,
}): JSX.Element => (
  /* Outer strip — sits between header and content, provides the base bg line */
  <div
    className={clsx(
      "relative flex justify-center shrink-0 z-10",
      "px-4 py-2.5",
      "bg-white/60 dark:bg-secondary-900/60 backdrop-blur-md",
      "border-b border-secondary-100/80 dark:border-secondary-800/50",
    )}
  >
    {/* Floating pill container */}
    <div
      role="tablist"
      className={clsx(
        "inline-flex items-center gap-0.5 p-1 rounded-2xl",
        // Glassmorphism
        "bg-white/70 dark:bg-secondary-800/50",
        "backdrop-blur-xl",
        "border border-white/80 dark:border-secondary-700/40",
        "shadow-lg shadow-secondary-900/5 dark:shadow-secondary-900/30",
      )}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const displayLabel =
          id === "members" && memberCount !== undefined
            ? `${label} · ${memberCount}`
            : id === "tasks" && taskCount !== undefined && taskCount > 0
              ? `${label} · ${taskCount}`
              : label;

        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={clsx(
              "relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl",
              "transition-all duration-200 ease-out",
              typography.medium14,
              isActive
                ? [
                    // Active tab: opaque fill with subtle shadow
                    "bg-white dark:bg-secondary-700",
                    "text-secondary-900 dark:text-white",
                    "shadow-sm shadow-secondary-900/8 dark:shadow-secondary-900/40",
                    "border border-secondary-100/60 dark:border-secondary-600/40",
                  ]
                : [
                    // Inactive tab: transparent, muted text
                    "text-secondary-400 dark:text-secondary-500",
                    "hover:text-secondary-600 dark:hover:text-secondary-300",
                    "hover:bg-secondary-50/60 dark:hover:bg-secondary-700/30",
                  ],
            )}
          >
            <Icon
              className={clsx(
                "h-3.5 w-3.5 transition-colors duration-200",
                isActive
                  ? "text-primary-500 dark:text-primary-400"
                  : "text-secondary-400 dark:text-secondary-500",
              )}
            />
            <span className="text-[13px] font-medium">{displayLabel}</span>

            {/* Active dot accent */}
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default ChannelTabs;
