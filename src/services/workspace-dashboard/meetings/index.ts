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
  meeting_type?: string;
  // AI fields — present on ended meetings
  ai_status?:
    | "not_triggered"
    | "processing"
    | "pending_review"
    | "completed"
    | "failed";
  ai_stage?: string | null;
  ai_meeting_id?: string | null;
  recording_url?: string | null;
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

// ─── AI Intelligence types ─────────────────────────────────────────────────────

export interface IAITask {
  id: string;
  title: string;
  description: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  deadline: string | null;
  priority: "high" | "medium" | "low";
  confidence: number;
  evidence_quote: string;
  ai_verification_flag: "flagged" | "ok" | null;
  ai_verification_note: string | null;
  status?: string;
}

export interface IAITasksResponse {
  meeting_id: string;
  tasks: IAITask[];
  transcript_preview: Array<{
    speaker_name: string;
    text: string;
    start_ms: number;
  }>;
  unresolved_speakers: Array<{
    speaker_label: string;
    sample_utterances: string[];
  }>;
}

export interface IAISummary {
  meeting_id: string;
  overview: string;
  decisions: string[];
  blockers: string[];
  tasks: Array<{
    id: string;
    title: string;
    assignee_name: string | null;
    priority: string;
    status: string;
    deadline: string | null;
  }>;
  created_at: string;
}

export interface IAITranscript {
  meeting_id: string;
  utterances: Array<{
    speaker_name: string;
    text: string;
    start_ms: number;
    end_ms: number;
  }>;
  created_at: string;
}

export interface IAIStatus {
  ai_status:
    | "not_triggered"
    | "processing"
    | "pending_review"
    | "completed"
    | "failed";
  ai_meeting_id: string | null;
  pipeline?: Record<string, unknown>;
}

export type TaskDecision = "approve" | "modify" | "reject";

export interface IReviewPayload {
  task_decisions: Array<{
    task_id: string;
    decision: TaskDecision;
    notes?: string;
    modifications?: Partial<IAITask>;
  }>;
  speaker_resolutions?: Array<{
    speaker_label: string;
    participant_id: string;
  }>;
}

export interface IAIStageStatus {
  ai_status: string;
  ai_stage: string | null;
}

// ─── AI Intelligence service calls ────────────────────────────────────────────

export const getAIMeetingStatusRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IAIStatus> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-status`,
    )
    .then((r) => r.data.data);

export const getAIMeetingStageStatusRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IAIStageStatus> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-status`,
    )
    .then((r) => r.data.data);

export const getAIMeetingTasksRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IAITasksResponse> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-tasks`,
    )
    .then((r) => r.data.data);

export const submitAIReviewRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
  payload: IReviewPayload,
): Promise<{
  tasks_approved: number;
  tasks_modified: number;
  tasks_rejected: number;
}> =>
  axiosConfig
    .post(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-review`,
      payload,
    )
    .then((r) => r.data.data);

export const getAIMeetingSummaryRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IAISummary> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-summary`,
    )
    .then((r) => r.data.data);

export const getAIMeetingTranscriptRequest = (
  workspaceId: number | string,
  channelId: number | string,
  meetingId: number | string,
): Promise<IAITranscript> =>
  axiosConfig
    .get(
      `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/ai-transcript`,
    )
    .then((r) => r.data.data);
