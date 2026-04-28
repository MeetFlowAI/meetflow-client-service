/**
 * layout/dashboard/workspace/components/topbar/GlobalSearch.tsx
 *
 * Search trigger button in the topbar.
 * Clicking it OR pressing ⌘K opens the CommandPalette.
 *
 * This component is intentionally dumb — it owns only the open/close
 * state of the palette. All search logic lives in CommandPalette.
 */

import React, { useState, useEffect, type JSX } from "react";
import { Search, Command } from "lucide-react";
import clsx from "clsx";

import CommandPalette from "./CommandPalette";

interface GlobalSearchProps {
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/*
       * The trigger looks like a search input but is actually a button.
       * This avoids any focus/blur complexity — the real input lives
       * inside the CommandDialog which handles all of that.
       */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open search (⌘K)"
        className={clsx(
          "flex items-center gap-2 h-8 px-3 rounded-lg w-full",
          "bg-secondary-100 dark:bg-secondary-800",
          "border border-secondary-200 dark:border-secondary-700",
          "hover:border-secondary-300 dark:hover:border-secondary-600",
          "hover:bg-secondary-50 dark:hover:bg-secondary-700/60",
          "transition-all duration-150",
          "text-left cursor-pointer",
          className,
        )}
      >
        <Search className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500 shrink-0" />

        <span className="flex-1 text-sm text-secondary-400 dark:text-secondary-500 truncate">
          Search...
        </span>

        {/* ⌘K hint */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <kbd className="inline-flex items-center justify-center h-4 px-1 rounded text-[10px] font-medium bg-secondary-200 dark:bg-secondary-700 text-secondary-400 dark:text-secondary-500 border border-secondary-300 dark:border-secondary-600">
            <Command className="h-2.5 w-2.5" />
          </kbd>
          <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded text-[10px] font-medium bg-secondary-200 dark:bg-secondary-700 text-secondary-400 dark:text-secondary-500 border border-secondary-300 dark:border-secondary-600">
            K
          </kbd>
        </div>
      </button>

      {/* Command palette — mounts the cmdk dialog */}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default GlobalSearch;
