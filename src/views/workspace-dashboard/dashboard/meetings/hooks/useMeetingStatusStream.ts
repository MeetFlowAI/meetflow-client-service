import { useQuery } from "@tanstack/react-query";
import { getAIMeetingStageStatusRequest } from "@/services/workspace-dashboard/meetings";

export const STAGE_ORDER = [
  "transcription",
  "speaker_identification",
  "task_extraction",
  "ai_verification",
  "pending_review",
  "summarization",
  "completed",
] as const;

export const STAGE_LABELS: Record<string, { ongoing: string; done: string }> = {
  transcription: {
    ongoing: "Transcribing audio...",
    done: "Transcription complete",
  },
  speaker_identification: {
    ongoing: "Identifying speakers...",
    done: "Speakers identified",
  },
  task_extraction: {
    ongoing: "Extracting action items...",
    done: "Tasks extracted",
  },
  ai_verification: {
    ongoing: "Verifying AI results...",
    done: "AI verification complete",
  },
  pending_review: { ongoing: "Awaiting your review", done: "Review done" },
  summarization: { ongoing: "Generating summary...", done: "Summary ready" },
  completed: { ongoing: "Complete", done: "Complete" },
};

export interface AIState {
  ai_status: string;
  ai_stage: string | null;
}

export function useMeetingStatusStream(
  workspaceId: string | number,
  channelId: string | number,
  meetingId: string | number,
  initial: AIState,
) {
  const { data } = useQuery({
    queryKey: ["meeting-ai-stage", meetingId],
    queryFn: () =>
      getAIMeetingStageStatusRequest(workspaceId, channelId, meetingId),
    enabled:
      !!meetingId &&
      !!workspaceId &&
      !!channelId &&
      initial.ai_status !== "not_triggered",
    refetchInterval: (query) => {
      const status = query.state.data?.ai_status ?? initial.ai_status;
      if (
        status === "completed" ||
        status === "failed" ||
        status === "pending_review"
      ) {
        return false;
      }
      return 5_000;
    },
    staleTime: 0,
    // NO initialData here — causes stale flash on mount and delays first fetch
  });

  return {
    ai_status: data?.ai_status ?? initial.ai_status,
    ai_stage: data?.ai_stage ?? initial.ai_stage,
  };
}
