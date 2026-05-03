/**
 * components/members/ChannelMembers.tsx
 *
 * Members tab content for the channel view.
 * Extracted from ViewChannel.tsx (was inline in the 960-line file).
 *
 * Shows member list with avatar, name, email, online status, and remove action.
 * Add member dialog triggered from the header action button.
 */

import React, { useState, type JSX } from "react";
import { UserPlus, Loader2, X, Users } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { removeChannelMemberRequest } from "@/services/workspace-dashboard/channels";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import AddMemberDialog from "./AddMemberDialog";

// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-pink-500",
  "bg-amber-500", "bg-cyan-500", "bg-rose-500", "bg-teal-500",
];

// ----------------------------------------------------------------------

interface ChannelMember {
  id: number;
  channelUser?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
}

interface ChannelMembersProps {
  members: ChannelMember[];
  workspaceId: number;
  channelId: number;
  onMembersChanged: () => void;
}

// ----------------------------------------------------------------------

const ChannelMembers: React.FC<ChannelMembersProps> = ({
  members,
  workspaceId,
  channelId,
  onMembersChanged,
}): JSX.Element => {
  const [addOpen, setAddOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const existingMemberIds = members
    .map((m) => m.channelUser?.id)
    .filter(Boolean) as number[];

  const handleRemove = async (userId: number) => {
    setRemovingId(userId);
    try {
      await removeChannelMemberRequest(workspaceId, channelId, userId);
      Toast.success({ message: "Member removed from channel" });
      onMembersChanged();
    } catch (err: any) {
      Toast.error({
        message: err?.response?.data?.message ?? "Failed to remove member",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Sub-header */}
        <div
          className={clsx(
            "flex items-center justify-between px-5 py-3 shrink-0",
            "border-b border-secondary-100 dark:border-secondary-800",
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary-400" />
            <span className={clsx(typography.semibold14, "text-secondary-700 dark:text-secondary-200")}>
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Add Member
            </div>
          </Button>
        </div>

        {/* Member list */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-3 space-y-0.5">
            {members.map((m, idx) => {
              const u = m.channelUser;
              if (!u) return null;
              const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
              const initials = `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isRemoving = removingId === u.id;

              return (
                <div
                  key={m.id}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl group",
                    "hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors",
                  )}
                >
                  {/* Avatar + online dot */}
                  <div className="relative shrink-0">
                    <div
                      className={clsx(
                        "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                        colorClass,
                      )}
                    >
                      {initials || "?"}
                    </div>
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full",
                        "border-2 border-white dark:border-secondary-900",
                        u.is_active
                          ? "bg-emerald-400"
                          : "bg-secondary-300 dark:bg-secondary-600",
                      )}
                    />
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className={clsx(typography.medium14, "text-secondary-800 dark:text-secondary-100 truncate")}>
                      {name || "Unknown"}
                    </p>
                    <p className={clsx(typography.regular12, "text-secondary-400 dark:text-secondary-500 truncate")}>
                      {u.email}
                    </p>
                  </div>

                  {/* Remove button (hover-reveal) */}
                  <button
                    onClick={() => handleRemove(u.id)}
                    disabled={isRemoving}
                    className={clsx(
                      "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
                      "opacity-0 group-hover:opacity-100",
                      "text-secondary-400 hover:text-red-500",
                      "hover:bg-red-50 dark:hover:bg-red-500/10",
                    )}
                    title="Remove from channel"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Add member dialog */}
      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        workspaceId={workspaceId}
        channelId={channelId}
        existingMemberIds={existingMemberIds}
        onAdded={() => {
          setAddOpen(false);
          onMembersChanged();
        }}
      />
    </>
  );
};

export default ChannelMembers;
