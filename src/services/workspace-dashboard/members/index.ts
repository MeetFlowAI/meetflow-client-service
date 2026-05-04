/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

export interface IWorkspaceMember {
  id: number;
  user_id: number;
  workspace_id: number;
  role: string;
  joined_at?: string;
  /** user is aliased as "member" in workspaceMember.repository.js include */
  member?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
}

export interface IWorkspaceMembersResponse {
  data: IWorkspaceMember[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * GET /workspace/:workspaceId/members/get-all-members
 * Returns paginated: { data: IWorkspaceMember[], total, skip, limit }
 * After unwrap (.data.data): { data: [], total, skip, limit }
 */
export const getWorkspaceMembersRequest = (
  workspaceId: number | string,
): Promise<IWorkspaceMembersResponse> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.MEMBERS.GET_ALL(workspaceId))
    .then((r) => r.data.data);

export const addWorkspaceMemberRequest = (
  workspaceId: number | string,
  userId: number,
  role?: string,
): Promise<ApiResponse> =>
  axiosConfig
    .post(API_ENDPOINTS.WORKSPACE.MEMBERS.ADD(workspaceId), {
      user_id: userId,
      role,
    })
    .then((r) => r.data);

export const updateWorkspaceMemberRoleRequest = (
  workspaceId: number | string,
  userId: number | string,
  role: string,
): Promise<ApiResponse> =>
  axiosConfig
    .patch(API_ENDPOINTS.WORKSPACE.MEMBERS.UPDATE_ROLE(workspaceId, userId), {
      role,
    })
    .then((r) => r.data);

export const removeWorkspaceMemberRequest = (
  workspaceId: number | string,
  userId: number | string,
): Promise<ApiResponse> =>
  axiosConfig
    .delete(API_ENDPOINTS.WORKSPACE.MEMBERS.REMOVE(workspaceId, userId))
    .then((r) => r.data);
