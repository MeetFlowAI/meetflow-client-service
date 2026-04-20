/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";
import API_ENDPOINTS from "@/services/endpoints";

// ----------------------------------------------------------------------

export interface IChannel {
  id: number;
  name: string;
  description: string | null;
  /** Backend uses "public" | "private" — NOT is_private boolean */
  type: "public" | "private";
  workspace_id: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface IChannelMember {
  id: number;
  user_id: number;
  channel_id: number;
  role?: string;
  joined_at?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
}

export interface IChannelsForUserResponse {
  publicChannels: IChannel[];
  privateChannels: IChannel[];
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  type?: "public" | "private";
  member_ids?: number[];
}

export interface UpdateChannelPayload {
  name?: string;
  description?: string;
}

// ─── Channels ─────────────────────────────────────────────────────────────────

/**
 * GET /workspace/:workspaceId/channels/get-all-channels
 * Backend route actually calls getChannelsForUser controller.
 * Returns: { status, message, data: { publicChannels: IChannel[], privateChannels: IChannel[] } }
 * After unwrap (.data.data): { publicChannels: IChannel[], privateChannels: IChannel[] }
 */
export const getAllChannelsRequest = (
  workspaceId: number | string,
): Promise<IChannelsForUserResponse> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.CHANNELS.GET_ALL(workspaceId))
    .then((r) => r.data.data);

export const getChannelByIdRequest = (
  workspaceId: number | string,
  channelId: number | string,
): Promise<IChannel> =>
  axiosConfig
    .get(API_ENDPOINTS.WORKSPACE.CHANNELS.GET_BY_ID(workspaceId, channelId))
    .then((r) => r.data.data);

export const createChannelRequest = (
  workspaceId: number | string,
  payload: CreateChannelPayload,
): Promise<ApiResponse> =>
  axiosConfig
    .post(API_ENDPOINTS.WORKSPACE.CHANNELS.CREATE(workspaceId), payload)
    .then((r) => r.data.data);

export const updateChannelRequest = (
  workspaceId: number | string,
  channelId: number | string,
  payload: UpdateChannelPayload,
): Promise<ApiResponse> =>
  axiosConfig
    .patch(
      API_ENDPOINTS.WORKSPACE.CHANNELS.UPDATE(workspaceId, channelId),
      payload,
    )
    .then((r) => r.data.data);

export const deleteChannelRequest = (
  workspaceId: number | string,
  channelId: number | string,
): Promise<ApiResponse> =>
  axiosConfig
    .delete(API_ENDPOINTS.WORKSPACE.CHANNELS.DELETE(workspaceId, channelId))
    .then((r) => r.data);

// ─── Channel Members ──────────────────────────────────────────────────────────

/**
 * Returns paginated: { data: IChannelMember[], total, skip, limit }
 */
export const getChannelMembersRequest = (
  workspaceId: number | string,
  channelId: number | string,
): Promise<{ data: IChannelMember[]; total: number }> =>
  axiosConfig
    .get(
      API_ENDPOINTS.WORKSPACE.CHANNEL_MEMBERS.GET_ALL(workspaceId, channelId),
    )
    .then((r) => r.data.data);

export const addChannelMemberRequest = (
  workspaceId: number | string,
  channelId: number | string,
  userId: number,
): Promise<ApiResponse> =>
  axiosConfig
    .post(API_ENDPOINTS.WORKSPACE.CHANNEL_MEMBERS.ADD(workspaceId, channelId), {
      user_id: userId,
    })
    .then((r) => r.data);

export const removeChannelMemberRequest = (
  workspaceId: number | string,
  channelId: number | string,
  userId: number | string,
): Promise<ApiResponse> =>
  axiosConfig
    .delete(
      API_ENDPOINTS.WORKSPACE.CHANNEL_MEMBERS.REMOVE(
        workspaceId,
        channelId,
        userId,
      ),
    )
    .then((r) => r.data);
