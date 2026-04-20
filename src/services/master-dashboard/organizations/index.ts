/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateOrganizationRequest {
  // Step 1 — org identity
  name: string;
  display_name: string;
  domain: string;
  official_email: string;
  logo?: string;
  // Step 2 — owner account
  owner_first_name: string;
  owner_last_name: string;
  primary_owner_email: string;
  // Step 3 — plan selection
  plan_id: number;
}

export interface UpdateOrganizationRequest {
  name?: string;
  display_name?: string;
  logo?: string;
  domain?: string;
  official_email?: string;
}

export interface AssignPlanRequest {
  plan_id: number;
}

export interface BulkCreateOrganizationsRequest {
  items: Array<{
    name: string;
    display_name: string;
    official_email: string;
    primary_owner_email: string;
    domain: string;
    logo?: string;
    plan_id?: number;
  }>;
}

export interface BulkUpdateOrganizationsRequest {
  items: Array<{ id: number } & UpdateOrganizationRequest>;
}

export interface BulkDeleteOrganizationsRequest {
  ids: number[];
}

export interface BulkActivateOrganizationsRequest {
  ids: number[];
}

export interface BulkDeactivateOrganizationsRequest {
  ids: number[];
}

export interface BulkAssignPlansRequest {
  items: Array<{ id: number; plan_id: number }>;
}

export interface GetAllOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Get All Organizations ────────────────────────────────────────────────────

/**
 * Fetches all organizations with optional pagination/search.
 *
 * @param {GetAllOrganizationsParams} params
 * @returns {Promise<ApiResponse>}
 */
export const getAllOrganizationsRequest = (
  params?: GetAllOrganizationsParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.ORGANIZATIONS.GET_ALL, { params })
    .then((response) => response.data);
};

// ─── Get Organization By ID ───────────────────────────────────────────────────

/**
 * Fetches a single organization by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const getOrganizationByIdRequest = (
  id: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.MASTER.ORGANIZATIONS.GET_BY_ID(id))
    .then((response) => response.data);
};

// ─── Create Organization ──────────────────────────────────────────────────────

/**
 * Creates a new organization along with its owner account and tenant schema.
 * The owner's password is auto-generated and emailed — do not pass a password.
 *
 * @param {CreateOrganizationRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const createOrganizationRequest = (
  reqData: CreateOrganizationRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.CREATE, reqData)
    .then((response) => response.data);
};

// ─── Update Organization ──────────────────────────────────────────────────────

/**
 * Updates an existing organization's details.
 *
 * @param {string} id
 * @param {UpdateOrganizationRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const updateOrganizationRequest = (
  id: string,
  reqData: UpdateOrganizationRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ORGANIZATIONS.UPDATE(id), reqData)
    .then((response) => response.data);
};

// ─── Activate Organization ────────────────────────────────────────────────────

/**
 * Activates an organization (sets is_active = true).
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const activateOrganizationRequest = (
  id: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ORGANIZATIONS.ACTIVATE(id))
    .then((response) => response.data);
};

// ─── Deactivate Organization ──────────────────────────────────────────────────

/**
 * Deactivates an organization (sets is_active = false).
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deactivateOrganizationRequest = (
  id: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ORGANIZATIONS.DEACTIVATE(id))
    .then((response) => response.data);
};

// ─── Assign Plan to Organization ──────────────────────────────────────────────

/**
 * Assigns a plan to an organization.
 *
 * @param {string} id
 * @param {AssignPlanRequest} reqData - { plan_id }
 * @returns {Promise<ApiResponse>}
 */
export const assignPlanToOrganizationRequest = (
  id: string,
  reqData: AssignPlanRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ORGANIZATIONS.ASSIGN_PLAN(id), reqData)
    .then((response) => response.data);
};

// ─── Delete Organization ──────────────────────────────────────────────────────

/**
 * Deletes an organization and its tenant schema by ID.
 *
 * @param {string} id
 * @returns {Promise<ApiResponse>}
 */
export const deleteOrganizationRequest = (id: string): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.MASTER.ORGANIZATIONS.DELETE(id))
    .then((response) => response.data);
};

// ─── Bulk Create Organizations ────────────────────────────────────────────────

/**
 * Creates multiple organizations in a single request.
 *
 * @param {BulkCreateOrganizationsRequest} reqData - { items: [...] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkCreateOrganizationsRequest = (
  reqData: BulkCreateOrganizationsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_CREATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Update Organizations ────────────────────────────────────────────────

/**
 * Updates multiple organizations. Each item must include an `id`.
 *
 * @param {BulkUpdateOrganizationsRequest} reqData - { items: [{ id, ...fields }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkUpdateOrganizationsRequest = (
  reqData: BulkUpdateOrganizationsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_UPDATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Delete Organizations ────────────────────────────────────────────────

/**
 * Deletes multiple organizations by their IDs.
 *
 * @param {BulkDeleteOrganizationsRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeleteOrganizationsRequest = (
  reqData: BulkDeleteOrganizationsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_DELETE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Activate Organizations ──────────────────────────────────────────────

/**
 * Activates multiple organizations by their IDs.
 *
 * @param {BulkActivateOrganizationsRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkActivateOrganizationsRequest = (
  reqData: BulkActivateOrganizationsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_ACTIVATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Deactivate Organizations ────────────────────────────────────────────

/**
 * Deactivates multiple organizations by their IDs.
 *
 * @param {BulkDeactivateOrganizationsRequest} reqData - { ids: [1, 2, 3] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkDeactivateOrganizationsRequest = (
  reqData: BulkDeactivateOrganizationsRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_DEACTIVATE, reqData)
    .then((response) => response.data);
};

// ─── Bulk Assign Plans ────────────────────────────────────────────────────────

/**
 * Assigns plans to multiple organizations in a single request.
 *
 * @param {BulkAssignPlansRequest} reqData - { items: [{ id, plan_id }] }
 * @returns {Promise<ApiResponse>}
 */
export const bulkAssignPlansRequest = (
  reqData: BulkAssignPlansRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.MASTER.ORGANIZATIONS.BULK_ASSIGN_PLAN, reqData)
    .then((response) => response.data);
};
