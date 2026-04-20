/**
 * views/workspace-dashboard/dashboard/chats/ViewChat.tsx
 *
 * 1-to-1 DM view powered by Stream Chat v14.
 * Route param :id = other user's DB user_id.
 */

import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import clsx from "clsx";

// ── Stream Chat v14 correct imports ──────────────────────────────────────────
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  Thread,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

// ── Local ─────────────────────────────────────────────────────────────────────
import SessionContext from "@/context/SessionContext";
import { useStreamChat } from "@/context/StreamChatContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { createDMChannelRequest } from "@/services/workspace-dashboard/chats";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-pink-500",
];

const ViewChat = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { selectedWorkspaceId } = useWorkspace();
  const {
    client: streamClient,
    isReady: streamReady,
    streamUserId,
  } = useStreamChat();

  const [otherUser, setOtherUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [streamChannel, setStreamChannel] = useState<any | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  // ── Fetch other user's profile ────────────────────────────────────────────
  const fetchOtherUser = useCallback(async () => {
    if (!id || !selectedWorkspaceId) return;
    setLoadingUser(true);
    try {
      const res = await getWorkspaceMembersRequest(selectedWorkspaceId);
      const data = res?.data ?? [];
      const found = data.find((m: any) => String(m.member?.id) === String(id));
      setOtherUser(found?.member ?? null);
    } finally {
      setLoadingUser(false);
    }
  }, [id, selectedWorkspaceId]);

  useEffect(() => {
    fetchOtherUser();
  }, [fetchOtherUser]);

  // ── Init Stream DM channel ────────────────────────────────────────────────
  useEffect(() => {
    if (!streamReady || !streamClient || !user?.id || !id) return;

    let mounted = true;
    const initDM = async () => {
      setStreamLoading(true);
      try {
        // Tell backend to create/get the DM channel in Stream
        await createDMChannelRequest(id).catch(() => {});

        // Open the messaging channel on the client side
        const ch = streamClient.channel("messaging", {
          members: [streamUserId!, String(id)],
        });
        await ch.watch();
        if (mounted) setStreamChannel(ch);
      } catch (err: any) {
        console.error("DM channel init failed:", err.message);
        Toast.error({ message: "Failed to open chat. Please try again." });
      } finally {
        if (mounted) setStreamLoading(false);
      }
    };

    initDM();
    return () => {
      mounted = false;
      setStreamChannel(null);
    };
  }, [streamReady, streamClient, user?.id, id]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const otherName = otherUser
    ? `${otherUser.first_name ?? ""} ${otherUser.last_name ?? ""}`.trim()
    : "Unknown User";
  const otherInitials = otherUser
    ? `${otherUser.first_name?.[0] ?? ""}${otherUser.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";
  const isOnline = otherUser?.is_active ?? false;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className={clsx(
          "shrink-0 px-6 py-3.5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3",
          "bg-white dark:bg-secondary-800",
        )}
      >
        <button
          onClick={() => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath)}
          className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="relative shrink-0">
          <div
            className={clsx(
              "h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold",
              AVATAR_COLORS[0],
            )}
          >
            {otherInitials}
          </div>
          <span
            className={clsx(
              "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-secondary-800",
              isOnline
                ? "bg-green-400"
                : "bg-secondary-300 dark:bg-secondary-500",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={clsx(
              typography.semibold14,
              "text-secondary-800 dark:text-secondary-100 truncate",
            )}
          >
            {otherName}
          </p>
          <p className={clsx(typography.regular12, "text-secondary-400")}>
            {isOnline ? "Active" : "Offline"}
          </p>
        </div>
      </div>

      {/* Stream Chat body */}
      <div className="flex-1 overflow-hidden">
        {streamLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
          </div>
        )}

        {!streamLoading && streamReady && streamClient && streamChannel && (
          <Chat client={streamClient} theme="str-chat__theme-light">
            <Channel channel={streamChannel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        )}

        {!streamLoading && (!streamReady || !streamClient) && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <MessageCircle className="h-10 w-10 text-secondary-300" />
            <p className={clsx(typography.semibold14, "text-secondary-500")}>
              Chat unavailable
            </p>
            <p className={clsx(typography.regular12, "text-secondary-400")}>
              Stream Chat is not connected. Check your Stream API key and
              dashboard allowlist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewChat;
