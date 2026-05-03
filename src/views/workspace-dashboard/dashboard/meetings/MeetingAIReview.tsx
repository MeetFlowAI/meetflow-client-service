import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  getAIMeetingTasksRequest,
  submitAIReviewRequest,
} from "@/services/workspace-dashboard/meetings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Toast from "@/components/toast";
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";

type Decision = "approve" | "modify" | "reject";

export default function MeetingAIReview() {
  const { channelId, meetingId } = useParams<{
    channelId: string;
    meetingId: string;
  }>();
  const { selectedWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tasks", meetingId],
    queryFn: () =>
      getAIMeetingTasksRequest(selectedWorkspaceId!, channelId!, meetingId!),
    enabled: !!selectedWorkspaceId && !!channelId && !!meetingId,
    staleTime: 60_000,  // Tasks don't change — don't refetch on focus
    gcTime: 300_000,
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      submitAIReviewRequest(selectedWorkspaceId!, channelId!, meetingId!, {
        task_decisions: (data?.tasks ?? []).map((t) => ({
          task_id: t.id,
          decision: decisions[t.id] ?? "approve",
        })),
      }),
    onSuccess: () => {
      Toast.success({
        message: "Review submitted — AI is generating your summary",
      });
      navigate(
        `/workspace/channels/${channelId}/meetings/${meetingId}/summary`,
      );
    },
    onError: () => Toast.error({ message: "Failed to submit review" }),
  });

  const setDecision = (taskId: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [taskId]: d }));

  const priorityColor = (p: string) =>
    p === "high"
      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      : p === "medium"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );

  return (
    <WorkspaceDashboardPage title="AI Review">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-50">
            Review AI-Extracted Tasks
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            The AI found {data?.tasks?.length ?? 0} action items. Review each
            one before finalizing.
          </p>
        </div>

        {/* Transcript preview */}
        {(data?.transcript_preview?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 p-4">
            <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">
              Transcript Preview
            </p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {data!.transcript_preview.map((u, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-medium text-primary-600 dark:text-primary-400 shrink-0 w-24 truncate">
                    {u.speaker_name}
                  </span>
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {u.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task cards */}
        <div className="flex flex-col gap-4">
          {(data?.tasks ?? []).map((task) => {
            const d = decisions[task.id] ?? "approve";
            return (
              <div
                key={task.id}
                className={`rounded-xl border p-5 transition-colors ${
                  d === "approve"
                    ? "border-green-200 dark:border-green-800/50 bg-white dark:bg-secondary-800"
                    : d === "reject"
                      ? "border-red-200 dark:border-red-800/50 bg-white dark:bg-secondary-800 opacity-60"
                      : "border-amber-200 dark:border-amber-800/50 bg-white dark:bg-secondary-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-50">
                        {task.title}
                      </h3>
                      <Badge
                        className={`text-xs border-0 ${priorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.ai_verification_flag === "flagged" && (
                        <Badge className="text-xs border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                          ⚠ AI flagged
                        </Badge>
                      )}
                    </div>
                    {task.assignee_name && (
                      <p className="text-sm text-secondary-500 mt-1">
                        → {task.assignee_name}
                      </p>
                    )}
                    {task.description && (
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                        {task.description}
                      </p>
                    )}
                    <blockquote className="mt-3 pl-3 border-l-2 border-primary-300 text-xs text-secondary-500 italic">
                      "{task.evidence_quote}"
                    </blockquote>
                    <div className="text-xs text-secondary-400 mt-2">
                      Confidence: {Math.round(task.confidence * 100)}%
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setDecision(task.id, "approve")}
                      className={`p-2 rounded-lg transition-colors ${d === "approve" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "text-secondary-300 hover:text-green-500"}`}
                      title="Approve"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDecision(task.id, "reject")}
                      className={`p-2 rounded-lg transition-colors ${d === "reject" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "text-secondary-300 hover:text-red-500"}`}
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => reviewMutation.mutate()}
            disabled={
              reviewMutation.isPending || (data?.tasks?.length ?? 0) === 0
            }
            className="gap-2"
          >
            {reviewMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Submit Review & Generate Summary
          </Button>
        </div>
      </div>
    </WorkspaceDashboardPage>
  );
}
