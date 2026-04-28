/**
 * layout/dashboard/workspace/components/listing-panel/panels/MembersPanel.tsx
 *
 * Listing panel for the Members nav item.
 * Shows all workspace members with role labels.
 *
 * Data: shares the same TanStack Query key as ChatsPanel —
 *   ["workspace-members", workspaceId]
 *   — so no extra network request is made when both are rendered.
 */

import React, { useState, type JSX } from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { ScrollArea } from "@/components/ui/scroll-area";
import PanelSearch from "../shared/PanelSearch";
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
  "bg-indigo-500",
];
const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Skeleton ──────────────────────────────────────────────────────────

const MemberSkeleton = () => (
  <div className="px-2 space-y-0.5">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg animate-pulse"
      >
        <div className="h-7 w-7 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div
            className="h-3 rounded bg-secondary-200 dark:bg-secondary-700"
            style={{ width: `${40 + i * 8}%` }}
          />
          <div
            className="h-2 rounded bg-secondary-100 dark:bg-secondary-700/50"
            style={{ width: "55%" }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ── Member row ────────────────────────────────────────────────────────

interface MemberRowProps {
  member: any;
}

const MemberRow: React.FC<MemberRowProps> = ({ member }) => {
  const id: number = member?.id;
  const firstName: string = member?.first_name ?? "";
  const lastName: string = member?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown";
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const colorClass = getAvatarColor(id);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary-100/60 dark:hover:bg-secondary-800/60 transition-colors">
      {/* Avatar */}
      <div
        className={clsx(
          "h-7 w-7 rounded-full flex items-center justify-center text-white shrink-0",
          "text-[10px] font-semibold",
          colorClass,
        )}
      >
        {initials || "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            typography.medium14,
            "text-secondary-800 dark:text-secondary-100 truncate leading-snug",
          )}
          style={{ fontSize: "12px" }}
        >
          {fullName}
        </p>
        <p
          className="text-secondary-400 dark:text-secondary-500 truncate leading-snug"
          style={{ fontSize: "11px" }}
        >
          {member?.email ?? ""}
        </p>
      </div>

      {/* Online indicator (placeholder — wire up presence later) */}
      <span className="h-2 w-2 rounded-full bg-secondary-300 dark:bg-secondary-600 shrink-0" />
    </div>
  );
};

// ----------------------------------------------------------------------

const MembersPanel: React.FC = (): JSX.Element => {
  const { selectedWorkspaceId } = useWorkspace();
  const [search, setSearch] = useState("");

  // ── Data — shares cache key with ChatsPanel ───────────────────────
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["workspace-members", selectedWorkspaceId],
    queryFn: () => getWorkspaceMembersRequest(selectedWorkspaceId!),
    enabled: !!selectedWorkspaceId,
    staleTime: 60_000,
    select: (res) => (res?.data ?? []) as any[],
  });

  const q = search.toLowerCase();
  const filtered = (membersData ?? []).filter((m: any) => {
    const name =
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    return !q || name.includes(q);
  });

  const isEmpty = !isLoading && filtered.length === 0;

  return (
    <>
      {/* Search */}
      <PanelSearch
        value={search}
        onChange={setSearch}
        placeholder="Search members…"
      />

      {/* Count chip */}
      {!isLoading && (membersData?.length ?? 0) > 0 && (
        <div className="px-3 pb-1.5">
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-medium">
            {membersData?.length ?? 0} member
            {(membersData?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="pt-2">
            <MemberSkeleton />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Users className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
            <p
              className={clsx(
                typography.medium14,
                "text-secondary-500 dark:text-secondary-400",
              )}
            >
              {search
                ? "No members match your search"
                : "No members in this workspace"}
            </p>
          </div>
        ) : (
          <div className="py-1 space-y-0.5">
            {filtered.map((m: any) => (
              <MemberRow key={m.member?.id} member={m.member} />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default MembersPanel;
