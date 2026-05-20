/* ============================================================
   MeetFlow V2 — HTTP Client

   Single axios instance used by all API service functions.
   Import { http } wherever you need to make API calls.

   INTERCEPTORS:
     Request  → Attach Bearer token from tokenService
     Response → Handle 401 (silent refresh + retry),
                Handle 403 (log + surface),
                Handle 500+ (log + surface)

   TOKEN REFRESH QUEUE:
     If multiple requests fail with 401 simultaneously,
     only ONE refresh call is made. All other failing
     requests are queued and retried after the refresh
     completes (or rejected if the refresh fails).
   ============================================================ */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { API_TIMEOUT_MS } from "@/config/constants";
import { tokenService } from "@/infrastructure/auth/token.service";
import { ApiError } from "@/types/api/pagination.types";

// ── Base instance ─────────────────────────────────────────────────────────────

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Refresh queue ─────────────────────────────────────────────────────────────
// Queues requests that arrive while a token refresh is in progress.

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function flushQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error);
    } else if (token) {
      entry.resolve(token);
    }
  });
  failedQueue = [];
}

// ── Request interceptor ───────────────────────────────────────────────────────

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// ── Response interceptor ──────────────────────────────────────────────────────

http.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401: Attempt silent token refresh ───────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(http(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        // No refresh token — user must sign in again
        isRefreshing = false;
        flushQueue(error, null);
        tokenService.clearTokens();
        redirectToSignIn();
        return Promise.reject(toApiError(error));
      }

      try {
        // Use native fetch to avoid triggering this interceptor recursively
        const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = (await res.json()) as {
          access_token: string;
          refresh_token: string;
        };

        tokenService.setTokens(data.access_token, data.refresh_token);
        http.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

        flushQueue(null, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return http(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        tokenService.clearTokens();
        redirectToSignIn();
        return Promise.reject(toApiError(error));
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: Forbidden ───────────────────────────────────────────────────────
    if (error.response?.status === 403) {
      console.warn("[http] 403 Forbidden:", originalRequest.url);
    }

    // ── 500+: Server error ───────────────────────────────────────────────────
    if (error.response && error.response.status >= 500) {
      console.error("[http] Server error:", error.response.status, originalRequest.url);
    }

    return Promise.reject(toApiError(error));
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as
    | {
        message?: string;
        errors?: Record<string, string[]>;
      }
    | undefined;
  const message = data?.message ?? error.message ?? "An unexpected error occurred";
  const errors = data?.errors;
  return new ApiError(status, message, errors);
}

function redirectToSignIn(): void {
  // Push to sign-in without React Router to avoid circular imports.
  // The AuthGuard will take over once React re-renders.
  if (typeof window !== "undefined") {
    window.location.href = "/auth/sign-in";
  }
}
