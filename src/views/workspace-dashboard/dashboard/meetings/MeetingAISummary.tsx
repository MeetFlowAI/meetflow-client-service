import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getAIMeetingSummaryRequest } from "@/services/workspace-dashboard/meetings";
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import { Badge } from "@/components/ui/badge";

export default function MeetingAISummary() {
  const { channelId, meetingId } = useParams<{
    channelId: string;
    meetingId: string;
  }>();
  const { selectedWorkspaceId } = useWorkspace();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-summary", meetingId],
    queryFn: () =>
      getAIMeetingSummaryRequest(selectedWorkspaceId!, channelId!, meetingId!),
    enabled: !!selectedWorkspaceId && !!channelId && !!meetingId,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center justify-center h-full text-secondary-500">
        Summary not available yet. Check back after processing completes.
      </div>
    );

  const priorityColor = (p: string) =>
    p === "high"
      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      : p === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";

  return (
    <WorkspaceDashboardPage title="Meeting Summary">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-50">
            Meeting Summary
          </h1>
        </div>

        {/* Overview */}
        <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-6">
          <h2 className="font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
            Overview
          </h2>
          <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
            {data.overview}
          </p>
        </div>

        {/* Decisions + Blockers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.decisions.length > 0 && (
            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="font-semibold text-secondary-700 dark:text-secondary-300">
                  Decisions
                </h2>
              </div>
              <ul className="flex flex-col gap-2">
                {data.decisions.map((d, i) => (
                  <li
                    key={i}
                    className="text-sm text-secondary-600 dark:text-secondary-400 flex gap-2"
                  >
                    <span className="text-green-500 shrink-0">✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.blockers.length > 0 && (
            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="font-semibold text-secondary-700 dark:text-secondary-300">
                  Blockers
                </h2>
              </div>
              <ul className="flex flex-col gap-2">
                {data.blockers.map((b, i) => (
                  <li
                    key={i}
                    className="text-sm text-secondary-600 dark:text-secondary-400 flex gap-2"
                  >
                    <span className="text-amber-500 shrink-0">⚠</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action items table */}
        {data.tasks.length > 0 && (
          <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-secondary-100 dark:border-secondary-700">
              <ClipboardList className="h-5 w-5 text-primary-500" />
              <h2 className="font-semibold text-secondary-700 dark:text-secondary-300">
                Action Items ({data.tasks.length})
              </h2>
            </div>
            <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {data.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200">
                      {t.title}
                    </p>
                    {t.assignee_name && (
                      <p className="text-xs text-secondary-400 mt-0.5">
                        → {t.assignee_name}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={`text-xs border-0 shrink-0 ${priorityColor(t.priority)}`}
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkspaceDashboardPage>
  );
}
