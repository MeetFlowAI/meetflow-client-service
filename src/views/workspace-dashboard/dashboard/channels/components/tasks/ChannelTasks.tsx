/**
 * components/tasks/ChannelTasks.tsx
 *
 * Tasks tab for the channel view.
 * Features:
 *  - List tasks (todo / in_progress / done) with status grouping
 *  - Create task inline (quick-add form)
 *  - Update task status via checkbox / dropdown
 *  - Delete task
 *  - Priority badge + assignee display
 *  - AI-sourced tasks show a ✨ badge
 *
 * Data layer: TanStack Query — gives us refetchOnWindowFocus for free so
 * AI-extracted tasks appear as soon as the user returns to this tab.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type JSX,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  Sparkles,
  Circle,
  CheckCircle2,
  Timer,
  X,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { typography } from "@/theme/typography";
import Toast from "@/components/toast";
import {
  getChannelTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  type ITask,
  type TaskStatus,
  type TaskPriority,
} from "@/services/workspace-dashboard/tasks";

// ----------------------------------------------------------------------

interface ChannelTasksProps {
  workspaceId: number;
  channelId: number;
  onTaskCountChange?: (count: number) => void;
}

// ── Query key factory ──────────────────────────────────────────────────────────

const taskQueryKey = (workspaceId: number, channelId: number) => [
  "channel-tasks",
  workspaceId,
  channelId,
];

// ── Priority config ────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; dot: string; badge: string }
> = {
  high: {
    label: "High",
    dot: "bg-red-400",
    badge: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  low: {
    label: "Low",
    dot: "bg-secondary-300",
    badge:
      "bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400",
  },
};

// ── Status icon ────────────────────────────────────────────────────────────────

const StatusIcon = ({
  status,
  onClick,
}: {
  status: TaskStatus;
  onClick: () => void;
}) => {
  const base = "h-4.5 w-4.5 shrink-0 cursor-pointer transition-colors";
  if (status === "done")
    return (
      <CheckCircle2
        onClick={onClick}
        className={clsx(base, "text-green-500 hover:text-green-600")}
      />
    );
  if (status === "in_progress")
    return (
      <Timer
        onClick={onClick}
        className={clsx(base, "text-blue-500 hover:text-blue-600")}
      />
    );
  return (
    <Circle
      onClick={onClick}
      className={clsx(
        base,
        "text-secondary-300 dark:text-secondary-600 hover:text-primary-500",
      )}
    />
  );
};

// Cycle: todo → in_progress → done → todo
const nextStatus = (s: TaskStatus): TaskStatus => {
  if (s === "todo") return "in_progress";
  if (s === "in_progress") return "done";
  return "todo";
};

// ── Quick-add form ─────────────────────────────────────────────────────────────

interface QuickAddFormProps {
  onAdd: (title: string, priority: TaskPriority) => void;
  onCancel: () => void;
  loading: boolean;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({
  onAdd,
  onCancel,
  loading,
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setTitle("");
  };

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 p-3 rounded-xl border-2 border-primary-300 dark:border-primary-700",
        "bg-primary-50/30 dark:bg-primary-900/10",
      )}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Task title…"
        className={clsx(
          "w-full bg-transparent outline-none",
          typography.medium14,
          "text-secondary-800 dark:text-secondary-100",
          "placeholder:text-secondary-400",
        )}
      />
      <div className="flex items-center gap-2">
        {/* Priority selector */}
        {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={clsx(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
              PRIORITY_CONFIG[p].badge,
              priority === p
                ? "ring-1 ring-offset-1 ring-current"
                : "opacity-60 hover:opacity-100",
            )}
          >
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full",
                PRIORITY_CONFIG[p].dot,
              )}
            />
            {PRIORITY_CONFIG[p].label}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={onCancel}
          className="text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim() || loading}
          className="h-7 text-xs px-3"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add Task"}
        </Button>
      </div>
    </div>
  );
};

