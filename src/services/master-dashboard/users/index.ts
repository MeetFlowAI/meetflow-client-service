/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface BulkCreateUsersRequest {
  items: CreateUserRequest[];
}

export interface BulkUpdateUsersRequest {
  items: Array<{ id: number } & UpdateUserRequest>;
}

export interface BulkDeleteUsersRequest {
  ids: number[];
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Users ────────────────────────────────────────────────────────────

/**
 * Fetches all master users with optional pagination/search.
 *
 * @param {GetAllUsersParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllUsersRequest = (
  params?: GetAllUsersParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.USERS.GET_ALL, { params })
    .then((response) => response.data);
};

// ─── Get User By ID ───────────────────────────────────────────────────────────

/**
 * Fetches a single master user by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getUserByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.USERS.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create User ──────────────────────────────────────────────────────────────

/**
 * Creates a new master user.
 *
 * @param {CreateUserRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createUserRequest = (
  reqData: CreateUserRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.USERS.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update User ──────────────────────────────────────────────────────────────

/**
 * Updates an existing master user.
 *
 * @param {string} id
 * @param {UpdateUserRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateUserRequest = (
  id: string,
  reqData: UpdateUserRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.USERS.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Delete User ──────────────────────────────────────────────────────────────

/**
 * Deletes a master user by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteUserRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.USERS.DELETE(id))
    .then((response) => response.data);
};

// ─── Bulk Create Users ────────────────────────────────────────────────────────

/**
 * Creates multiple master users in a single request.
 *
 * @param {BulkCreateUsersRequest} reqData - { items: [...] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkCreateUsersRequest = (
  reqData: BulkCreateUsersRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.USERS.BULK_CREATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Update Users ────────────────────────────────────────────────────────

/**
 * Updates multiple master users in a single request.
 * Each item must include an `id`.
 *
 * @param {BulkUpdateUsersRequest} reqData - { items: [{ id, ...fields }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkUpdateUsersRequest = (
  reqData: BulkUpdateUsersRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.USERS.BULK_UPDATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Users ────────────────────────────────────────────────────────

/**
 * Deletes multiple master users by their IDs.
 *
 * @param {BulkDeleteUsersRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeleteUsersRequest = (
  reqData: BulkDeleteUsersRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.USERS.BULK_DELETE, reqData)
    .then((response) => response.data);
};
