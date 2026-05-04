/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";

// ----------------------------------------------------------------------
// Stream Chat token endpoint
// GET /api/v1/chat/token → { token, stream_api_key, user_id }
//
// DM channel creation
// POST /api/v1/chat/dm → { stream_channel_id, stream_channel_type }
// ----------------------------------------------------------------------

export interface StreamTokenResponse {
  token: string;
  stream_api_key: string;
  user_id: string;
}

export interface DMChannelResponse {
  stream_channel_id: string;
  stream_channel_type: string;
}

export const getStreamTokenRequest = (): Promise<StreamTokenResponse> =>
  axiosConfig.get("/chat/token").then((r) => r.data.data);

export const createDMChannelRequest = (
  targetUserId: number | string,
): Promise<DMChannelResponse> =>
  axiosConfig
    .post("/chat/dm", { target_user_id: targetUserId })
    .then((r) => r.data.data);

export const provisionChannelInStreamRequest = (payload: {
  workspace_id: number | string;
  channel_id: number | string;
  channel_name: string;
  channel_description?: string;
  is_private: boolean;
}): Promise<{ stream_channel_id: string; stream_channel_type: string }> =>
  axiosConfig.post("/chat/channels", payload).then((r) => r.data.data);

export const syncWorkspaceToStreamRequest = (
  workspaceId: number | string,
): Promise<any> =>
  axiosConfig
    .post("/chat/sync-workspace", { workspace_id: workspaceId })
    .then((r) => r.data.data);

export const createMeetingChannelRequest = (payload: {
  livekit_room_name: string;
  title: string;
  participant_ids?: (number | string)[];
}): Promise<{ stream_channel_id: string; stream_channel_type: string }> =>
  axiosConfig.post("/chat/meeting-channel", payload).then((r) => r.data.data);

// Legacy stubs kept for backward compat (ViewChat.tsx used these before Stream)
export interface SendMessagePayload {
  text: string;
  attachment_url?: string;
}
export const getAllChatsRequest = (
  _workspaceId: number | string,
): Promise<ApiResponse> =>
  Promise.resolve({
    status: { response_code: 200, response_message: "ok" },
    message: "ok",
    data: [],
  });
export const getMessagesRequest = (
  _chatId: string,
  _params?: any,
): Promise<ApiResponse> =>
  Promise.resolve({
    status: { response_code: 200, response_message: "ok" },
    message: "ok",
    data: [],
  });
export const sendMessageRequest = (
  _chatId: string,
  _payload: SendMessagePayload,
): Promise<ApiResponse> =>
  Promise.resolve({
    status: { response_code: 200, response_message: "ok" },
    message: "ok",
    data: null,
  });
