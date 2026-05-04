/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import { Crown, Search, Check, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllOrgUsersRequest } from "@/services/organization-dashboard";
import { createOrgWorkspaceRequest } from "@/services/organization-dashboard";
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
  "bg-rose-500",
  "bg-teal-500",
];

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/**
 * CreateWorkspaceModal — 3-step workspace creation:
 *   1. Name + description
 *   2. Pick workspace owner (single select)
 *   3. Bulk-add initial members (multi-select, optional)
 *
 * @component
 */
const CreateWorkspaceModal = ({
  open,
  onClose,
  onCreated,
}: CreateWorkspaceModalProps): JSX.Element => {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [memberIds, setMemberIds] = useState<number[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch org users ────────────────────────────────────────────────────────
  const fetchOrgUsers = useCallback(async () => {
    if (!open) return;
    setLoadingUsers(true);
    try {
      const res = await getAllOrgUsersRequest({ limit: 500 });
      setOrgUsers(res?.data ?? []);
    } catch {
      Toast.error({ message: "Failed to load org members" });
    } finally {
      setLoadingUsers(false);
    }
  }, [open]);

  useEffect(() => {
    fetchOrgUsers();
  }, [fetchOrgUsers]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setOwnerId(null);
      setMemberIds([]);
      setStep(1);
      setOwnerSearch("");
      setMemberSearch("");
    }
  }, [open]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const ownerUser = orgUsers.find((u) => u.id === ownerId);

  const filteredForOwner = orgUsers.filter((u) =>
    `${u.first_name ?? ""} ${u.last_name ?? ""} ${u.email ?? ""}`
      .toLowerCase()
      .includes(ownerSearch.toLowerCase()),
  );

  // For member selection: exclude the already-chosen owner
  const filteredForMembers = orgUsers.filter(
    (u) =>
      u.id !== ownerId &&
      `${u.first_name ?? ""} ${u.last_name ?? ""} ${u.email ?? ""}`
        .toLowerCase()
        .includes(memberSearch.toLowerCase()),
  );

  const toggleMember = (id: number) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.error({ message: "Workspace name is required" });
      return;
    }
    setSubmitting(true);
    try {
      await createOrgWorkspaceRequest({
        name: name.trim(),
        description: description.trim() || undefined,
        owner_id: Number(ownerId),
        member_ids: memberIds.length > 0 ? memberIds : undefined,
      });
      Toast.success({
        message: "Workspace created",
        description: `"${name.trim()}" is ready.`,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      Toast.error({
        message: "Failed to create workspace",
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step nav ───────────────────────────────────────────────────────────────
  const canGoNext =
    step === 1 ? name.trim().length >= 2 : step === 2 ? true : true;

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={typography.semibold18}>
            Create Workspace
          </DialogTitle>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {([1, 2, 3] as const).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={clsx(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    step === s
                      ? "bg-primary-500 text-white"
                      : step > s
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "bg-secondary-100 dark:bg-secondary-700 text-secondary-400",
                  )}
                >
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span
                  className={clsx(
                    "text-xs",
                    step === s
                      ? "text-secondary-700 dark:text-secondary-200 font-medium"
                      : "text-secondary-400",
                  )}
                >
                  {s === 1 ? "Details" : s === 2 ? "Owner" : "Members"}
                </span>
                {s < 3 && (
                  <div className="h-px w-6 bg-secondary-200 dark:bg-secondary-700" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5 py-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ws-name" className={typography.medium14}>
                Workspace name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ws-name"
                placeholder="e.g. Product Team, Engineering, Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className={clsx(typography.regular12, "text-secondary-400")}>
                Min 2 characters. This name is visible to all workspace members.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ws-desc" className={typography.medium14}>
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
                id="ws-desc"
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Owner ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col gap-1">
              <p
                className={clsx(
                  typography.semibold14,
                  "text-secondary-800 dark:text-secondary-100",
                )}
              >
                Select workspace owner
              </p>
              <p className={clsx(typography.regular12, "text-secondary-400")}>
                The owner has full control over this workspace. Leave unselected
                to make yourself the owner.
              </p>
            </div>

            {ownerId && ownerUser && (
              <div
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10",
                )}
              >
                <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      typography.medium14,
                      "text-secondary-800 dark:text-secondary-100",
                    )}
                  >
                    {ownerUser.first_name} {ownerUser.last_name}
                  </p>
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 truncate",
                    )}
                  >
                    {ownerUser.email}
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0 text-xs">
                  Owner
                </Badge>
                <button
                  onClick={() => setOwnerId(null)}
                  className="text-secondary-400 hover:text-secondary-600 text-xs ml-1"
                >
                  Clear
                </button>
              </div>
            )}

            <div
              className={clsx(
                "flex items-center gap-2 px-3 h-9 rounded-lg",
                "bg-secondary-100 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600",
              )}
            >
              <Search className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
              <input
                placeholder="Search org members…"
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                className={clsx(
                  typography.regular12,
                  "flex-1 bg-transparent outline-none text-secondary-700 dark:text-secondary-200 placeholder:text-secondary-400",
                )}
              />
            </div>

            <ScrollArea className="h-52">
              <div className="space-y-0.5 pr-2">
                {loadingUsers ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3 px-3 py-2 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                      <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                    </div>
                  ))
                ) : filteredForOwner.length === 0 ? (
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 text-center py-4",
                    )}
                  >
                    No members found
                  </p>
                ) : (
                  filteredForOwner.map((u, idx) => {
                    const selected = ownerId === u.id;
                    const uName =
                      `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
                    const initials =
                      `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
                    return (
                      <button
                        key={u.id}
                        onClick={() => setOwnerId(selected ? null : u.id)}
                        className={clsx(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                          selected
                            ? "bg-amber-50 dark:bg-amber-900/10"
                            : "hover:bg-secondary-50 dark:hover:bg-secondary-700/40",
                        )}
                      >
                        <div
                          className={clsx(
                            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                            AVATAR_COLORS[idx % AVATAR_COLORS.length],
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
                            {uName}
                          </p>
                          <p
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400 truncate",
                            )}
                          >
                            {u.email}
                          </p>
                        </div>
                        {selected && (
                          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── STEP 3: Members ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col gap-1">
              <p
                className={clsx(
                  typography.semibold14,
                  "text-secondary-800 dark:text-secondary-100",
                )}
              >
                Add initial members{" "}
                <span
                  className={clsx(
                    typography.regular12,
                    "text-secondary-400 font-normal",
                  )}
                >
                  (optional)
                </span>
              </p>
              <p className={clsx(typography.regular12, "text-secondary-400")}>
                These members will be added as workspace members and joined to{" "}
                <strong>#general</strong> automatically.
              </p>
            </div>

            {memberIds.length > 0 && (
              <p
                className={clsx(
                  typography.regular12,
                  "text-primary-600 dark:text-primary-400",
                )}
              >
                {memberIds.length} member{memberIds.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}

            <div
              className={clsx(
                "flex items-center gap-2 px-3 h-9 rounded-lg",
                "bg-secondary-100 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600",
              )}
            >
              <Search className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
              <input
                placeholder="Search org members…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className={clsx(
                  typography.regular12,
                  "flex-1 bg-transparent outline-none text-secondary-700 dark:text-secondary-200 placeholder:text-secondary-400",
                )}
              />
            </div>

            <ScrollArea className="h-52">
              <div className="space-y-0.5 pr-2">
                {loadingUsers ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3 px-3 py-2 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                      <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                    </div>
                  ))
                ) : filteredForMembers.length === 0 ? (
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 text-center py-4",
                    )}
                  >
                    {ownerSearch
                      ? "No members found"
                      : "No other org members available"}
                  </p>
                ) : (
                  filteredForMembers.map((u, idx) => {
                    const selected = memberIds.includes(u.id);
                    const uName =
                      `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
                    const initials =
                      `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleMember(u.id)}
                        className={clsx(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                          selected
                            ? "bg-primary-50 dark:bg-primary-500/15"
                            : "hover:bg-secondary-50 dark:hover:bg-secondary-700/40",
                        )}
                      >
                        <div
                          className={clsx(
                            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                            AVATAR_COLORS[idx % AVATAR_COLORS.length],
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
                            {uName}
                          </p>
                          <p
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400 truncate",
                            )}
                          >
                            {u.email}
                          </p>
                        </div>
                        {selected && (
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
        )}

        <Separator />

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
            >
              Back
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={!canGoNext || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : step < 3 ? (
              "Next"
            ) : (
              "Create Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
