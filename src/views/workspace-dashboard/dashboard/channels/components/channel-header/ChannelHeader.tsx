/**
 * components/channel-header/ChannelHeader.tsx
 *
 * Modern redesign — gradient icon, refined typography, animated meeting button.
 * Presentation-only. No data fetching, no Stream Chat, no LiveKit.
 */

import React, { type JSX } from "react";
import { Hash, Lock, Users, Video, Loader2, Wifi } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { typography } from "@/theme/typography";
import type { IChannel } from "@/services/workspace-dashboard/channels";
import type { IMeeting } from "@/services/workspace-dashboard/meetings";

// ----------------------------------------------------------------------

interface ChannelHeaderProps {
  channel: IChannel;
  memberCount: number;
  activeMeeting: IMeeting | null;
  meetingLoading: boolean;
  onStartMeeting: () => void;
  onJoinMeeting: (meetingId: number) => void;
}

// ----------------------------------------------------------------------

const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  memberCount,
  activeMeeting,
  meetingLoading,
  onStartMeeting,
  onJoinMeeting,
}): JSX.Element => {
  const isPrivate = channel.type === "private";

  return (
    <div
      className={clsx(
        "flex items-center gap-4 px-5 py-3 shrink-0",
        "bg-white/80 dark:bg-secondary-900/80",
        "backdrop-blur-sm",
        "border-b border-secondary-100 dark:border-secondary-800/60",
      )}
    >
      {/* Channel icon — gradient orb */}
      <div
        className={clsx(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          isPrivate
            ? "bg-gradient-to-br from-amber-400 to-orange-500"
            : "bg-gradient-to-br from-primary-400 to-primary-600",
        )}
      >
        {isPrivate ? (
          <Lock className="h-4 w-4 text-white drop-shadow-sm" />
        ) : (
          <Hash className="h-4 w-4 text-white drop-shadow-sm" />
        )}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <h1
            className={clsx(
              typography.semibold16,
              "text-secondary-900 dark:text-white truncate",
            )}
          >
            {channel.name}
          </h1>

          {/* Type pill */}
          <span
            className={clsx(
              "shrink-0 inline-flex items-center rounded-full px-2 py-0.5",
              "text-[10px] font-semibold uppercase tracking-widest",
              isPrivate
                ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
            )}
          >
            {isPrivate ? "Private" : "Public"}
          </span>
        </div>

        {channel.description && (
          <p
            className={clsx(
              typography.regular12,
              "text-secondary-400 dark:text-secondary-500 truncate mt-0.5",
            )}
          >
            {channel.description}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Member count chip */}
        <div
          className={clsx(
            "hidden sm:flex items-center gap-1.5",
            "bg-secondary-50 dark:bg-secondary-800/60",
            "border border-secondary-100 dark:border-secondary-700/50",
            "rounded-full px-3 py-1",
          )}
        >
          <Users className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
          <span className={clsx(typography.medium12, "text-secondary-500 dark:text-secondary-400")}>
            {memberCount}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-secondary-100 dark:bg-secondary-800" />

        {/* Meeting button */}
        {activeMeeting ? (
          <Button
            size="sm"
            onClick={() => onJoinMeeting(activeMeeting.id)}
            disabled={meetingLoading}
            className={clsx(
              "relative gap-2 h-8 px-4 text-xs font-semibold overflow-hidden",
              "bg-gradient-to-r from-red-500 to-rose-500",
              "hover:from-red-600 hover:to-rose-600",
              "text-white border-0 shadow-md shadow-red-500/20",
              "transition-all duration-200",
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            {meetingLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                Live · {activeMeeting.participant_count}
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onStartMeeting}
            disabled={meetingLoading}
            className={clsx(
              "gap-1.5 h-8 px-3 text-xs font-medium",
              "border-secondary-200 dark:border-secondary-700",
              "text-secondary-600 dark:text-secondary-300",
              "hover:bg-secondary-50 hover:border-secondary-300",
              "dark:hover:bg-secondary-800 dark:hover:border-secondary-600",
              "transition-all duration-150",
            )}
          >
            {meetingLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  Start Meeting
                </div>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelHeader;