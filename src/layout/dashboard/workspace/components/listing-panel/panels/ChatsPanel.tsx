/**
 * layout/dashboard/workspace/components/listing-panel/panels/ChatsPanel.tsx
 *
 * Listing panel for the Chats (DMs) nav item.
 * Shows all workspace members the current user can DM.
 *
 * Data: useQuery — workspace members list.
 * Design: Slack DM list style — avatar + name + online status.
 */

import React, { useState, useContext, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { ScrollArea } from "@/components/ui/scroll-area";
import PanelSearch from "../shared/PanelSearch";
import PanelItem from "../shared/PanelItem";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

// Deterministic avatar color from user ID
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
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg animate-pulse"
      >
        <div className="h-7 w-7 rounded-full bg-secondary-200 dark:bg-secondary-700 shrink-0" />
        <div
          className="flex-1 h-3 rounded bg-secondary-200 dark:bg-secondary-700"
          style={{ width: `${45 + i * 8}%` }}
        />
      </div>
    ))}
  </div>
);

// ── Member avatar ─────────────────────────────────────────────────────

interface MemberAvatarProps {
  userId: number;
  firstName: string;
  lastName: string;
  size?: "sm" | "md";
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({
  userId,
  firstName,
  lastName,
  size = "md",
}) => {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const colorClass = getAvatarColor(userId);
  const sizeClass =
    size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-[10px]";

  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center text-white font-semibold shrink-0",
        colorClass,
        sizeClass,
      )}
    >
      {initials || "?"}
    </div>
  );
};

// ----------------------------------------------------------------------

const ChatsPanel: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();

  const [search, setSearch] = useState("");

  // ── Data ─────────────────────────────────────────────────────────────
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["workspace-members", selectedWorkspaceId],
    queryFn: () => getWorkspaceMembersRequest(selectedWorkspaceId!),
    enabled: !!selectedWorkspaceId,
    staleTime: 60_000, // 1 min
    select: (res) => (res?.data ?? []) as any[],
  });

  // Exclude self from DM list
  const otherMembers = (membersData ?? []).filter(
    (m: any) => m.member?.id !== user?.id,
  );

  // Filter by search
  const q = search.toLowerCase();
  const filtered = q
    ? otherMembers.filter((m: any) => {
        const name =
          `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
        return name.includes(q);
      })
    : otherMembers;

  // Derive active DM from URL
  const viewBase = PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
    ":id",
    "",
  );
  const activeUserId = location.pathname.startsWith(viewBase)
    ? location.pathname.replace(viewBase, "")
    : null;

  const handleMemberClick = (memberId: number) => {
    navigate(
      PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
        ":id",
        String(memberId),
      ),
    );
  };

  const isEmpty = !isLoading && filtered.length === 0;

  return (
    <>
      {/* Search */}
      <PanelSearch
        value={search}
        onChange={setSearch}
        placeholder="Find a conversation…"
      />

      {/* Member list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="pt-2">
            <MemberSkeleton />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <MessageCircle className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
            <p
              className={clsx(
                typography.medium14,
                "text-secondary-500 dark:text-secondary-400",
              )}
            >
              {search
                ? "No members match your search"
                : "No team members found"}
            </p>
          </div>
        ) : (
          <div className="py-1 px-1.5 space-y-0.5">
            {filtered.map((m: any) => {
              const member = m.member;
              const memberId: number = member?.id;
              const firstName: string = member?.first_name ?? "";
              const lastName: string = member?.last_name ?? "";
              const fullName = `${firstName} ${lastName}`.trim() || "Unknown";
              const isActive = activeUserId === String(memberId);

              return (
                <PanelItem
                  key={memberId}
                  isActive={isActive}
                  icon={
                    <MemberAvatar
                      userId={memberId}
                      firstName={firstName}
                      lastName={lastName}
                    />
                  }
                  title={fullName}
                  subtitle={member?.email}
                  onClick={() => handleMemberClick(memberId)}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default ChatsPanel;
