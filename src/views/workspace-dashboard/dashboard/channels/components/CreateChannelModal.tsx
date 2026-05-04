/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import { Hash, Lock, Search, Check } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createChannelRequest } from "@/services/workspace-dashboard/channels";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
];

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  onCreated: () => void;
}

/**
 * CreateChannelModal — dialog to create a channel with multi-select members.
 * Follows Slack pattern: name → privacy toggle → member multi-select.
 *
 * @component
 */
const CreateChannelModal = ({
  open,
  onClose,
  workspaceId,
  onCreated,
}: CreateChannelModalProps): JSX.Element => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Fetch workspace members when modal opens */
  const fetchMembers = useCallback(async () => {
    if (!workspaceId || !open) return;
    setLoadingMembers(true);
    try {
      const res = await getWorkspaceMembersRequest(workspaceId);
      const data = res?.data ?? [];
      setWorkspaceMembers(data);
    } catch {
      /* silent */
    } finally {
      setLoadingMembers(false);
    }
  }, [workspaceId, open]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleClose = () => {
    setName("");
    setDescription("");
    setIsPrivate(false);
    setMemberSearch("");
    setSelectedMemberIds([]);
    onClose();
  };

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.error({ message: "Channel name is required" });
      return;
    }
    setSubmitting(true);
    try {
      await createChannelRequest(workspaceId, {
        name: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description.trim() || undefined,
        type: isPrivate ? "private" : "public",
        member_ids:
          selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
      });
      Toast.success({ message: "Channel created successfully" });
      onCreated();
      handleClose();
    } catch (err: any) {
      Toast.error({
        message: "Failed to create channel",
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = workspaceMembers.filter((m) => {
    const fullName =
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    return fullName.includes(memberSearch.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={typography.semibold18}>
            Create a channel
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          {/* Channel name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ch-name" className={typography.medium14}>
              Channel name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <Input
                id="ch-name"
                placeholder="e.g. design-reviews"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                className="pl-9"
              />
            </div>
            <p className={clsx(typography.regular12, "text-secondary-400")}>
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ch-desc" className={typography.medium14}>
              Description{" "}
              <span
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 font-normal",
                )}
              >
                (optional)
              </span>
            </Label>
            <Input
              id="ch-desc"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Privacy toggle */}
          <button
            type="button"
            onClick={() => setIsPrivate((p) => !p)}
            className={clsx(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              isPrivate
                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
                : "border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800",
            )}
          >
            <div
              className={clsx(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                isPrivate
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-secondary-100 dark:bg-secondary-700",
              )}
            >
              <Lock
                className={clsx(
                  "h-4 w-4",
                  isPrivate
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-secondary-400",
                )}
              />
            </div>
            <div className="flex-1 text-left">
              <p
                className={clsx(
                  typography.medium14,
                  "text-secondary-800 dark:text-secondary-100",
                )}
              >
                {isPrivate ? "Private channel" : "Public channel"}
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 mt-0.5",
                )}
              >
                {isPrivate
                  ? "Only invited members can see this channel"
                  : "Anyone in the workspace can join"}
              </p>
            </div>
            <div
              className={clsx(
                "h-5 w-9 rounded-full transition-colors shrink-0 relative",
                isPrivate
                  ? "bg-amber-500"
                  : "bg-secondary-300 dark:bg-secondary-600",
              )}
            >
              <div
                className={clsx(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  isPrivate ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </div>
          </button>

          {/* Member multi-select */}
          <div className="flex flex-col gap-2">
            <Label className={typography.medium14}>
              Add members{" "}
              <span
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 font-normal",
                )}
              >
                (optional)
              </span>
              {selectedMemberIds.length > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                  style={{ fontSize: "11px" }}
                >
                  {selectedMemberIds.length} selected
                </span>
              )}
            </Label>

            {/* Search members */}
            <div
              className={clsx(
                "flex items-center gap-2 px-3 h-9 rounded-lg",
                "bg-secondary-100 dark:bg-secondary-700",
                "border border-secondary-200 dark:border-secondary-600",
              )}
            >
              <Search className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
              <input
                type="text"
                placeholder="Search members…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className={clsx(
                  typography.regular12,
                  "flex-1 bg-transparent outline-none",
                  "text-secondary-700 dark:text-secondary-200",
                  "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
                )}
              />
            </div>

            {/* Member list */}
            <ScrollArea className="h-40 rounded-xl border border-secondary-200 dark:border-secondary-700">
              <div className="p-1.5 space-y-0.5">
                {loadingMembers ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3 px-3 py-2 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                      <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                    </div>
                  ))
                ) : filteredMembers.length === 0 ? (
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 text-center py-4",
                    )}
                  >
                    No members found
                  </p>
                ) : (
                  filteredMembers.map((m, idx) => {
                    const u = m.member;
                    const fullName =
                      `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
                    const initials =
                      `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
                    const isSelected = selectedMemberIds.includes(u?.id);
                    const avatarColor =
                      AVATAR_COLORS[idx % AVATAR_COLORS.length];

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMember(u?.id)}
                        className={clsx(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                          isSelected
                            ? "bg-primary-50 dark:bg-primary-500/15"
                            : "hover:bg-secondary-50 dark:hover:bg-secondary-700/40",
                        )}
                      >
                        <div
                          className={clsx(
                            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                            avatarColor,
                          )}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={clsx(
                              typography.medium14,
                              "text-secondary-800 dark:text-secondary-100 truncate",
                            )}
                          >
                            {fullName}
                          </p>
                          <p
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400 truncate",
                            )}
                          >
                            {u?.email}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
