/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillingCycle = "monthly" | "yearly" | "lifetime";

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Plan CRUD
export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  billing_cycle: BillingCycle;
  is_active?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  billing_cycle?: BillingCycle;
  is_active?: boolean;
}

export interface BulkCreatePlansRequest {
  items: CreatePlanRequest[];
}

export interface BulkUpdatePlansRequest {
  items: Array<{ id: number } & UpdatePlanRequest>;
}

export interface BulkDeletePlansRequest {
  ids: number[];
}

export interface GetAllPlansParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// Plan Features
export interface AssignFeatureRequest {
  feature_id: number;
  is_active?: boolean;
}

export interface ToggleFeatureRequest {
  is_active: boolean;
}

export interface BulkAssignFeaturesRequest {
  items: AssignFeatureRequest[];
}

export interface BulkRemoveFeaturesRequest {
  ids: number[];
}

// Plan Limits
export interface AddLimitRequest {
  limit_key: string;
  limit_value: number;
}

export interface UpdateLimitRequest {
  limit_value: number;
}

export interface BulkAddLimitsRequest {
  items: AddLimitRequest[];
}

export interface BulkDeleteLimitsRequest {
  ids: number[];
}

// ─── Get All Plans ────────────────────────────────────────────────────────────

/**
 * Fetches all plans with optional pagination/search.
 *
 * @param {GetAllPlansParams} params
 * @returns {Promise<ApiResponse>}
 */
export const getAllPlansRequest = (
  params?: GetAllPlansParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.PLANS.GET_ALL, { params })
    .then((response) => response.data);
};

// ─── Get Plan By ID ───────────────────────────────────────────────────────────

/**
 * Fetches a single plan by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getPlanByIdRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.PLANS.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create Plan ──────────────────────────────────────────────────────────────

/**
 * Creates a new plan.
 *
 * @param {CreatePlanRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createPlanRequest = (
  reqData: CreatePlanRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update Plan ──────────────────────────────────────────────────────────────

/**
 * Updates an existing plan.
 *
 * @param {string} id
 * @param {UpdatePlanRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updatePlanRequest = (
  id: string,
  reqData: UpdatePlanRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.PLANS.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Delete Plan ──────────────────────────────────────────────────────────────

/**
 * Deletes a plan by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deletePlanRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.PLANS.DELETE(id))
    .then((response) => response.data);
};

// ─── Bulk Create Plans ────────────────────────────────────────────────────────

/**
 * Creates multiple plans in a single request.
 *
 * @param {BulkCreatePlansRequest} reqData - { items: [...] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkCreatePlansRequest = (
  reqData: BulkCreatePlansRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_CREATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Update Plans ────────────────────────────────────────────────────────

/**
 * Updates multiple plans. Each item must include an `id`.
 *
 * @param {BulkUpdatePlansRequest} reqData - { items: [{ id, ...fields }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkUpdatePlansRequest = (
  reqData: BulkUpdatePlansRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.PLANS.BULK_UPDATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Plans ────────────────────────────────────────────────────────

/**
 * Deletes multiple plans by their IDs.
 *
 * @param {BulkDeletePlansRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeletePlansRequest = (
  reqData: BulkDeletePlansRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_DELETE, reqData)
    .then((response) => response.data);
};

// ══════════════════════════════════════════════════════════════════════════════
// PLAN FEATURES
// ══════════════════════════════════════════════════════════════════════════════

// ─── Get Plan Features ────────────────────────────────────────────────────────

/**
 * Retrieves all features assigned to a specific plan.
 *
 * @param {string} planId
 * @returns {Promise<ApiResponse>}
 */
export const getPlanFeaturesRequest = (
  planId: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.PLANS.GET_FEATURES(planId))
    .then((response) => response.data);
};

// ─── Assign Feature to Plan ───────────────────────────────────────────────────

/**
 * Assigns a feature to a plan.
 *
 * @param {string} planId
 * @param {AssignFeatureRequest} reqData - { feature_id, is_active? }
 * @returns {Promise<ApiResponse>}
 */
export const assignFeatureToPlanRequest = (
  planId: string,
  reqData: AssignFeatureRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.ASSIGN_FEATURE(planId), reqData)
    .then((response) => response.data);
};

// ─── Toggle Plan Feature ──────────────────────────────────────────────────────

