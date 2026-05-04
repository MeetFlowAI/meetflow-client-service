/**
 * components/members/AddMemberDialog.tsx
 *
 * Modal for adding workspace members to a channel.
 * Extracted from ViewChannel.tsx — was inline previously.
 *
 * Uses TanStack Query for workspace members (shares cache with ChatsPanel/MembersPanel).
 */

import React, { useState, type JSX } from "react";
import { Loader2, UserPlus } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

/* Local Imports */
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { addChannelMemberRequest } from "@/services/workspace-dashboard/channels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500", "bg-emerald-500", "bg-blue-500",
  "bg-pink-500", "bg-amber-500", "bg-cyan-500",
];

// ----------------------------------------------------------------------

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  channelId: number;
  existingMemberIds: number[];
  onAdded: () => void;
}

// ----------------------------------------------------------------------

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onClose,
  workspaceId,
  channelId,
  existingMemberIds,
  onAdded,
}): JSX.Element => {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<number | null>(null);

  // Reuse shared cache — no extra network call if MembersPanel already loaded
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getWorkspaceMembersRequest(workspaceId),
    enabled: open,
    staleTime: 60_000,
    select: (res) => (res?.data ?? []) as any[],
  });

  const eligible = (membersData ?? []).filter((m: any) => {
    const isAlreadyMember = existingMemberIds.includes(m.member?.id);
    const name = `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    return !isAlreadyMember && (!search || name.includes(search.toLowerCase()));
  });

  const handleAdd = async (userId: number) => {
    setAdding(userId);
    try {
      await addChannelMemberRequest(workspaceId, channelId, userId);
      Toast.success({ message: "Member added to channel" });
      onAdded();
    } catch (err: any) {
      Toast.error({
        message: err?.response?.data?.message ?? "Failed to add member",
      });
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={clsx(typography.semibold18, "flex items-center gap-2")}>
            <UserPlus className="h-5 w-5 text-primary-500" />
            Add members
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search */}
          <input
            placeholder="Search workspace members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={clsx(
              typography.regular14,
              "px-3 h-9 rounded-lg border w-full outline-none",
              "bg-secondary-50 dark:bg-secondary-800",
              "border-secondary-200 dark:border-secondary-700",
              "text-secondary-700 dark:text-secondary-200",
              "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
              "focus:border-primary-400 dark:focus:border-primary-500 transition-colors",
            )}
          />

          {/* Member list */}
          <ScrollArea className="h-60">
            <div className="space-y-0.5">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-2.5">
                    <div className="h-9 w-9 rounded-full bg-secondary-200 dark:bg-secondary-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                      <div className="h-2.5 bg-secondary-100 dark:bg-secondary-700/50 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : eligible.length === 0 ? (
                <p className={clsx(typography.regular14, "text-secondary-400 text-center py-8")}>
                  {search
                    ? "No members found"
                    : "All workspace members are already in this channel"}
                </p>
              ) : (
                eligible.map((m: any, idx: number) => {
                  const u = m.member;
                  const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
                  const initials = `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
                  const isAdding = adding === u?.id;

                  return (
                    <div
                      key={m.id ?? u?.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                    >
                      <div
                        className={clsx(
                          "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                          AVATAR_COLORS[idx % AVATAR_COLORS.length],
                        )}
                      >
                        {initials || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx(typography.medium14, "text-secondary-800 dark:text-secondary-100 truncate")}>
                          {name || "Unknown"}
                        </p>
                        <p className={clsx(typography.regular12, "text-secondary-400 dark:text-secondary-500 truncate")}>
                          {u?.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdd(u?.id)}
                        disabled={isAdding}
                        className="shrink-0 h-7 text-xs"
                      >
                        {isAdding ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
