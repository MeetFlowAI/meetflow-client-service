/* ============================================================
   MeetFlow V2 — API Type Contracts
   
   These types define the shape of all API responses.
   They live in src/types/api/ because they are shared
   across multiple feature modules.
   
   Feature-specific request/response shapes that are only
   used by one module belong in that module's models/ folder.
   ============================================================ */

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ── Standard API response envelope ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
  /** Field-level validation errors from class-validator */
  errors?: Record<string, string[]>;
}

// ── Typed API error class ─────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string[]> | undefined;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);

    this.name = "ApiError";

    this.status = status;
    this.errors = errors;
  }

  /** True when the server returned validation errors */
  get hasValidationErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }

  /** True when the user is not authenticated */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the user lacks permission */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True when the resource does not exist */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True when the server encountered an unexpected error */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}
