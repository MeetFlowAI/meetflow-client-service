/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "../endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignOutRequest {
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  tenantSchema?: string | null;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

/**
 * Authenticates a user and returns access + refresh tokens.
 *
 * @param {SignInRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const signInRequest = (reqData: SignInRequest): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.AUTH.SIGN_IN, reqData)
    .then((response) => response.data);
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Logs out the user by invalidating the refresh token.
 *
 * @param {SignOutRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const signOutRequest = (
  reqData: SignOutRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.AUTH.SIGN_OUT, reqData)
    .then((response) => response.data);
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Exchanges a valid refresh token for a new access token.
 *
 * @param {RefreshTokenRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const refreshTokenRequest = (
  reqData: RefreshTokenRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.AUTH.REFRESH_SESSION, reqData)
    .then((response) => response.data);
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Sends a password reset link to the provided email.
 * Always returns success — server never reveals if the email exists.
 *
 * @param {ForgotPasswordRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const forgotPasswordRequest = (
  reqData: ForgotPasswordRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, reqData)
    .then((response) => response.data);
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Resets the user's password using the token from the reset email.
 * tenantSchema is optional — only required for org users (read from ?schema= query param).
 *
 * @param {ResetPasswordRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const resetPasswordRequest = (
  reqData: ResetPasswordRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.AUTH.RESET_PASSWORD, reqData)
    .then((response) => response.data);
};
