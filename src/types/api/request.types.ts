// ── Shared request parameter types ───────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface SearchParams {
  search?: string;
}

export interface BaseListParams extends PaginationParams, SortParams, SearchParams {}

export type DateRangeParams = {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
};

export type StatusFilter = "all" | "active" | "inactive";
