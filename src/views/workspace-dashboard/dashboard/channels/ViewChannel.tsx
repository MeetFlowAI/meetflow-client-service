import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Hash,
  Lock,
  Users,
  ArrowLeft,
  UserPlus,
  X,
  Loader2,
  Video,
  Play,
  Square,
} from "lucide-react";
import clsx from "clsx";

// ── Stream Chat v14 ───────────────────────────────────────────────────────────
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
import "./stream-chat-slack-theme.css";

// ── LiveKit ───────────────────────────────────────────────────────────────────
import {
  LiveKitRoom,
  VideoConference,
  PreJoin,
  type LocalUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";

// ── Local ─────────────────────────────────────────────────────────────────────
import {
  getChannelByIdRequest,
  getChannelMembersRequest,
  addChannelMemberRequest,
  removeChannelMemberRequest,
} from "@/services/workspace-dashboard/channels";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import {
  startMeetingRequest,
  joinMeetingRequest,
  endMeetingRequest,
  getChannelMeetingsRequest,
  type IStartMeetingResponse,
} from "@/services/workspace-dashboard/meetings";
import { provisionChannelInStreamRequest } from "@/services/workspace-dashboard/chats";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useStreamChat } from "@/context/StreamChatContext";
import SessionContext from "@/context/SessionContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
];

type ChannelTab = "chat" | "members" | "meetings";

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TabBar = ({
  active,
  onChange,
  memberCount,
}: {
  active: ChannelTab;
  onChange: (t: ChannelTab) => void;
  memberCount: number;
}) => (
  <div className="flex items-center gap-0 mt-3 -mb-px">
    {(["chat", "members", "meetings"] as ChannelTab[]).map((id) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={clsx(
          "px-4 py-2.5 border-b-2 transition-all duration-150",
          typography.medium14,
          active === id
            ? "border-primary-500 text-primary-600 dark:text-primary-400"
            : "border-transparent text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300",
        )}
      >
        {id === "members"
          ? `Members (${memberCount})`
          : id.charAt(0).toUpperCase() + id.slice(1)}
      </button>
    ))}
  </div>
);

// ─── Add Member Dialog ────────────────────────────────────────────────────────