// ── Task row ───────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: ITask;
  onStatusToggle: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  deleting: boolean;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onStatusToggle,
  onDelete,
  deleting,
}) => {
  const p = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={clsx(
        "group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150",
        "border-secondary-100 dark:border-secondary-800",
        "bg-white dark:bg-secondary-800/40",
        "hover:border-secondary-200 dark:hover:border-secondary-700",
        task.status === "done" && "opacity-60",
      )}
    >
      {/* Status toggle icon */}
      <div className="mt-0.5">
        <StatusIcon status={task.status} onClick={() => onStatusToggle(task)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            typography.medium14,
            "text-secondary-800 dark:text-secondary-100 leading-snug",
            task.status === "done" && "line-through text-secondary-400",
          )}
        >
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Priority badge */}
          <span
            className={clsx(
              "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
              p.badge,
            )}
          >
            <span className={clsx("h-1 w-1 rounded-full", p.dot)} />
            {p.label}
          </span>

          {/* AI badge */}
          {task.source === "ai" && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}

          {/* Assignee */}
          {task.assignee && (
            <span
              className={clsx(
                typography.regular12,
                "text-secondary-400 dark:text-secondary-500",
              )}
            >
              → {task.assignee.first_name} {task.assignee.last_name}
            </span>
          )}

          {/* Due date */}
          {task.due_date && (
            <span
              className={clsx(
                typography.regular12,
                "text-secondary-400 dark:text-secondary-500",
              )}
            >
              Due{" "}
              {new Date(task.due_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Delete button — visible on hover */}
      <button
        onClick={() => onDelete(task)}
        disabled={deleting}
        className={clsx(
          "mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
          "text-secondary-300 hover:text-red-400 dark:text-secondary-600 dark:hover:text-red-400",
        )}
      >
        {deleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
};

// ── Status group ───────────────────────────────────────────────────────────────

const STATUS_GROUPS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "text-secondary-500" },
  { id: "in_progress", label: "In Progress", color: "text-blue-500" },
  { id: "done", label: "Done", color: "text-green-500" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

const ChannelTasks: React.FC<ChannelTasksProps> = ({
  workspaceId,
  channelId,
  onTaskCountChange,
}): JSX.Element => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set(["done"]));
  const [selectedStatus, setSelectedStatus] = useState<"all" | TaskStatus>("all");
  const [selectedPriority, setSelectedPriority] = useState<"all" | TaskPriority>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const qKey = [
    ...taskQueryKey(workspaceId, channelId),
    selectedStatus,
    selectedPriority,
    searchQuery.trim(),
  ];

  const activeFiltersCount = useMemo(
    () =>
      Number(selectedStatus !== "all") +
      Number(selectedPriority !== "all") +
      Number(searchQuery.trim().length > 0),
    [selectedStatus, selectedPriority, searchQuery],
  );

  // ── Fetch tasks (TanStack Query) ──────────────────────────────────────
  // refetchOnWindowFocus: true means when the user alt-tabs back or switches
  // browser tabs, the list refreshes — this is how AI tasks appear without
  // the user manually refreshing after a pipeline completes.
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () =>
      getChannelTasksRequest(workspaceId, channelId, {
        limit: 100,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        search: searchQuery.trim() || undefined,
      }),
    enabled: !!workspaceId && !!channelId,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const tasks: ITask[] = data?.rows ?? [];

  // Keep parent task count in sync
  useEffect(() => {
    onTaskCountChange?.(tasks.filter((t) => t.status !== "done").length);
  }, [tasks, onTaskCountChange]);

  // ── Create task ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: ({
      title,
      priority,
    }: {
      title: string;
      priority: TaskPriority;
    }) => createTaskRequest(workspaceId, channelId, { title, priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKey(workspaceId, channelId) });
      setShowAdd(false);
    },
    onError: (err: any) => {
      Toast.error({
        message: "Failed to create task",
        description: err?.message,
      });
    },
  });

  // ── Status toggle (optimistic) ────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({
      task,
      newStatus,
    }: {
      task: ITask;
      newStatus: TaskStatus;
    }) =>
      updateTaskRequest(workspaceId, channelId, task.id, {
        status: newStatus,
      }),
    onMutate: async ({ task, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev =
        queryClient.getQueryData<{ count: number; rows: ITask[] }>(qKey);
      queryClient.setQueryData<{ count: number; rows: ITask[] }>(qKey, (old) =>
        old
          ? {
              ...old,
              rows: old.rows.map((t) =>
                t.id === task.id ? { ...t, status: newStatus } : t,
              ),
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qKey, ctx.prev);
      Toast.error({ message: "Failed to update task" });
    },
  });

  // ── Delete task (optimistic) ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (taskId: number) =>
      deleteTaskRequest(workspaceId, channelId, taskId),
    onMutate: async (taskId) => {
      setDeletingId(taskId);
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev =
        queryClient.getQueryData<{ count: number; rows: ITask[] }>(qKey);
      queryClient.setQueryData<{ count: number; rows: ITask[] }>(qKey, (old) =>
        old
          ? {
              count: Math.max(0, old.count - 1),
              rows: old.rows.filter((t) => t.id !== taskId),
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _taskId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qKey, ctx.prev);
      Toast.error({ message: "Failed to delete task" });
    },
    onSettled: () => setDeletingId(null),
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (title: string, priority: TaskPriority) => {
      createMutation.mutate({ title, priority });
    },
    [createMutation],
  );

  const handleStatusToggle = useCallback(
    (task: ITask) => {
      statusMutation.mutate({ task, newStatus: nextStatus(task.status) });
    },
    [statusMutation],
  );

  const handleDelete = useCallback(
    (task: ITask) => {
      deleteMutation.mutate(task.id);
    },
    [deleteMutation],
  );

  const toggleCollapse = (status: TaskStatus) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const isEmpty = tasks.length === 0 && !isLoading;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-header */}
      <div
        className={clsx(
          "flex flex-col gap-3 px-5 py-3 shrink-0",
          "border-b border-secondary-100 dark:border-secondary-800",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-secondary-400" />
            <span
              className={clsx(
                typography.semibold14,
                "text-secondary-700 dark:text-secondary-200",
              )}
            >
              Tasks
            </span>
            {tasks.length > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400">
                {tasks.filter((t) => t.status !== "done").length} open
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
              </span>
            )}
            <Button
              size="sm"
              onClick={() => setShowAdd((v) => !v)}
              className="gap-1.5 h-8 text-xs"
            >
              <div className="flex items-center gap-1">
                 <Plus className="h-3.5 w-3.5" />
                  Add Task
              </div>
             
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className={clsx(
                "flex-1 min-w-0 rounded-xl border bg-white dark:bg-secondary-900",
                "border-secondary-200 dark:border-secondary-700 px-3 py-2",
                typography.regular14,
                "text-secondary-800 dark:text-secondary-100",
                "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
              )}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "all" | TaskStatus)}
              className={clsx(
                "rounded-xl border bg-white dark:bg-secondary-900",
                "border-secondary-200 dark:border-secondary-700 px-3 py-2",
                typography.regular14,
                "text-secondary-700 dark:text-secondary-100",
              )}
            >
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as "all" | TaskPriority)}
              className={clsx(
                "rounded-xl border bg-white dark:bg-secondary-900",
                "border-secondary-200 dark:border-secondary-700 px-3 py-2",
                typography.regular14,
                "text-secondary-700 dark:text-secondary-100",
              )}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {(selectedStatus !== "all" || selectedPriority !== "all" || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedPriority("all");
                  setSearchQuery("");
                }}
                className={clsx(
                  "rounded-xl border border-secondary-200 bg-secondary-50 dark:bg-secondary-900/50",
                  "px-3 py-2 text-[12px] font-medium text-secondary-600 dark:text-secondary-300",
                )}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-4">
          {/* Quick add form */}
          {showAdd && (
            <QuickAddForm
              onAdd={handleAdd}
              onCancel={() => setShowAdd(false)}
              loading={createMutation.isPending}
            />
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-secondary-300" />
            </div>
          )}

          {isEmpty && !showAdd && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-14 w-14 rounded-2xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-4">
                <CheckSquare className="h-7 w-7 text-secondary-300 dark:text-secondary-600" />
              </div>
              <p
                className={clsx(
                  typography.semibold14,
                  "text-secondary-500 dark:text-secondary-400",
                )}
              >
                No tasks yet
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500 mt-1 max-w-xs",
                )}
              >
                Add tasks manually or end a meeting — the AI will extract action
                items automatically.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 gap-1.5"
                onClick={() => setShowAdd(true)}
              >
                <div className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add your first task
                </div>
              </Button>
            </div>
          )}

          {!isLoading &&
            STATUS_GROUPS.map(({ id, label, color }) => {
              const group = byStatus(id);
              if (group.length === 0) return null;
              const isCollapsed = collapsed.has(id);

              return (
                <div key={id} className="space-y-2">
                  {/* Group header */}
                  <button
                    onClick={() => toggleCollapse(id)}
                    className="flex items-center gap-1.5 w-full group"
                  >
                    <ChevronDown
                      className={clsx(
                        "h-3.5 w-3.5 text-secondary-400 transition-transform duration-200",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                    <span
                      className={clsx(
                        "text-[11px] font-bold uppercase tracking-wider",
                        color,
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-[11px] font-medium text-secondary-400 dark:text-secondary-600">
                      {group.length}
                    </span>
                  </button>

                  {/* Task rows */}
                  {!isCollapsed && (
                    <div className="space-y-1.5 pl-1">
                      {group.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onStatusToggle={handleStatusToggle}
                          onDelete={handleDelete}
                          deleting={deletingId === task.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelTasks;