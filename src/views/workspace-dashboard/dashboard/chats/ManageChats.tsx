/* Imports */
import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Users } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import {
  SectionHeader,
  SectionCards,
  SectionActions,
  type SectionCard,
  type SortOption,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

const SORT_OPTIONS: SortOption[] = [{ value: "name", label: "Name" }];

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

// ----------------------------------------------------------------------

/**
 * ManageChats — lists workspace members to start / view DMs.
 * "Chats" in this workspace = DMs with workspace members.
 *
 * @component
 */
const ManageChats = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const fetchMembers = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembersRequest(selectedWorkspaceId);
      const data = res?.data ?? [];
      setMembers(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load team members",
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const getName = (m: any) =>
    `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.trim();

  /* Exclude self */
  let filtered = members
    .filter((m) => m.member?.id !== user?.id)
    .filter((m) => getName(m).toLowerCase().includes(search.toLowerCase()));

  if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) =>
      getName(a).localeCompare(getName(b)),
    );
  }

  const onlineCount = members.filter((m) => m.member?.is_active).length;
  const offlineCount = members.filter((m) => !m.member?.is_active).length;

  const statCards: SectionCard[] = [
    {
      label: "Total Members",
      value: members.length,
      icon: Users,
      color: "primary",
      hint: "Workspace members",
    },
    {
      label: "Online",
      value: onlineCount,
      icon: MessageCircle,
      color: "success",
      hint: "Currently active",
    },
    {
      label: "Offline",
      value: offlineCount,
      icon: MessageCircle,
      color: "secondary",
      hint: "Not active",
    },
  ];

  return (
    <WorkspaceDashboardPage title="Chats">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Direct Messages"
          subtitle="Message your workspace team members"
        />

        <SectionCards cards={statCards} isLoading={loading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search team members…"
          onSearchChange={(v) => setSearch(v)}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={setSortBy}
          onRefresh={fetchMembers}
        />

        <div className="flex flex-col gap-2">
          {loading &&
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800"
              >
                <div className="h-11 w-11 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
                  <div className="h-3 bg-secondary-100 dark:bg-secondary-700/50 rounded w-1/4" />
                </div>
              </div>
            ))}

          {!loading &&
            filtered.map((member, idx) => {
              const u = member.member;
              const name = getName(member);
              const initials =
                `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isOnline = u?.is_active ?? false;

              return (
                <button
                  key={member.id}
                  onClick={() =>
                    navigate(
                      PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
                        ":id",
                        String(u?.id),
                      ),
                    )
                  }
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left",
                    "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800",
                    "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm",
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className={clsx(
                        "h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold",
                        avatarColor,
                      )}
                    >
                      {initials}
                    </div>
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-secondary-800",
                        isOnline ? "bg-green-400" : "bg-secondary-400",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100",
                        )}
                      >
                        {name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "border-0 text-[10px] px-1.5 py-0.5",
                          isOnline
                            ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                            : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
                        )}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    {u?.email && (
                      <p
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400 mt-0.5 truncate",
                        )}
                      >
                        {u.email}
                      </p>
                    )}
                  </div>

                  <MessageCircle className="h-4 w-4 text-secondary-300 dark:text-secondary-600 shrink-0" />
                </button>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mb-3" />
              <p className={clsx(typography.semibold14, "text-secondary-500")}>
                No team members found
              </p>
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 mt-1",
                )}
              >
                {search
                  ? "Try a different search."
                  : "No other members in this workspace."}
              </p>
            </div>
          )}
        </div>
      </div>
    </WorkspaceDashboardPage>
  );
};

export default ManageChats;