const AddMemberDialog = ({
  open,
  onClose,
  workspaceId,
  channelId,
  existingMemberIds,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  channelId: number;
  existingMemberIds: number[];
  onAdded: () => void;
}) => {
  const [wsMembers, setWsMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<number | null>(null);

  const fetchWsMembers = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembersRequest(workspaceId);
      setWsMembers(res?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, open]);

  useEffect(() => {
    fetchWsMembers();
  }, [fetchWsMembers]);

  const eligible = wsMembers.filter(
    (m) =>
      !existingMemberIds.includes(m.member?.id) &&
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const handleAdd = async (userId: number) => {
    setAdding(userId);
    try {
      await addChannelMemberRequest(workspaceId, channelId, Number(userId));
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
          <DialogTitle className={typography.semibold18}>
            Add members
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <input
            placeholder="Search workspace members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={clsx(
              typography.regular12,
              "px-3 h-9 rounded-lg border w-full outline-none",
              "bg-secondary-100 dark:bg-secondary-700 border-secondary-200 dark:border-secondary-600",
              "text-secondary-700 dark:text-secondary-200",
            )}
          />
          <ScrollArea className="h-56">
            <div className="space-y-0.5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 px-3 py-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700" />
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
                    : "All workspace members are already in this channel"}
                </p>
              ) : (
                eligible.map((m, idx) => {
                  const u = m.member;
                  const name =
                    `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
                  const initials =
                    `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700/40"
                    >
                      <div
                        className={clsx(
                          "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold",
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
                          {u?.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdd(u?.id)}
                        disabled={adding === u?.id}
                      >
                        {adding === u?.id ? "Adding…" : "Add"}
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

// ─── Meeting Overlay ──────────────────────────────────────────────────────────
// Stage 1: PreJoin (camera/mic preview + device selectors)
// Stage 2: VideoConference (full Zoom-style UI with ControlBar, GridLayout, Chat)
const MeetingOverlay = ({
  session,
  onLeave,
  onEnd,
}: {
  session: IStartMeetingResponse;
  onLeave: () => void;
  onEnd: () => void;
}) => {
  const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null);

  // ── Stage 1: PreJoin ──────────────────────────────────────────────────────
  if (!userChoices) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        data-lk-theme="default"
        style={{ background: "#111" }}
      >
        {/* top bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Video className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {session.meeting.title}
              </p>
              <p className="text-white/40 text-xs">
                {session.role === "host"
                  ? "You're the host"
                  : "Joining as guest"}
              </p>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PreJoin widget */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div style={{ width: "100%", maxWidth: 480 }}>
            <PreJoin
              onSubmit={(choices) => setUserChoices(choices)}
              onError={(err) => console.error("PreJoin error:", err)}
              defaults={{ videoEnabled: true, audioEnabled: true }}
              joinLabel="Join Meeting"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Stage 2: In-call ──────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      data-lk-theme="default"
      style={{ background: "#111" }}
    >
      {/* slim title bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-white/90 font-medium text-sm">
            {session.meeting.title}
          </span>
        </div>
        {session.role === "host" && (
          <button
            onClick={onEnd}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            End for everyone
          </button>
        )}
      </div>

      {/* LiveKit room fills remaining space */}
      <div className="flex-1 min-h-0">
        <LiveKitRoom
          serverUrl={session.livekit_url}
          token={session.token}
          connect={true}
          audio={userChoices.audioEnabled}
          video={userChoices.videoEnabled}
          onDisconnected={onLeave}
          style={{ width: "100%", height: "100%" }}
        >
          {/*
            VideoConference gives you:
            • GridLayout / FocusLayout switching automatically
            • ParticipantTile with name, mic indicator, connection quality per person
            • ControlBar: mic, camera, screen-share, chat panel, settings, leave button
            • Built-in chat side panel
          */}
          <VideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
};

// ─── VIEW CHANNEL ─────────────────────────────────────────────────────────────

const ViewChannel = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspace();
  const { user } = useContext(SessionContext);
  const { client: streamClient, isReady: streamReady } = useStreamChat();

  const [channel, setChannel] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChannelTab>("chat");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [streamChannel, setStreamChannel] = useState<any | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingSession, setMeetingSession] =
    useState<IStartMeetingResponse | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);

  const workspaceId = selectedWorkspaceId;

  // ── Fetch channel + members ────────────────────────────────────────────────
  const fetchChannel = useCallback(async () => {
    if (!id || !workspaceId) return;
    setLoading(true);
    try {
      const [chRes, memRes] = await Promise.allSettled([
        getChannelByIdRequest(workspaceId, id),
        getChannelMembersRequest(workspaceId, id),
      ]);
      if (chRes.status === "fulfilled") setChannel(chRes.value ?? null);
      if (memRes.status === "fulfilled") setMembers(memRes.value?.data ?? []);
    } catch {
      Toast.error({ message: "Failed to load channel" });
    } finally {
      setLoading(false);
    }
  }, [id, workspaceId]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // ── Init Stream channel ────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !streamReady ||
      !streamClient ||
      !channel ||
      !workspaceId ||
      activeTab !== "chat"
    )
      return;

    let mounted = true;
    const initStream = async () => {
      setStreamLoading(true);
      try {
        const streamChannelId = `ws${workspaceId}ch${channel.id}`;
        await provisionChannelInStreamRequest({
          workspace_id: workspaceId,
          channel_id: channel.id,
          channel_name: channel.name,
          channel_description: channel.description,
          is_private: channel.type === "private",
        }).catch(() => {});
        const ch = streamClient.channel("team", streamChannelId);
        await ch.watch();
        if (mounted) setStreamChannel(ch);
      } catch (err: any) {
        console.error("Stream channel init failed:", err.message);
      } finally {
        if (mounted) setStreamLoading(false);
      }
    };

    initStream();
    return () => {
      mounted = false;
      setStreamChannel(null);
    };
  }, [streamReady, streamClient, channel?.id, workspaceId, activeTab]);

  // ── Fetch meetings ─────────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    if (!id || !workspaceId) return;
    try {
      const res = await getChannelMeetingsRequest(workspaceId, id, {
        limit: 20,
      });
      setMeetings(res?.data ?? []);
    } catch {
      /* silent */
    }
  }, [id, workspaceId]);

  useEffect(() => {
    if (activeTab === "meetings") fetchMeetings();
  }, [activeTab, fetchMeetings]);

  const handleStartMeeting = async () => {
    if (!id || !workspaceId) return;
    setMeetingLoading(true);
    try {
      const session = await startMeetingRequest(workspaceId, id, {
        title: `${channel?.name} Meeting`,
      });
      setMeetingSession(session);
    } catch (err: any) {
      Toast.error({
        message: err?.response?.data?.message ?? "Failed to start meeting",
      });
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId: number) => {
    if (!id || !workspaceId) return;
    setMeetingLoading(true);
    try {
      const session = await joinMeetingRequest(workspaceId, id, meetingId);
      setMeetingSession(session);
    } catch (err: any) {
      Toast.error({
        message: err?.response?.data?.message ?? "Failed to join meeting",
      });
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!meetingSession || !id || !workspaceId) return;
    try {
      await endMeetingRequest(workspaceId, id, meetingSession.meeting.id);
    } catch {
      /* silent */
    }
    setMeetingSession(null);
    fetchMeetings();
  };

  const handleRemoveMember = async (userId: number) => {
    if (!workspaceId || !id) return;
    setRemovingId(userId);
    try {
      await removeChannelMemberRequest(workspaceId, id, userId);
      setMembers((prev) => prev.filter((m) => m.channelUser?.id !== userId));
      Toast.success({ message: "Member removed from channel" });
    } catch (err: any) {
      Toast.error({
        message: err?.response?.data?.message ?? "Failed to remove member",
      });
    } finally {
      setRemovingId(null);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Hash className="h-12 w-12 text-secondary-300" />
        <p className={clsx(typography.semibold14, "text-secondary-500")}>
          Channel not found
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath)
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Channels
        </Button>
      </div>
    );
  }

  const existingMemberIds = members
    .map((m) => m.channelUser?.id)
    .filter(Boolean);
  const activeMeeting = meetings.find((m) => m.status === "active");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Meeting overlay — fullscreen when active */}
      {meetingSession && (
        <MeetingOverlay
          session={meetingSession}
          onLeave={() => setMeetingSession(null)}
          onEnd={handleEndMeeting}
        />
      )}

      {/* Channel header */}
      <div
        className={clsx(
          "shrink-0 px-6 py-3 border-b border-secondary-200 dark:border-secondary-700",
          "bg-white dark:bg-secondary-800",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath)
            }
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            {channel.type === "private" ? (
              <Lock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            ) : (
              <Hash className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2
                className={clsx(
                  typography.semibold16,
                  "text-secondary-900 dark:text-white truncate",
                )}
              >
                {channel.name}
              </h2>
              <Badge
                variant="outline"
                className={clsx(
                  "border-0 text-[10px] px-1.5 py-0.5 shrink-0",
                  channel.type === "private"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
                )}
              >
                {channel.type === "private" ? "Private" : "Public"}
              </Badge>
            </div>
            {channel.description && (
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 truncate mt-0.5",
                )}
              >
                {channel.description}
              </p>
            )}
          </div>

          {activeMeeting ? (
            <Button
              size="sm"
              onClick={() => handleJoinMeeting(activeMeeting.id)}
              disabled={meetingLoading}
              className="gap-1.5 bg-red-500 hover:bg-red-600 text-white shrink-0"
            >
              <Play className="h-3.5 w-3.5" />
              {meetingLoading
                ? "Joining…"
                : `Join Live (${activeMeeting.participant_count})`}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartMeeting}
              disabled={meetingLoading}
              // className="flex items-center gap-1.5 shrink-0"
            >
              <div className="flex items-center gap-1.5 text-secondary-400 shrink-0">
                <Video className="h-3.5 w-3.5" />
                <span className={typography.semibold12}>
                  {meetingLoading ? "Starting…" : "Start Meeting"}
                </span>
              </div>
            </Button>
          )}

          <div className="flex items-center gap-1.5 text-secondary-400 shrink-0">
            <Users className="h-4 w-4" />
            <span className={typography.medium12}>{members.length}</span>
          </div>
        </div>
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          memberCount={members.length}
        />
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="flex-1 min-h-0 overflow-hidden">
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
              <Hash className="h-10 w-10 text-secondary-300" />
              <p className={clsx(typography.semibold14, "text-secondary-500")}>
                Chat unavailable
              </p>
              <p className={clsx(typography.regular12, "text-secondary-400")}>
                Stream Chat is not connected. Check your Stream API key in the
                server .env.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {activeTab === "members" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-secondary-100 dark:border-secondary-700">
            <p
              className={clsx(
                typography.semibold14,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              onClick={() => setAddMemberOpen(true)}
              // className="gap-1.5"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <UserPlus className="h-3.5 w-3.5" />
                <span className={typography.medium12}>Add Member</span>
              </div>
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-4 py-3 space-y-1">
              {members.map((m, idx) => {
                const u = m.channelUser;
                const name =
                  `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
                const initials =
                  `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
                return (
                  <div
                    key={m.id}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl group",
                      "hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors",
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={clsx(
                          "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                          AVATAR_COLORS[idx % AVATAR_COLORS.length],
                        )}
                      >
                        {initials}
                      </div>
                      <span
                        className={clsx(
                          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-secondary-800",
                          u?.is_active
                            ? "bg-green-400"
                            : "bg-secondary-300 dark:bg-secondary-500",
                        )}
                      />
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
                        {u?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(u?.id)}
                      disabled={removingId === u?.id}
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      {removingId === u?.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* ── MEETINGS TAB ── */}
      {activeTab === "meetings" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-secondary-100 dark:border-secondary-700">
            <p
              className={clsx(
                typography.semibold14,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              Meetings
            </p>
            <Button
              size="sm"
              onClick={handleStartMeeting}
              disabled={meetingLoading || !!activeMeeting}
              // className="gap-1.5"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <Video className="h-3.5 w-3.5" />
                <span>{meetingLoading ? "Starting…" : "Start Meeting"}</span>
              </div>
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-4 py-3 space-y-2">
              {activeMeeting && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                  <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        typography.medium14,
                        "text-secondary-800 dark:text-secondary-100",
                      )}
                    >
                      {activeMeeting.title}
                    </p>
                    <p
                      className={clsx(
                        typography.regular12,
                        "text-secondary-400",
                      )}
                    >
                      {activeMeeting.participant_count} participant
                      {activeMeeting.participant_count !== 1 ? "s" : ""} · Live
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinMeeting(activeMeeting.id)}
                    className="bg-red-500 hover:bg-red-600 text-white gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" /> Join
                  </Button>
                </div>
              )}
              {meetings
                .filter((m) => m.status === "ended")
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800"
                  >
                    <div className="h-9 w-9 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
                      <Square className="h-4 w-4 text-secondary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          typography.medium14,
                          "text-secondary-800 dark:text-secondary-100",
                        )}
                      >
                        {m.title}
                      </p>
                      <p
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400",
                        )}
                      >
                        Ended ·{" "}
                        {new Date(
                          m.ended_at ?? m.started_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              {meetings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Video className="h-10 w-10 text-secondary-300 mb-3" />
                  <p
                    className={clsx(
                      typography.semibold14,
                      "text-secondary-500",
                    )}
                  >
                    No meetings yet
                  </p>
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-400 mt-1",
                    )}
                  >
                    Start a meeting to kick things off.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {workspaceId && (
        <AddMemberDialog
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          workspaceId={workspaceId}
          channelId={parseInt(id!)}
          existingMemberIds={existingMemberIds}
          onAdded={() => {
            setAddMemberOpen(false);
            fetchChannel();
          }}
        />
      )}
    </div>
  );
};

export default ViewChannel;
