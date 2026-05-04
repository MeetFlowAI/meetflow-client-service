/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  /** org user id who becomes workspace_owner — defaults to creator if omitted */
  owner_id?: number;
  /** org user ids to bulk-add as workspace_member at creation */
  member_ids?: number[];
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface GetAllWorkspacesParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export const getAllOrgWorkspacesRequest = (
  params?: GetAllWorkspacesParams,
): Promise<ApiResponse> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.WORKSPACES.GET_ALL, { params })
    .then((r) => r.data.data);

export const getOrgWorkspaceByIdRequest = (id: string): Promise<ApiResponse> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.WORKSPACES.GET_BY_ID(id))
    .then((r) => r.data);

export const getMyWorkspacesRequest = (): Promise<ApiResponse> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.WORKSPACES.MY_WORKSPACES)
    .then((r) => r.data);

export const createOrgWorkspaceRequest = (
  reqData: CreateWorkspaceRequest,
): Promise<ApiResponse> =>
  axiosConfig
    .post(API_ENDPOINTS.WORKSPACE.WORKSPACES.CREATE, reqData)
    .then((r) => r.data);

export const updateOrgWorkspaceRequest = (
  id: string,
  reqData: UpdateWorkspaceRequest,
): Promise<ApiResponse> =>
  axiosConfig
    .patch(API_ENDPOINTS.WORKSPACE.WORKSPACES.UPDATE(id), reqData)
    .then((r) => r.data);

export const deleteOrgWorkspaceRequest = (id: string): Promise<ApiResponse> =>
  axiosConfig
    .delete(API_ENDPOINTS.WORKSPACE.WORKSPACES.DELETE(id))
    .then((r) => r.data);
