/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SendInvitationRequest {
  email: string;
  role_id: number;
}

export interface AcceptInvitationRequest {
  token: string;
  tenant_schema: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface GetAllOrgInvitationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

// ─── Get All Invitations ──────────────────────────────────────────────────────

/**
 * Fetches all invitations for the organization.
 *
 * @param {GetAllOrgInvitationsParams} params - optional query params
 * @returns {Promise<ApiResponse>}
 */
export const getAllOrgInvitationsRequest = (
  params?: GetAllOrgInvitationsParams,
): Promise<ApiResponse> => {
  return axiosConfig
    .get(API_ENDPOINTS.ORGANIZATION.INVITATIONS.GET_ALL, { params })
    .then((response) => response.data.data);
};

// ─── Send Invitation ──────────────────────────────────────────────────────────

/**
 * Sends an email invitation to the given address.
 *
 * @param {SendInvitationRequest} reqData - { email, role_id }
 * @returns {Promise<ApiResponse>}
 */
export const sendOrgInvitationRequest = (
  reqData: SendInvitationRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.ORGANIZATION.INVITATIONS.SEND, reqData)
    .then((response) => response.data);
};

// ─── Resend Invitation ────────────────────────────────────────────────────────

/**
 * Re-sends an existing invitation email (resets its expiry).
 *
 * @param {string} id - invitation ID
 * @returns {Promise<ApiResponse>}
 */
export const resendOrgInvitationRequest = (
  id: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .patch(API_ENDPOINTS.ORGANIZATION.INVITATIONS.RESEND(id))
    .then((response) => response.data);
};

// ─── Cancel Invitation ────────────────────────────────────────────────────────

/**
 * Cancels / revokes a pending invitation.
 *
 * @param {string} id - invitation ID
 * @returns {Promise<ApiResponse>}
 */
export const cancelOrgInvitationRequest = (
  id: string,
): Promise<ApiResponse> => {
  return axiosConfig
    .delete(API_ENDPOINTS.ORGANIZATION.INVITATIONS.CANCEL(id))
    .then((response) => response.data);
};

// ─── Accept Invitation (Public) ───────────────────────────────────────────────

/**
 * Public endpoint — called when an invited user clicks the invite link.
 * No auth token is required; the invitation token in the body acts as the credential.
 *
 * @param {AcceptInvitationRequest} reqData
 * @returns {Promise<ApiResponse>}
 */
export const acceptOrgInvitationRequest = (
  reqData: AcceptInvitationRequest,
): Promise<ApiResponse> => {
  return axiosConfig
    .post(API_ENDPOINTS.ORGANIZATION.INVITATIONS.ACCEPT, reqData)
    .then((response) => response.data);
};
