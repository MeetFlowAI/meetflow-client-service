/* Local Imports */
import axiosConfig from "@/lib/axios";

// ----------------------------------------------------------------------
// Task endpoints (all channel-scoped):
// GET    /workspace/:workspaceId/channels/:channelId/tasks
// POST   /workspace/:workspaceId/channels/:channelId/tasks
// PATCH  /workspace/:workspaceId/channels/:channelId/tasks/:taskId
// DELETE /workspace/:workspaceId/channels/:channelId/tasks/:taskId
// ----------------------------------------------------------------------

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskSource = "manual" | "ai";

export interface ITaskUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ITask {
  id: number;
  channel_id: number;
  workspace_id: number;
  meeting_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  assigned_to_id: number | null;
  created_by_id: number;
  due_date: string | null;
  assignee: ITaskUser | null;
  creator: ITaskUser;
  created_at: string;
  updated_at: string;
}

export interface ICreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigned_to_id?: number | null;
  due_date?: string | null;
}

export interface IUpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to_id?: number | null;
  due_date?: string | null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

const base = (workspaceId: number | string, channelId: number | string) =>
  `/workspace/${workspaceId}/channels/${channelId}/tasks`;

export const getChannelTasksRequest = (
  workspaceId: number | string,
  channelId: number | string,
  params?: {
    skip?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
  },
): Promise<{ count: number; rows: ITask[] }> =>
  axiosConfig
    .get(base(workspaceId, channelId), { params })
    .then((r) => r.data?.data);

export const createTaskRequest = (
  workspaceId: number | string,
  channelId: number | string,
  payload: ICreateTaskPayload,
): Promise<ITask> =>
  axiosConfig
    .post(base(workspaceId, channelId), payload)
    .then((r) => r.data?.data);

export const updateTaskRequest = (
  workspaceId: number | string,
  channelId: number | string,
  taskId: number,
  payload: IUpdateTaskPayload,
): Promise<ITask> =>
  axiosConfig
    .patch(`${base(workspaceId, channelId)}/${taskId}`, payload)
    .then((r) => r.data?.data);

export const deleteTaskRequest = (
  workspaceId: number | string,
  channelId: number | string,
  taskId: number,
): Promise<void> =>
  axiosConfig
    .delete(`${base(workspaceId, channelId)}/${taskId}`)
    .then((r) => r.data);
