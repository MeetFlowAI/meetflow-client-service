/**
 * components/meetings/ChannelMeetings.tsx
 *
 * Meetings tab content for the channel view.
 * Extracted from ViewChannel.tsx.
 *
 * Shows: active meeting banner (join) + past meetings list + start button.
 * Meeting session (LiveKit room) is lifted to ViewChannel since the
 * overlay is fullscreen and lives outside this tab.
 */

import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Play,
  Square,
  Loader2,
  Clock,
  Bot,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";

/* Local Imports */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { typography } from "@/theme/typography";
import type { IMeeting } from "@/services/workspace-dashboard/meetings";
import {
  useMeetingStatusStream,
  STAGE_ORDER,
  STAGE_LABELS,
} from "../../../meetings/hooks/useMeetingStatusStream";

// ----------------------------------------------------------------------

interface ChannelMeetingsProps {
  meetings: IMeeting[];
  activeMeeting: IMeeting | null;
  meetingLoading: boolean;
  onStartMeeting: () => void;
  onJoinMeeting: (meetingId: number) => void;
}

// ── AI status badge ─────────────────────────────────────────────────────────

const AIStageTracker = ({ meeting }: { meeting: IMeeting }) => {
  const liveState = useMeetingStatusStream(
    meeting.workspace_id,
    meeting.channel_id,
    meeting.id,
    {
      ai_status: meeting.ai_status ?? "not_triggered",
      ai_stage: (meeting as any).ai_stage ?? null,
    },
  );

  console.log("liveState", liveState);

  const ai_status = liveState?.ai_status;

  // 🔥 normalize stage here
  const rawStage = liveState?.ai_stage ?? null;
  const ai_stage =
    rawStage === null && ai_status === "processing"
      ? "transcription" // ← default to transcription when pipeline just started
      : rawStage;

  console.log("ai_status", ai_status, "ai_stage", ai_stage);
  const navigate = useNavigate();

  if (!ai_status || ai_status === "not_triggered") return null;

  if (ai_status === "failed") {
    console.log("ai_status", ai_status, "ai_stage", ai_stage);
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
          <AlertCircle className="h-3 w-3" /> AI processing failed
        </span>
      </div>
    );
  }

  if (ai_status === "completed") {
    console.log("ai_status", ai_status, "ai_stage", ai_stage);
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() =>
            navigate(
              `/workspace/channels/${meeting.channel_id}/meetings/${meeting.id}/summary`,
            )
          }
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors"
        >
          <CheckCircle2 className="h-3 w-3" /> View Summary
        </button>
      </div>
    );
  }

  if (ai_status === "pending_review") {
    console.log("ai_status", ai_status, "ai_stage", ai_stage);
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() =>
            navigate(
              `/workspace/channels/${meeting.channel_id}/meetings/${meeting.id}/review`,
            )
          }
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
        >
          <Bot className="h-3 w-3" /> ⚡ Review Tasks
        </button>
      </div>
    );
  }

  // "processing" — show stage-by-stage progress
  const currentStageIdx = STAGE_ORDER.indexOf(ai_stage as any);
  console.log("currentStageIdx", currentStageIdx);

  return (
    <div className="mt-2 flex flex-col gap-1">
      {STAGE_ORDER.filter(
        (s) => s !== "completed" && s !== "pending_review",
      ).map((stage, idx) => {
        console.log("stage", stage, "idx", idx);
        const isDone = currentStageIdx > idx;
        console.log("isDone", isDone);
        const isCurrent = currentStageIdx === idx;
        console.log("isCurrent", isCurrent);
        const label = STAGE_LABELS[stage];
        console.log("label", label);

        return (
          <div
            key={stage}
            className={clsx(
              "flex items-center gap-1.5 text-[11px]",
              isDone && "text-green-600 dark:text-green-400",
              isCurrent && "text-blue-600 dark:text-blue-400 font-medium",
              !isDone &&
                !isCurrent &&
                "text-secondary-300 dark:text-secondary-600",
            )}
          >
            {isDone && <CheckCircle2 className="h-3 w-3 shrink-0" />}
            {isCurrent && <Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
            {!isDone && !isCurrent && (
              <div className="h-3 w-3 shrink-0 rounded-full border border-current opacity-40" />
            )}
            <span>{isCurrent ? label.ongoing : label.done}</span>
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------------------------

const ChannelMeetings: React.FC<ChannelMeetingsProps> = ({
  meetings,
  activeMeeting,
  meetingLoading,
  onStartMeeting,
  onJoinMeeting,
}): JSX.Element => {
  const endedMeetings = meetings.filter((m) => m.status === "ended");
  const isEmpty = !activeMeeting && endedMeetings.length === 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-header */}
      <div
        className={clsx(
          "flex items-center justify-between px-5 py-3 shrink-0",
          "border-b border-secondary-100 dark:border-secondary-800",
        )}
      >
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-secondary-400" />
          <span
            className={clsx(
              typography.semibold14,
              "text-secondary-700 dark:text-secondary-200",
            )}
          >
            Meetings
          </span>
        </div>
        <Button
          size="sm"
          onClick={onStartMeeting}
          disabled={meetingLoading || !!activeMeeting}
          className="gap-1.5 h-8 text-xs"
        >
          {meetingLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Video className="h-3.5 w-3.5" />
              Start Meeting
            </>
          )}
        </Button>
      </div>

      {/* Meetings list */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-3">
          {/* Active meeting banner */}
          {activeMeeting && (
            <div
              className={clsx(
                "flex items-center gap-3 p-4 rounded-xl",
                "border border-red-200 dark:border-red-800/60",
                "bg-red-50 dark:bg-red-900/10",
              )}
            >
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Video className="h-5 w-5 text-red-500" />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-secondary-900 animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                    Live Now
                  </span>
                </div>
                <p
                  className={clsx(
                    typography.medium14,
                    "text-secondary-800 dark:text-secondary-100 truncate",
                  )}
                >
                  {activeMeeting.title}
                </p>
                <p
                  className={clsx(
                    typography.regular12,
                    "text-secondary-500 dark:text-secondary-400",
                  )}
                >
                  {activeMeeting.participant_count}{" "}
                  {activeMeeting.participant_count === 1
                    ? "participant"
                    : "participants"}{" "}
                  · In progress
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => onJoinMeeting(activeMeeting.id)}
                disabled={meetingLoading}
                className="shrink-0 gap-1.5 bg-red-500 hover:bg-red-600 text-white border-0 h-8 text-xs"
              >
                {meetingLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-white" />
                    Join
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Past meetings */}
          {endedMeetings.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "flex items-start gap-3 p-3.5 rounded-xl",
                "border border-secondary-100 dark:border-secondary-800",
                "bg-white dark:bg-secondary-800/40",
              )}
            >
              <div className="h-9 w-9 rounded-xl bg-secondary-100 dark:bg-secondary-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <Square className="h-4 w-4 text-secondary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    typography.medium14,
                    "text-secondary-700 dark:text-secondary-200 truncate",
                  )}
                >
                  {m.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3 text-secondary-400" />
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 dark:text-secondary-500",
                    )}
                  >
                    Ended{" "}
                    {format(
                      new Date(m.ended_at ?? m.started_at),
                      "MMM d, yyyy · h:mm a",
                    )}
                  </p>
                </div>
                {/* AI stage badge */}
                <AIStageTracker meeting={m} />
              </div>
            </div>
          ))}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-14 w-14 rounded-2xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-4">
                <Video className="h-7 w-7 text-secondary-300 dark:text-secondary-600" />
              </div>
              <p
                className={clsx(
                  typography.semibold14,
                  "text-secondary-500 dark:text-secondary-400",
                )}
              >
                No meetings yet
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500 mt-1 max-w-xs",
                )}
              >
                Start a meeting to collaborate with your team in real time.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelMeetings;
