/* Imports */
import { memo, useState, type JSX } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export type ColumnAlign = "left" | "center" | "right";

export interface TableColumn<TRow> {
  key: string;
  label: string;
  render: (row: TRow) => React.ReactNode;
  align?: ColumnAlign;
  width?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface DeleteConfirmConfig {
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export interface PaginatedTableProps<TRow> {
  columns: TableColumn<TRow>[];
  rows: TRow[];
  rowKey?: keyof TRow;

  isLoading?: boolean;
  errorMessage?: string | null;

  emptyTitle?: string;
  emptySubtitle?: string;

  // Row selection
  selectedRows?: Set<string | number>;
  onRowSelect?: (id: string | number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;

  // Built-in row actions
  onRowView?: (row: TRow) => void;
  onRowEdit?: (row: TRow) => void;
  onRowDelete?: (row: TRow) => void;
  deleteConfirm?: DeleteConfirmConfig;

  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;

  className?: string;
}

// ----------------------------------------------------------------------

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];
const SKELETON_ROW_COUNT = 7;

// ----------------------------------------------------------------------

/**
 * PaginatedTable — modern, aesthetic data table used across all master-dashboard sections.
 *
 * Features:
 *  - Zebra striped rows with hover highlight
 *  - Skeleton loaders, empty state, error state
 *  - Checkbox row selection
 *  - Per-row actions (View, Edit, Delete) shown on row hover
 *  - Delete confirmation via AlertDialog
 *  - Full pagination: first / prev / current / next / last + rows-per-page
 *  - Full light + dark mode via design-system colours
 */
function PaginatedTable<TRow>({
  columns,
  rows,
  rowKey = "id" as keyof TRow,
  isLoading = false,
  errorMessage,
  emptyTitle = "No results found",
  emptySubtitle = "Try adjusting your search or filters.",
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRowView,
  onRowEdit,
  onRowDelete,
  deleteConfirm,
  pagination,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  className,
}: PaginatedTableProps<TRow>): JSX.Element {
  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<TRow | null>(null);

  const hasSelection = Boolean(selectedRows && onRowSelect);
  const hasActions = Boolean(onRowView || onRowEdit || onRowDelete);
  const totalColumns =
    columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

  const allSelected =
    hasSelection &&
    rows.length > 0 &&
    rows.every((r) => selectedRows!.has(r[rowKey] as string | number));
  const someSelected =
    hasSelection &&
    rows.some((r) => selectedRows!.has(r[rowKey] as string | number));

  // Pagination
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
  } = pagination ?? {};
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <>
      <div
        className={clsx(
          "flex flex-col gap-4 min-h-0 flex-1 overflow-hidden",
          className,
        )}
      >
        {/* ── Table ── */}
        <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 overflow-hidden shadow-sm flex-1 min-h-0 flex flex-col">
          <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-secondary-200 dark:scrollbar-thumb-secondary-600 scrollbar-track-transparent">
            <Table>
              {/* Header */}
              <TableHeader>
                <TableRow className="bg-secondary-50 dark:bg-secondary-700/60 hover:bg-secondary-50 dark:hover:bg-secondary-700/60 border-b border-secondary-100 dark:border-secondary-700">
                  {hasSelection && (
                    <TableHead className="sticky top-0 z-10 w-11 px-4 py-3.5">
                      <Checkbox
                        checked={allSelected}
                        data-state={
                          someSelected && !allSelected
                            ? "indeterminate"
                            : undefined
                        }
                        onCheckedChange={(c) => onSelectAll?.(Boolean(c))}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                  )}

                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={clsx(
                        "sticky top-0 z-10",
                        "bg-information-500 dark:bg-primary-800 px-4 py-3.5 whitespace-nowrap",
                        typography.semibold14,
                        "text-secondary-100 dark:text-secondary-300 tracking-wider",
                        col.align ? ALIGN_CLASS[col.align] : ALIGN_CLASS.left,
                        col.width,
                      )}
                    >
                      {col.label}
                    </TableHead>
                  ))}

                  {hasActions && (
                    <TableHead
                      className={clsx(
                        "sticky top-0 z-10",
                        "px-4 py-3.5 w-px bg-information-500 dark:bg-primary-800 text-secondary-100 dark:text-secondary-300 ",
                        typography.semibold14,
                      )}
                    >
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              {/* Body */}
              <TableBody>
                {/* Loading skeletons */}
                {isLoading &&
                  Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <TableRow
                      key={`sk-${i}`}
                      className="border-b border-secondary-50 dark:border-secondary-700/30 hover:bg-transparent"
                    >
                      {hasSelection && (
                        <TableCell className="px-4 py-4">
                          <Skeleton className="h-4 w-4 rounded" />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell key={col.key} className="px-4 py-4">
                          <Skeleton
                            className={clsx(
                              "h-4 rounded-lg",
                              ["w-4/5", "w-1/2", "w-2/3", "w-3/5", "w-3/4"][
                                i % 5
                              ],
                            )}
                          />
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell className="px-4 py-4">
                          <div className="flex gap-1 justify-end">
                            <Skeleton className="h-7 w-7 rounded-lg" />
                            <Skeleton className="h-7 w-7 rounded-lg" />
                            <Skeleton className="h-7 w-7 rounded-lg" />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                {/* Error */}
                {!isLoading && errorMessage && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={totalColumns}
                      className="h-52 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                          <span className="text-2xl">⚠️</span>
                        </div>
                        <p
                          className={clsx(
                            typography.medium14,
                            "text-red-500 dark:text-red-400",
                          )}
                        >
                          {errorMessage}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty */}
                {!isLoading && !errorMessage && rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={totalColumns}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                          <Inbox className="h-6 w-6 text-secondary-300 dark:text-secondary-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p
                            className={clsx(
                              typography.semibold14,
                              "text-secondary-700 dark:text-secondary-300",
                            )}
                          >
                            {emptyTitle}
                          </p>
                          <p
                            className={clsx(
                              typography.regular14,
                              "text-secondary-400 dark:text-secondary-500",
                            )}
                          >
                            {emptySubtitle}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  !errorMessage &&
                  rows.map((row, rowIdx) => {
                    const id = row[rowKey] as string | number;
                    const isSelected = hasSelection && selectedRows!.has(id);

                    return (
                      <TableRow
                        key={String(id)}
                        data-state={isSelected ? "selected" : undefined}
                        className={clsx(
                          // subtle zebra
                          rowIdx % 2 === 0
                            ? "bg-white dark:bg-secondary-800"
                            : "bg-secondary-50/50 dark:bg-secondary-700/20",
                          "border-b border-secondary-50 dark:border-secondary-700/30",
                          "hover:bg-information-50/50 dark:hover:bg-information-900/10",
                          "transition-colors duration-100 group",
                          isSelected &&
                            "bg-information-50 dark:bg-information-900/15 hover:bg-information-50 dark:hover:bg-information-900/15",
                        )}
                      >
                        {/* Checkbox */}
                        {hasSelection && (
                          <TableCell
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(c) =>
                                onRowSelect?.(id, Boolean(c))
                              }
                              aria-label={`Select row ${String(id)}`}
                            />
                          </TableCell>
                        )}

                        {/* Data cells */}
                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            className={clsx(
                              "px-4 py-3.5",
                              col.align
                                ? ALIGN_CLASS[col.align]
                                : ALIGN_CLASS.left,
                            )}
                          >
                            {col.render(row)}
                          </TableCell>
                        ))}

                        {/* Row actions — visible on hover */}
                        {hasActions && (
                          <TableCell
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-0.5  transition-opacity duration-150">
                              {/* View */}
                              {onRowView && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRowView(row);
                                      }}
                                      className="h-7 w-7 p-0 rounded-lg text-secondary-400 hover:text-information-500 hover:bg-information-50 dark:hover:bg-information-900/20"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    View details
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Edit */}
                              {onRowEdit && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRowEdit(row);
                                      }}
                                      className="h-7 w-7 p-0 rounded-lg text-secondary-400 hover:text-information-500 hover:bg-information-50 dark:hover:bg-information-900/20"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Edit
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Delete — triggers confirm dialog */}
                              {onRowDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDelete(row);
                                      }}
                                      className="h-7 w-7 p-0 rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Delete
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            {/* Count */}
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-400 dark:text-secondary-500 shrink-0",
              )}
            >
              {totalItems === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span
                    className={clsx(
                      typography.semibold14,
                      "text-secondary-700 dark:text-secondary-200",
                    )}
                  >
                    {startItem}–{endItem}
                  </span>{" "}
                  of{" "}
                  <span
                    className={clsx(
                      typography.semibold14,
                      "text-secondary-700 dark:text-secondary-200",
                    )}
                  >
                    {totalItems.toLocaleString()}
                  </span>
                </>
              )}
            </p>

            <div className="flex items-center gap-3">
              {/* Rows per page */}
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      typography.regular14,
                      "text-secondary-400 dark:text-secondary-500 shrink-0 hidden sm:block",
                    )}
                  >
                    Rows
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => onPageSizeChange(Number(v))}
                  >
                    <SelectTrigger
                      className={clsx(
                        "h-8 w-16 rounded-lg border-2 border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800",
                        typography.regular14,
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Page buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(1)}
                  disabled={!canGoPrev}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800"
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={!canGoPrev}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span
                  className={clsx(
                    "flex items-center gap-1.5 px-1",
                    typography.medium14,
                    "text-secondary-400 dark:text-secondary-500",
                  )}
                >
                  <span className="h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-information-500 text-white px-2.5">
                    {currentPage}
                  </span>
                  <span>/ {totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(totalPages)}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-secondary-100 dark:border-secondary-600 bg-white dark:bg-secondary-800"
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation dialog (controlled, outside table DOM) ── */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 dark:bg-red-900/20">
              <Trash2 className="h-7 w-7 text-red-500" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {deleteConfirm?.title ?? "Delete this record?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.description ??
                "This action is permanent and cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              size="medium"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="medium"
              className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-none"
              onClick={() => {
                if (pendingDelete) onRowDelete?.(pendingDelete);
                setPendingDelete(null);
              }}
            >
              {deleteConfirm?.confirmLabel ?? "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default memo(PaginatedTable) as typeof PaginatedTable;
