/**
 * views/workspace-dashboard/dashboard/chats/ManageChats.tsx
 *
 * Full-page DM member picker — rendered at /workspace/chats.
 *
 * Changes from original:
 *  - Migrated from raw useEffect+useState to TanStack Query
 *    (shares ["workspace-members", workspaceId] cache with ChatsPanel)
 *  - No functional changes — same layout, same navigation behaviour
 *  - Minor: removed redundant AVATAR_COLORS in favour of deterministic fn
 */

import { useContext, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Users } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

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
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

const AVATAR_PALETTE = [
  "#7C3AED",
  "#059669",
  "#2563EB",
  "#DB2777",
  "#D97706",
  "#0891B2",
  "#E11D48",
  "#4F46E5",
  "#7C3AED",
  "#059669",
];
function getAvatarColor(id: number): string {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

const SORT_OPTIONS: SortOption[] = [{ value: "name", label: "Name" }];

// ── Skeleton row ──────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-800 bg-white dark:bg-secondary-800">
    <div className="h-11 w-11 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
      <div className="h-3 bg-secondary-100 dark:bg-secondary-700/50 rounded w-1/4" />
    </div>
  </div>
);

// ----------------------------------------------------------------------

const ManageChats = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  // ── Data — shared TanStack Query cache ────────────────────────────────
  const {
    data: membersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["workspace-members", selectedWorkspaceId],
    queryFn: () => getWorkspaceMembersRequest(selectedWorkspaceId!),
    enabled: !!selectedWorkspaceId,
    staleTime: 60_000,
    select: (res) => (res?.data ?? []) as any[],
  });

  const allMembers = membersData ?? [];

  // Exclude self
  const others = allMembers.filter((m: any) => m.member?.id !== user?.id);

  // Filter + sort
  let filtered = others.filter((m: any) => {
    const name =
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  if (sortBy === "name") {
    filtered = [...filtered].sort((a: any, b: any) => {
      const na = `${a.member?.first_name ?? ""} ${a.member?.last_name ?? ""}`;
      const nb = `${b.member?.first_name ?? ""} ${b.member?.last_name ?? ""}`;
      return na.localeCompare(nb);
    });
  }

  const onlineCount = others.filter((m: any) => m.member?.is_active).length;
  const offlineCount = others.filter((m: any) => !m.member?.is_active).length;

  const statCards: SectionCard[] = [
    {
      label: "Team Members",
      value: others.length,
      icon: Users,
      color: "primary",
      hint: "People you can message",
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

        <SectionCards cards={statCards} isLoading={isLoading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search team members…"
          onSearchChange={(v) => setSearch(v)}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={setSortBy}
          onRefresh={refetch}
        />

        <div className="flex flex-col gap-2">
          {/* Loading skeletons */}
          {isLoading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

          {/* Member list */}
          {!isLoading &&
            filtered.map((member: any) => {
              const u = member.member;
              const name =
                `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
              const initials =
                `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
              const avatarColor = getAvatarColor(u?.id ?? 0);
              const isOnline = u?.is_active ?? false;

              return (
                <button
                  key={member.id ?? u?.id}
                  onClick={() =>
                    navigate(
                      PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
                        ":id",
                        String(u?.id),
                      ),
                    )
                  }
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer",
                    "transition-all duration-200 text-left",
                    "border-secondary-100 dark:border-secondary-800",
                    "bg-white dark:bg-secondary-800",
                    "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm",
                  )}
                >
                  {/* Avatar + presence */}
                  <div className="relative shrink-0">
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials || "?"}
                    </div>
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full",
                        "border-2 border-white dark:border-secondary-800",
                        isOnline
                          ? "bg-emerald-400"
                          : "bg-secondary-300 dark:bg-secondary-600",
                      )}
                    />
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100 truncate",
                        )}
                      >
                        {name || "Unknown"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "shrink-0 border-0 text-[10px] px-1.5 py-0.5",
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

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
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