/**
 * Toggles the active state of a feature on a plan.
 *
 * @param {string} planId
 * @param {string} featureId
 * @param {ToggleFeatureRequest} reqData - { is_active }
 * @returns {Promise<ApiResponse>}
 */
export const togglePlanFeatureRequest = (
  planId: string,
  featureId: string,
  reqData: ToggleFeatureRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(
      API_ENDPOINTS.MASTER.PLANS.TOGGLE_FEATURE(planId, featureId),
      reqData,
    )
    .then((response) => response.data);
};

// ─── Remove Feature from Plan ─────────────────────────────────────────────────

/**
 * Removes a feature from a plan.
 *
 * @param {string} planId
 * @param {string} featureId
 * @returns {Promise<ApiResponse>}
 */
export const removeFeatureFromPlanRequest = (
  planId: string,
  featureId: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.PLANS.REMOVE_FEATURE(planId, featureId))
    .then((response) => response.data);
};

// ─── Bulk Assign Features ─────────────────────────────────────────────────────

/**
 * Assigns multiple features to a plan in one request.
 *
 * @param {string} planId
 * @param {BulkAssignFeaturesRequest} reqData - { items: [{ feature_id, is_active? }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkAssignFeaturesToPlanRequest = (
  planId: string,
  reqData: BulkAssignFeaturesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_ASSIGN_FEATURES(planId), reqData)
    .then((response) => response.data);
};

// ─── Bulk Remove Features ─────────────────────────────────────────────────────

/**
 * Removes multiple features from a plan in one request.
 *
 * @param {string} planId
 * @param {BulkRemoveFeaturesRequest} reqData - { ids: [featureId1, featureId2] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkRemoveFeaturesFromPlanRequest = (
  planId: string,
  reqData: BulkRemoveFeaturesRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_REMOVE_FEATURES(planId), reqData)
    .then((response) => response.data);
};

// ══════════════════════════════════════════════════════════════════════════════
// PLAN LIMITS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Get Plan Limits ──────────────────────────────────────────────────────────

/**
 * Retrieves all limits for a specific plan.
 *
 * @param {string} planId
 * @returns {Promise<ApiResponse>}
 */
export const getPlanLimitsRequest = (planId: string): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.PLANS.GET_LIMITS(planId))
    .then((response) => response.data);
};

// ─── Add Limit to Plan ────────────────────────────────────────────────────────

/**
 * Adds a new limit to a plan.
 *
 * @param {string} planId
 * @param {AddLimitRequest} reqData - { limit_key, limit_value }
 * @returns {Promise<ApiResponse>}
 */
export const addLimitToPlanRequest = (
  planId: string,
  reqData: AddLimitRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.ADD_LIMIT(planId), reqData)
    .then((response) => response.data);
};

// ─── Update Plan Limit ────────────────────────────────────────────────────────

/**
 * Updates the value of an existing plan limit.
 *
 * @param {string} planId
 * @param {string} limitId
 * @param {UpdateLimitRequest} reqData - { limit_value }
 * @returns {Promise<ApiResponse>}
 */
export const updatePlanLimitRequest = (
  planId: string,
  limitId: string,
  reqData: UpdateLimitRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.PLANS.UPDATE_LIMIT(planId, limitId), reqData)
    .then((response) => response.data);
};

// ─── Delete Plan Limit ────────────────────────────────────────────────────────

/**
 * Removes a limit from a plan.
 *
 * @param {string} planId
 * @param {string} limitId
 * @returns {Promise<ApiResponse>}
 */
export const deletePlanLimitRequest = (
  planId: string,
  limitId: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.PLANS.DELETE_LIMIT(planId, limitId))
    .then((response) => response.data);
};

// ─── Bulk Add Limits ──────────────────────────────────────────────────────────

/**
 * Adds multiple limits to a plan in one request.
 *
 * @param {string} planId
 * @param {BulkAddLimitsRequest} reqData - { items: [{ limit_key, limit_value }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkAddLimitsToPlanRequest = (
  planId: string,
  reqData: BulkAddLimitsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_ADD_LIMITS(planId), reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Limits ───────────────────────────────────────────────────────

/**
 * Removes multiple limits from a plan in one request.
 *
 * @param {string} planId
 * @param {BulkDeleteLimitsRequest} reqData - { ids: [limitId1, limitId2] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeletePlanLimitsRequest = (
  planId: string,
  reqData: BulkDeleteLimitsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.PLANS.BULK_DELETE_LIMITS(planId), reqData)
    .then((response) => response.data);
};
