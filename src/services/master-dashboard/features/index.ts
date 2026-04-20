/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateFeatureRequest {
  feature_key: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateFeatureRequest {
  feature_key?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface BulkCreateFeaturesRequest {
  items: CreateFeatureRequest[];
}

export interface BulkUpdateFeaturesRequest {
  items: Array<{ id: number } & UpdateFeatureRequest>;
}

export interface BulkDeleteFeaturesRequest {
  ids: number[];
}

export interface GetAllFeaturesParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Features ─────────────────────────────────────────────────────────

/**
 * Fetches all features with optional pagination/search.
 *
 * @param {GetAllFeaturesParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllFeaturesRequest = (
  params?: GetAllFeaturesParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.FEATURES.GET_ALL, { params })
    .then((response) => response.data);
};

// ─── Get Feature By ID ────────────────────────────────────────────────────────

/**
 * Fetches a single feature by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getFeatureByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.FEATURES.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create Feature ───────────────────────────────────────────────────────────

/**
 * Creates a new feature.
 *
 * @param {CreateFeatureRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createFeatureRequest = (
  reqData: CreateFeatureRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.FEATURES.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update Feature ───────────────────────────────────────────────────────────

/**
 * Updates an existing feature.
 *
 * @param {string} id
 * @param {UpdateFeatureRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateFeatureRequest = (
  id: string,
  reqData: UpdateFeatureRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.FEATURES.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Delete Feature ───────────────────────────────────────────────────────────

/**
 * Deletes a feature by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteFeatureRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.FEATURES.DELETE(id))
    .then((response) => response.data);
};

// ─── Bulk Create Features ─────────────────────────────────────────────────────

/**
 * Creates multiple features in a single request.
 *
 * @param {BulkCreateFeaturesRequest} reqData - { items: [...] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkCreateFeaturesRequest = (
  reqData: BulkCreateFeaturesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.FEATURES.BULK_CREATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Update Features ─────────────────────────────────────────────────────

/**
 * Updates multiple features in a single request.
 * Each item must include an `id`.
 *
 * @param {BulkUpdateFeaturesRequest} reqData - { items: [{ id, ...fields }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkUpdateFeaturesRequest = (
  reqData: BulkUpdateFeaturesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.FEATURES.BULK_UPDATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Features ─────────────────────────────────────────────────────

/**
 * Deletes multiple features by their IDs.
 *
 * @param {BulkDeleteFeaturesRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeleteFeaturesRequest = (
  reqData: BulkDeleteFeaturesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.FEATURES.BULK_DELETE, reqData)
    .then((response) => response.data);
};
