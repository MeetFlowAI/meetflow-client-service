/**
 * layout/dashboard/workspace/components/listing-panel/shared/PanelSearch.tsx
 *
 * Compact inline search for listing panels.
 * Renders a full-width search field with icon + clear button.
 */

import React, { type JSX } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";

// ----------------------------------------------------------------------

interface PanelSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// ----------------------------------------------------------------------

const PanelSearch: React.FC<PanelSearchProps> = ({
  value,
  onChange,
  placeholder = "Search…",
  className,
}): JSX.Element => (
  <div className={clsx("px-2 py-2 shrink-0", className)}>
    <div
      className={clsx(
        "relative flex items-center h-7 rounded-lg",
        "bg-secondary-100 dark:bg-secondary-800/80",
        "border border-secondary-200 dark:border-secondary-700",
        "focus-within:border-primary-400/50 dark:focus-within:border-primary-500/40",
        "transition-colors",
      )}
    >
      <Search className="absolute left-2.5 h-3 w-3 text-secondary-400 dark:text-secondary-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full h-full pl-7 pr-6 bg-transparent outline-none",
          "text-xs text-secondary-700 dark:text-secondary-200",
          "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  </div>
);

export default PanelSearch;
