/* Imports */
import { memo, useCallback, type JSX } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  label: string;
  options: FilterOption[];
}

export interface SectionActionsProps {
  // Search
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;

  // Sort
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortDirection?: "asc" | "desc";
  onSortDirectionToggle?: () => void;

  // Filters
  filterGroups?: FilterGroup[];
  activeFilters?: Set<string>;
  onFilterChange?: (value: string, checked: boolean) => void;
  onClearFilters?: () => void;

  // Refresh
  onRefresh?: () => void;
  isRefreshing?: boolean;

  className?: string;
}

// ----------------------------------------------------------------------

/**
 * SectionActions — search bar on the left, Sort / Filter / Refresh controls on the right.
 * All state is controlled. Search and controls are wired together — the parent drives everything.
 */
const SectionActions = ({
  searchValue,
  searchPlaceholder = "Search…",
  onSearchChange,
  sortOptions,
  sortValue,
  onSortChange,
  sortDirection = "asc",
  onSortDirectionToggle,
  filterGroups,
  activeFilters = new Set(),
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
  className,
}: SectionActionsProps): JSX.Element => {
  const activeFilterCount = activeFilters.size;
  const activeSortLabel = sortOptions?.find(
    (o) => o.value === sortValue,
  )?.label;

  const handleClear = useCallback(() => onSearchChange(""), [onSearchChange]);

  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between",
        className,
      )}
    >
      {/* ── Search bar ── */}
      <div className="relative flex-1 sm:max-w-sm group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 dark:text-secondary-500 pointer-events-none transition-colors group-focus-within:text-information-500 " />
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10 pr-8"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        {sortOptions && sortOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={clsx(
                  "h-[38px] gap-2 rounded-[10px] border-2 px-3",
                  "border-secondary-100 dark:border-secondary-600",
                  "bg-white dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-300",
                  "hover:border-information-500 dark:hover:border-information-500",
                  "hover:text-information-600 dark:hover:text-information-400",
                  "transition-all duration-150",
                  sortValue &&
                    "border-information-300 dark:border-information-700 text-information-600 dark:text-information-400",
                )}
              >
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                {/* <span className={clsx(typography.medium14)}>
                  {activeSortLabel
                    ? `${activeSortLabel} (${sortDirection === "asc" ? "A→Z" : "Z→A"})`
                    : "Sort"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" /> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* <DropdownMenuLabel
                className={clsx(
                  typography.semibold12,
                  "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-2 py-1.5",
                )}
              >
                Sort by
              </DropdownMenuLabel> */}
              <DropdownMenuRadioGroup
                value={sortValue}
                onValueChange={onSortChange}
              >
                {sortOptions.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                    className={clsx(typography.regular14)}
                  >
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              {sortValue && onSortDirectionToggle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel
                    className={clsx(
                      typography.semibold12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-2 py-1.5",
                    )}
                  >
                    Direction
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortDirection}
                    onValueChange={(v) => {
                      if (v !== sortDirection) onSortDirectionToggle();
                    }}
                  >
                    <DropdownMenuRadioItem
                      value="asc"
                      className={clsx(typography.regular14)}
                    >
                      Ascending (A → Z)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="desc"
                      className={clsx(typography.regular14)}
                    >
                      Descending (Z → A)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filter */}
        {filterGroups && filterGroups.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={clsx(
                  "h-[38px] gap-2 rounded-[10px] border-2 px-3",
                  "border-secondary-100 dark:border-secondary-600",
                  "bg-white dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-300",
                  "hover:border-information-500 dark:hover:border-information-500",
                  "hover:text-information-600 dark:hover:text-information-400",
                  "transition-all duration-150",
                  activeFilterCount > 0 &&
                    "border-information-300 dark:border-information-700 text-information-600 dark:text-information-400",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                {/* <span className={clsx(typography.medium14)}>Filter</span> */}
                {/* {activeFilterCount > 0 && (
                  <Badge className="h-4 min-w-4 px-1 rounded-full bg-information-500 text-white text-[10px] font-semibold -mr-0.5">
                    {activeFilterCount}
                  </Badge>
                )} */}
                {/* <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" /> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {filterGroups.map((group, idx) => (
                <div key={group.label}>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel
                    className={clsx(
                      typography.semibold12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-2 py-1.5",
                    )}
                  >
                    {group.label}
                  </DropdownMenuLabel>
                  {group.options.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={activeFilters.has(opt.value)}
                      onCheckedChange={(checked) =>
                        onFilterChange?.(opt.value, checked)
                      }
                      className={clsx(typography.regular14)}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              ))}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className={clsx(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm",
                      "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
                      "transition-colors duration-150",
                      typography.medium14,
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Separator before refresh */}
        {/* {(sortOptions || filterGroups) && onRefresh && (
          <Separator orientation="vertical" className="h-6" />
        )} */}

        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={clsx(
              "h-[38px] w-[38px] p-0 rounded-[10px] border-2 shrink-0",
              "border-secondary-100 dark:border-secondary-600",
              "bg-white dark:bg-secondary-800",
              "text-secondary-500 dark:text-secondary-400",
              "hover:border-information-500 hover:text-information-500",
              "dark:hover:border-information-500 dark:hover:text-information-400",
              "transition-all duration-150",
            )}
            aria-label="Refresh"
          >
            <RefreshCw
              className={clsx("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(SectionActions);
