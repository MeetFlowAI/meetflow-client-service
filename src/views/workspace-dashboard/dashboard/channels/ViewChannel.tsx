/**
 * views/workspace-dashboard/dashboard/channels/ViewChannel.tsx
 *
 * Channel view orchestrator — updated for Area 3.
 *
 * Change from Area 2:
 *  - MeetingOverlayStub REMOVED
 *  - Real MeetingOverlay imported from meetings/ folder
 *  - Everything else identical to Area 2's ViewChannel.tsx
 *
 * Responsibilities:
 *  - Fetch channel + members + meetings data (TanStack Query)
 *  - Manage active tab state (chat / members / meetings)
 *  - Manage meeting session state (start/join/end LiveKit session)
 *  - Render: ChannelHeader → ChannelTabs → [ChannelChat | ChannelMembers | ChannelMeetings]
 */

import { useState, useContext, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Hash, Loader2, ArrowLeft } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import SessionContext from "@/context/SessionContext";
import {
  getChannelByIdRequest,
  getChannelMembersRequest,
} from "@/services/workspace-dashboard/channels";
import {
  startMeetingRequest,
  joinMeetingRequest,
  endMeetingRequest,
  getChannelMeetingsRequest,
  type IStartMeetingResponse,
} from "@/services/workspace-dashboard/meetings";
import { Button } from "@/components/ui/button";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";

// ── Sub-components ────────────────────────────────────────────────────────────
import ChannelHeader from "./components/channel-header/ChannelHeader";
import ChannelTabs, {
  type ChannelTab,
} from "./components/channel-tabs/ChannelTabs";
import ChannelChat from "./components/chat/ChannelChat";
import ChannelMembers from "./components/members/ChannelMembers";
import ChannelMeetings from "./components/meetings/ChannelMeetings";

// ── Area 3: Real meeting overlay (replaces MeetingOverlayStub) ────────────────
import MeetingOverlay from "@/views/workspace-dashboard/dashboard/meetings/MeetingOverlay";

// ----------------------------------------------------------------------

const ViewChannel = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspace();
  useContext(SessionContext);

  const [activeTab, setActiveTab] = useState<ChannelTab>("chat");
  const [meetingSession, setMeetingSession] =
    useState<IStartMeetingResponse | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────
  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: ["channel", selectedWorkspaceId, id],
    queryFn: () => getChannelByIdRequest(selectedWorkspaceId!, id!),
    enabled: !!selectedWorkspaceId && !!id,
  });

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ["channel-members", selectedWorkspaceId, id],
    queryFn: () => getChannelMembersRequest(selectedWorkspaceId!, id!),
    enabled: !!selectedWorkspaceId && !!id,
    select: (res) => res?.data ?? [],
  });

  const { data: meetings, refetch: refetchMeetings } = useQuery({
    queryKey: ["channel-meetings", selectedWorkspaceId, id],
    queryFn: () =>
      getChannelMeetingsRequest(selectedWorkspaceId!, id!, { limit: 20 }),
    enabled: !!selectedWorkspaceId && !!id && activeTab === "meetings",
    select: (res) => res?.data ?? [],
  });

  const activeMeeting =
    (meetings ?? []).find((m: any) => m.status === "active") ?? null;

  // ── Meeting handlers ─────────────────────────────────────────────────
  const handleStartMeeting = async () => {
    if (!id || !selectedWorkspaceId) return;
    setMeetingLoading(true);
    try {
      const session = await startMeetingRequest(selectedWorkspaceId, id, {
        title: `${channel?.name ?? "Channel"} Meeting`,
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
    if (!id || !selectedWorkspaceId) return;
    setMeetingLoading(true);
    try {
      const session = await joinMeetingRequest(
        selectedWorkspaceId,
        id,
        meetingId,
      );
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
    if (!meetingSession || !id || !selectedWorkspaceId) return;
    try {
      await endMeetingRequest(
        selectedWorkspaceId,
        id,
        meetingSession.meeting.id,
      );
    } catch {
      /* silent */
    }
    setMeetingSession(null);
    refetchMeetings();
  };

  // ── Guards ───────────────────────────────────────────────────────────
  if (channelLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-7 w-7 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Hash className="h-12 w-12 text-secondary-300 dark:text-secondary-600" />
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

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Real meeting overlay (Area 3) ─────────────────────── */}
      {meetingSession && (
        <MeetingOverlay
          session={meetingSession}
          onLeave={() => setMeetingSession(null)}
          onEnd={handleEndMeeting}
        />
      )}

      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-secondary-900">
        <ChannelHeader
          channel={channel}
          memberCount={(members ?? []).length}
          activeMeeting={activeMeeting}
          meetingLoading={meetingLoading}
          onStartMeeting={handleStartMeeting}
          onJoinMeeting={handleJoinMeeting}
        />

        <ChannelTabs
          active={activeTab}
          onChange={setActiveTab}
          memberCount={(members ?? []).length}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {activeTab === "chat" && selectedWorkspaceId && (
            <ChannelChat channel={channel} workspaceId={selectedWorkspaceId} />
          )}
          {activeTab === "members" && selectedWorkspaceId && (
            <ChannelMembers
              members={(members as any) ?? []}
              workspaceId={selectedWorkspaceId}
              channelId={parseInt(id!)}
              onMembersChanged={refetchMembers}
            />
          )}
          {activeTab === "meetings" && (
            <ChannelMeetings
              meetings={(meetings as any) ?? []}
              activeMeeting={activeMeeting as any}
              meetingLoading={meetingLoading}
              onStartMeeting={handleStartMeeting}
              onJoinMeeting={handleJoinMeeting}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ViewChannel;
