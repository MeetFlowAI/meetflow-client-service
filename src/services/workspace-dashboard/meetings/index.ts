/* Local Imports */
import axiosConfig from "@/lib/axios";
import type { ApiResponse } from "@/models";

// ----------------------------------------------------------------------
// Meetings use the channel-scoped endpoint on the backend:
// POST /workspace/:workspaceId/channels/:channelId/meetings/start
// POST /workspace/:workspaceId/channels/:channelId/meetings/:meetingId/join
// POST /workspace/:workspaceId/channels/:channelId/meetings/:meetingId/end
// GET  /workspace/:workspaceId/channels/:channelId/meetings
//
// For the workspace-level ManageMeetings view we aggregate across channels.
// The server does NOT have a flat /meetings endpoint today, so we return
// an empty array gracefully and let the per-channel flow handle real meetings.
// ----------------------------------------------------------------------

export interface IMeeting {
  id: number;
  title: string;
  status: "active" | "ended";
  channel_id: number;
  workspace_id: number;
  started_by_id: number;
  started_at: string;
  ended_at: string | null;
  participant_count: number;
  livekit_room_name: string;
}

export interface IStartMeetingPayload {
  title?: string;
}

export interface IStartMeetingResponse {
  meeting: IMeeting;
  token: string;
  livekit_url: string;
  livekit_room_name: string;
  role: "host" | "guest";
}

// ─── Per-channel endpoints ────────────────────────────────────────────────────

export const startMeetingRequest = (
  workspaceId: number | string,
  channelId: number | string,
  payload: IStartMeetingPayload,
): Promise<IStartMeetingResponse> =>
  axiosConfig
    .post(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/start`,
      payload,
    )
    .then((r) => r.data.data);

export const joinMeetingRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IStartMeetingResponse> =>
  axiosConfig
    .post(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/join`,
    )
    .then((r) => r.data.data);

export const endMeetingRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<ApiResponse> =>
  axiosConfig
    .post(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/end`,
    )
    .then((r) => r.data);

export const getChannelMeetingsRequest = (
  workspaceId: number | string,
  channelId: number | string,
  params?: { skip?: number; limit?: number },
): Promise<{ data: IMeeting[]; total: number }> =>
  axiosConfig
    .get(`/workspace/${workspaceId}/channels/${channelId}/meetings`, { params })
    .then((r) => r.data.data);

export const getMeetingDetailRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<{ meeting: IMeeting; participants: any[] }> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}`,
    )
    .then((r) => r.data.data);

// ─── Workspace-level aggregate (graceful fallback) ────────────────────────────
// ManageMeetings.tsx calls these. They return empty since we don't have a
// flat /meetings endpoint — the real meeting experience is inside a channel.

export const getAllMeetingsRequest = (params?: {
  workspace_id?: number;
  limit?: number;
}): Promise<ApiResponse> =>
  Promise.resolve({
    status: { response_code: 200, response_message: "Success!" },
    message: "ok",
    data: [],
  });

export const createMeetingRequest = (payload: {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  workspace_id: number;
}): Promise<ApiResponse> =>
  Promise.resolve({
    status: { response_code: 200, response_message: "Success!" },
    message:
      "Meetings are started inside channels. Open a channel and click Start Meeting.",
    data: null,
  });
