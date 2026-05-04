/**
 * views/workspace-dashboard/dashboard/chats/ViewChat.tsx
 *
 * DM conversation view orchestrator.
 *
 * Before: ~180 lines — Stream default components, CSS import, all inline
 * After:  ~90 lines — clean orchestrator, custom headless UI
 *
 * Responsibilities:
 *  - Resolve other user's profile from TanStack Query cache
 *    (shared with ChatsPanel — no extra network call)
 *  - Render DMHeader + DMChat
 *
 * No Stream CSS imported. No raw useEffect for data fetching.
 * No default Stream components (ChannelHeader, MessageList, MessageInput).
 */

import { useContext, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { Button } from "@/components/ui/button";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

/* Sub-components */
import DMHeader from "./components/dm-header/DMHeader";
import DMChat from "./components/chat/DMChat";

// ----------------------------------------------------------------------

const ViewChat = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();

  // ── Fetch other user profile ──────────────────────────────────────────
  // Reuses the same TanStack Query cache key as ChatsPanel and MembersPanel
  // — zero extra network calls if either panel was already rendered.
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["workspace-members", selectedWorkspaceId],
    queryFn: () => getWorkspaceMembersRequest(selectedWorkspaceId!),
    enabled: !!selectedWorkspaceId,
    staleTime: 60_000,
    select: (res) => (res?.data ?? []) as any[],
  });

  // Find the other user by route param id
  const otherMember = (membersData ?? []).find(
    (m: any) => String(m.member?.id) === String(id),
  );
  const otherUser = otherMember?.member ?? null;

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-7 w-7 animate-spin text-primary-400" />
      </div>
    );
  }

  // ── User not found ────────────────────────────────────────────────────
  if (!otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <MessageCircle className="h-12 w-12 text-secondary-300 dark:text-secondary-600" />
        <p className={clsx(typography.semibold14, "text-secondary-500")}>
          User not found
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-secondary-900">
      {/* DM Header */}
      <DMHeader
        userId={otherUser.id}
        firstName={otherUser.first_name ?? ""}
        lastName={otherUser.last_name ?? ""}
        email={otherUser.email}
        isOnline={otherUser.is_active ?? false}
      />

      {/* DM Chat body */}
      <DMChat
        otherUserId={otherUser.id}
        otherUserFirstName={otherUser.first_name ?? ""}
        otherUserLastName={otherUser.last_name ?? ""}
      />
    </div>
  );
};

export default ViewChat;
