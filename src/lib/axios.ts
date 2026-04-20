/* Imports */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/* Local Imports */
import { envConfig } from "@/config/envConfig";
import {
  getAccessToken,
  getRefreshToken,
  isValidToken,
  setAccessToken,
  setRefreshToken,
  clearAuthTokens,
} from "@/utilities/auth";
import { PAGE_ROOT } from "@/routes/paths";

// ----------------------------------------------------------------------

const axiosConfig: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Silent refresh state ─────────────────────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests 401 at once.

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processRefreshQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  refreshQueue = [];
};

// ─── Request interceptor — attach access token ────────────────────────────────

axiosConfig.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken && isValidToken(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — silent token refresh on 401 ──────────────────────

axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request (_retry flag)
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    if (originalRequest.url?.includes("refresh-token")) {
      clearAuthTokens();
      window.location.href = PAGE_ROOT.signIn.absolutePath;
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      window.location.href = PAGE_ROOT.signIn.absolutePath;
      return Promise.reject(error);
    }

    // If another refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosConfig(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call the refresh endpoint directly with plain axios to avoid interceptor loop
      const response = await axios.post(
        `${envConfig.apiBaseUrl}/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data?.data || {};

      if (!newAccessToken)
        throw new Error("No access token in refresh response");

      setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);

      axiosConfig.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      processRefreshQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosConfig(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      clearAuthTokens();
      window.location.href = PAGE_ROOT.signIn.absolutePath;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosConfig;
