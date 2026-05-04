/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  description?: string;
  is_system?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_system?: boolean;
}

export interface BulkCreateRolesRequest {
  items: CreateRoleRequest[];
}

export interface BulkUpdateRolesRequest {
  items: Array<{ id: number } & UpdateRoleRequest>;
}

export interface BulkDeleteRolesRequest {
  ids: number[];
}

export interface GetAllRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Roles ────────────────────────────────────────────────────────────

/**
 * Fetches all master roles with optional pagination/search.
 *
 * @param {GetAllRolesParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllRolesRequest = (
  params?: GetAllRolesParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.ROLES.GET_ALL, { params })
    .then((response) => response.data);
};

// ─── Get Role By ID ───────────────────────────────────────────────────────────

/**
 * Fetches a single role by its ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getRoleByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.ROLES.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create Role ──────────────────────────────────────────────────────────────

/**
 * Creates a new master role.
 *
 * @param {CreateRoleRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createRoleRequest = (
  reqData: CreateRoleRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ROLES.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update Role ──────────────────────────────────────────────────────────────

/**
 * Updates an existing master role.
 *
 * @param {string} id
 * @param {UpdateRoleRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateRoleRequest = (
  id: string,
  reqData: UpdateRoleRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ROLES.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Delete Role ──────────────────────────────────────────────────────────────

/**
 * Deletes a master role by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteRoleRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.ROLES.DELETE(id))
    .then((response) => response.data);
};

// ─── Bulk Create Roles ────────────────────────────────────────────────────────

/**
 * Creates multiple roles in a single request.
 *
 * @param {BulkCreateRolesRequest} reqData - { items: [...] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkCreateRolesRequest = (
  reqData: BulkCreateRolesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ROLES.BULK_CREATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Update Roles ────────────────────────────────────────────────────────

/**
 * Updates multiple roles in a single request.
 * Each item must include an `id`.
 *
 * @param {BulkUpdateRolesRequest} reqData - { items: [{ id, ...fields }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkUpdateRolesRequest = (
  reqData: BulkUpdateRolesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ROLES.BULK_UPDATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Roles ────────────────────────────────────────────────────────

/**
 * Deletes multiple roles by their IDs.
 *
 * @param {BulkDeleteRolesRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeleteRolesRequest = (
  reqData: BulkDeleteRolesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ROLES.BULK_DELETE, reqData)
    .then((response) => response.data);
};
