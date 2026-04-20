/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateOrgRoleRequest {
  name: string;
  display_name: string;
  description?: string;
}

export interface UpdateOrgRoleRequest {
  name?: string;
  display_name?: string;
  description?: string;
}

export interface GetAllOrgRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Org Roles ────────────────────────────────────────────────────────

/**
 * Fetches all roles defined in the organization's tenant schema.
 *
 * @param {GetAllOrgRolesParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllOrgRolesRequest = (
  params?: GetAllOrgRolesParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.ROLES.GET_ALL, { params })
    .then((response) => response.data.data);
};

// ─── Get Org Role By ID ───────────────────────────────────────────────────────

/**
 * Fetches a single organization role by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getOrgRoleByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.ROLES.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create Org Role ──────────────────────────────────────────────────────────

/**
 * Creates a new role in the organization.
 *
 * @param {CreateOrgRoleRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createOrgRoleRequest = (
  reqData: CreateOrgRoleRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.ORGANIZATION.ROLES.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update Org Role ──────────────────────────────────────────────────────────

/**
 * Updates an existing organization role.
 *
 * @param {string} id
 * @param {UpdateOrgRoleRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateOrgRoleRequest = (
  id: string,
  reqData: UpdateOrgRoleRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.ORGANIZATION.ROLES.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Delete Org Role ──────────────────────────────────────────────────────────

/**
 * Deletes an organization role by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteOrgRoleRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.ORGANIZATION.ROLES.DELETE(id))
    .then((response) => response.data);
};
