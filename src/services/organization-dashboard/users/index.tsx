/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GetAllOrgUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Org Users ────────────────────────────────────────────────────────

/**
 * Fetches all users (members) in the organization's tenant schema.
 *
 * @param {GetAllOrgUsersParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllOrgUsersRequest = (
  params?: GetAllOrgUsersParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.USERS.GET_ALL, { params })
    .then((response) => response.data.data);
};

// ─── Get Org User By ID ───────────────────────────────────────────────────────

/**
 * Fetches a single organization user by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getOrgUserByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.USERS.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Delete Org User ──────────────────────────────────────────────────────────

/**
 * Removes a user from the organization (hard delete from tenant schema).
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteOrgUserRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.ORGANIZATION.USERS.DELETE(id))
    .then((response) => response.data);
};

// ─── Activate Org User ────────────────────────────────────────────────────────

/**
 * Re-activates a previously deactivated organization user.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const activateOrgUserRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.ORGANIZATION.USERS.ACTIVATE(id))
    .then((response) => response.data);
};

// ─── Deactivate Org User ──────────────────────────────────────────────────────

/**
 * Deactivates an organization user (sets is_active = false).
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deactivateOrgUserRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.ORGANIZATION.USERS.DEACTIVATE(id))
    .then((response) => response.data);
};
