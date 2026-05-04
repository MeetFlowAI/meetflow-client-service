/* Local Imports */
import type { ApiResponse } from "@/models";
import axiosConfig from "@/lib/axios";
import API_ENDPOINTS from "../endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Get Profile ──────────────────────────────────────────────────────────────

/**
 * Retrieves the current authenticated user's profile.
 *
 * @returns {Promise<ApiResponse>}
 */
export const getUserProfileRequest = (): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ACCOUNT.GET_PROFILE)
    .then((response) => response.data);
};

// ─── Update Profile ───────────────────────────────────────────────────────────

/**
 * Updates the current user's profile (first_name, last_name).
 *
 * @param {UpdateProfileRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateProfileRequest = (
  reqData: UpdateProfileRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.ACCOUNT.UPDATE_PROFILE, reqData)
    .then((response) => response.data);
};

// ─── Change Password ──────────────────────────────────────────────────────────

/**
 * Changes the current user's password.
 * Requires current password for verification.
 *
 * @param {ChangePasswordRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const changePasswordRequest = (
  reqData: ChangePasswordRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .put(API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD, reqData)
    .then((response) => response.data);
};
