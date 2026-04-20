/* Imports */
import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import {
  Users,
  ShieldCheck,
  UserMinus,
  ChevronDown,
  UserPlus,
  Loader2,
  Crown,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import {
  SectionHeader,
  SectionCards,
  SectionActions,
  type SectionCard,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  getWorkspaceMembersRequest,
  addWorkspaceMemberRequest,
  updateWorkspaceMemberRoleRequest,
  removeWorkspaceMemberRequest,
} from "@/services/workspace-dashboard/members";
import { getAllOrgUsersRequest } from "@/services/organization-dashboard";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { USER_ROLES } from "@/constants";

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
  "bg-indigo-500",
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  workspace_owner: {
    label: "Owner",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  },
  workspace_admin: {
    label: "Admin",
    color:
      "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
  },
  workspace_member: {
    label: "Member",
    color:
      "bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300",
  },
};

// ─── Add Member Dialog ────────────────────────────────────────────────────────

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  existingUserIds: number[];
  onAdded: () => void;
}

const AddMemberDialog = ({
  open,
  onClose,
  workspaceId,
  existingUserIds,
  onAdded,
}: AddMemberDialogProps): JSX.Element => {
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);

  const fetchOrgUsers = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await getAllOrgUsersRequest({ limit: 200 });
      setOrgUsers(res?.data ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    fetchOrgUsers();
    if (!open) {
      setSearch("");
      setSelectedIds([]);
    }
  }, [fetchOrgUsers, open]);

  const eligible = orgUsers.filter(
    (u) =>
      !existingUserIds.includes(u.id) &&
      `${u.first_name ?? ""} ${u.last_name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAdd = async () => {
    if (!selectedIds.length) return;
    setAdding(true);
    let successCount = 0;
    for (const userId of selectedIds) {
      try {
        await addWorkspaceMemberRequest(workspaceId, Number(userId));
        successCount++;
      } catch {
        /* skip individual failures */
      }
    }
    setAdding(false);
    if (successCount > 0) {
      Toast.success({
        message: `${successCount} member${successCount > 1 ? "s" : ""} added`,
      });
      onAdded();
      onClose();
    } else {
      Toast.error({ message: "Failed to add members" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={typography.semibold18}>
            Add Members
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search */}
          <div
            className={clsx(
              "flex items-center gap-2 px-3 h-9 rounded-lg",
              "bg-secondary-100 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600",
            )}
          >
            <UserPlus className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
            <input
              placeholder="Search org members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={clsx(
                typography.regular12,
                "flex-1 bg-transparent outline-none text-secondary-700 dark:text-secondary-200",
                "placeholder:text-secondary-400",
              )}
            />
          </div>

          {selectedIds.length > 0 && (
            <p
              className={clsx(
                typography.regular12,
                "text-primary-600 dark:text-primary-400",
              )}
            >
              {selectedIds.length} member{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          )}

          <ScrollArea className="h-60">
            <div className="space-y-0.5 pr-2">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 px-3 py-2 rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                    <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                  </div>
                ))
              ) : eligible.length === 0 ? (
                <p
                  className={clsx(
                    typography.regular12,
                    "text-secondary-400 text-center py-6",
                  )}
                >
                  {search
                    ? "No members found"
                    : "All org members are already in this workspace"}
                </p>
              ) : (
                eligible.map((u, idx) => {
                  const name =
                    `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
                  const initials =
                    `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggle(u.id)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                        isSelected
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
                          {name}
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
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <svg
                            className="h-3 w-3 text-white"
                            viewBox="0 0 12 12"
                            fill="currentColor"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={adding}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={adding || selectedIds.length === 0}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              `Add ${selectedIds.length > 0 ? selectedIds.length : ""} Member${selectedIds.length > 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

/**
 * ManageWorkspaceMembers — full page for workspace member management.
 * Visible to all workspace members (actions gated by role).
 * workspace_owner can promote/demote admins and remove members.
 * workspace_admin can add/remove members only.
 * workspace_member is read-only.
 *
 * @component
 */
const ManageWorkspaceMembers = (): JSX.Element => {
  const { user } = useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<any | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembersRequest(selectedWorkspaceId);
      setMembers(res?.data ?? []);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load members",
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── My role in this workspace ───────────────────────────────────────────────
  const myMembership = members.find((m) => m.member?.id === user?.id);
  const myWsRole = myMembership?.role ?? "";
  const isOwner = myWsRole === USER_ROLES.WORKSPACE_OWNER;
  const isAdmin = myWsRole === USER_ROLES.WORKSPACE_ADMIN;
  const canManage = isOwner || isAdmin;

  // Org admins can also manage (they have access to this page via org context)
  const isOrgAdmin =
    user?.role?.name === USER_ROLES.ORGANIZATION_ADMIN ||
    user?.role?.name === USER_ROLES.ORGANIZATION_SUPER_ADMIN;

  const canAdd = canManage || isOrgAdmin;
  const canRemove = canManage || isOrgAdmin;
  const canPromote = isOwner || isOrgAdmin; // only owner can change roles

  // ── Role change ─────────────────────────────────────────────────────────────
  const handleRoleChange = async (member: any, newRole: string) => {
    if (!selectedWorkspaceId) return;
    const userId = member.member?.id;
    setUpdatingRoleId(userId);
    try {
      await updateWorkspaceMemberRoleRequest(
        selectedWorkspaceId,
        userId,
        newRole,
      );
      Toast.success({ message: "Role updated successfully" });
      fetchMembers();
    } catch (err: any) {
      Toast.error({
        message: "Failed to update role",
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // ── Remove member ───────────────────────────────────────────────────────────
  const handleRemove = async (member: any) => {
    if (!selectedWorkspaceId) return;
    const userId = member.member?.id;
    setRemovingId(userId);
    try {
      await removeWorkspaceMemberRequest(selectedWorkspaceId, userId);
      Toast.success({ message: "Member removed from workspace" });
      fetchMembers();
    } catch (err: any) {
      Toast.error({
        message: "Failed to remove member",
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setRemovingId(null);
      setConfirmRemove(null);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filtered = members.filter((m) => {
    const name =
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    const email = (m.member?.email ?? "").toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  const ownerCount = members.filter(
    (m) => m.role === USER_ROLES.WORKSPACE_OWNER,
  ).length;
  const adminCount = members.filter(
    (m) => m.role === USER_ROLES.WORKSPACE_ADMIN,
  ).length;
  const memberCount = members.filter(
    (m) => m.role === USER_ROLES.WORKSPACE_MEMBER,
  ).length;

  const statCards: SectionCard[] = [
    {
      label: "Total Members",
      value: members.length,
      icon: Users,
      color: "primary",
      hint: "In this workspace",
    },
    {
      label: "Admins",
      value: adminCount + ownerCount,
      icon: ShieldCheck,
      color: "warning",
      hint: "Owners + admins",
    },
    {
      label: "Members",
      value: memberCount,
      icon: Users,
      color: "information",
      hint: "Regular members",
    },
  ];

  const existingUserIds = members.map((m) => m.member?.id).filter(Boolean);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <WorkspaceDashboardPage title="Members">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Workspace Members"
          subtitle="Manage who has access to this workspace and their roles"
          addButtonLabel="Add Members"
          onAddClick={canAdd ? () => setAddOpen(true) : undefined}
        />

        <SectionCards cards={statCards} isLoading={loading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search members…"
          onSearchChange={setSearch}
          onRefresh={fetchMembers}
        />

        {/* Member list */}
        <div className="flex flex-col gap-2">
          {loading &&
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800"
              >
                <div className="h-11 w-11 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
                  <div className="h-3 bg-secondary-100 dark:bg-secondary-700/50 rounded w-1/4" />
                </div>
                <div className="h-6 w-16 bg-secondary-100 dark:bg-secondary-700 rounded-full" />
              </div>
            ))}

          {!loading &&
            filtered.map((member, idx) => {
              const u = member.member;
              const name =
                `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
              const initials =
                `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const roleInfo =
                ROLE_LABELS[member.role] ?? ROLE_LABELS["workspace_member"];
              const isMe = u?.id === user?.id;
              const isThisOwner = member.role === USER_ROLES.WORKSPACE_OWNER;
              const isUpdating = updatingRoleId === u?.id;
              const isRemoving = removingId === u?.id;

              return (
                <div
                  key={member.id}
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                    "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800",
                    "hover:border-secondary-200 dark:hover:border-secondary-600",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={clsx(
                        "h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold",
                        avatarColor,
                      )}
                    >
                      {initials}
                    </div>
                    {isThisOwner && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-secondary-800",
                        u?.is_active ? "bg-green-400" : "bg-secondary-400",
                      )}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100",
                        )}
                      >
                        {name}
                        {isMe && (
                          <span
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400 ml-1",
                            )}
                          >
                            (you)
                          </span>
                        )}
                      </p>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "border-0 text-[10px] px-1.5 py-0.5",
                          roleInfo.color,
                        )}
                      >
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <p
                      className={clsx(
                        typography.regular12,
                        "text-secondary-400 mt-0.5 truncate",
                      )}
                    >
                      {u?.email}
                    </p>
                  </div>

                  {/* Actions — only shown if user can manage AND not acting on owner or self */}
                  {canManage && !isMe && !isThisOwner && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Role change — owner only */}
                      {canPromote && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-8 text-xs"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  Change Role
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(
                                  member,
                                  USER_ROLES.WORKSPACE_ADMIN,
                                )
                              }
                              disabled={
                                member.role === USER_ROLES.WORKSPACE_ADMIN
                              }
                            >
                              <ShieldCheck className="mr-2 h-4 w-4 text-primary-500" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(
                                  member,
                                  USER_ROLES.WORKSPACE_MEMBER,
                                )
                              }
                              disabled={
                                member.role === USER_ROLES.WORKSPACE_MEMBER
                              }
                            >
                              <Users className="mr-2 h-4 w-4 text-secondary-400" />
                              Make Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Remove */}
                      {canRemove && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                          onClick={() => setConfirmRemove(member)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserMinus className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mb-3" />
              <p className={clsx(typography.semibold14, "text-secondary-500")}>
                {search ? "No members found" : "No members yet"}
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 mt-1",
                )}
              >
                {search
                  ? "Try a different search."
                  : "Add members to get started."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      {selectedWorkspaceId && (
        <AddMemberDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          workspaceId={selectedWorkspaceId}
          existingUserIds={existingUserIds}
          onAdded={fetchMembers}
        />
      )}

      {/* Confirm Remove Dialog */}
      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={(o) => {
          if (!o) setConfirmRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove && (
                <>
                  Remove{" "}
                  <strong>
                    {confirmRemove.member?.first_name}{" "}
                    {confirmRemove.member?.last_name}
                  </strong>{" "}
                  from this workspace? They will lose access to all channels and
                  data in this workspace.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspaceDashboardPage>
  );
};

export default ManageWorkspaceMembers;
