/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface UpdateOrgSettingsRequest {
  name?: string;
  display_name?: string;
  official_email?: string;
  logo?: string;
  domain?: string;
}

// ─── Get Org Profile ──────────────────────────────────────────────────────────

/**
 * Fetches the authenticated organization's profile from the tenant schema.
 *
 * @returns {Promise<ApiResponse>}
 */
export const getOrgProfileRequest = (): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.PROFILE.GET)
    .then((response) => response.data);
};

// ─── Update Org Settings ──────────────────────────────────────────────────────

/**
 * Updates the authenticated organization's settings.
 *
 * @param {UpdateOrgSettingsRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateOrgSettingsRequest = (
  reqData: UpdateOrgSettingsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.ORGANIZATION.PROFILE.UPDATE, reqData)
    .then((response) => response.data);
};
