/**
 * MeetingRoom.tsx  (v5 — premium redesign with data-meeting token scope)
 *
 * Wraps everything in data-meeting so all CSS tokens apply.
 * Topbar redesigned: minimal height, gradient separator.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type JSX,
} from "react";
import { Track } from "livekit-client";
import {
  RoomAudioRenderer,
  useTracks,
  useChat,
  useLocalParticipant,
} from "@livekit/components-react";
import { Wifi, WifiOff, Radio, Lock } from "lucide-react";
import axiosConfig from "@/lib/axios";

import type { IStartMeetingResponse } from "@/services/workspace-dashboard/meetings";
import { MeetingDataProvider } from "../../context/MeetingDataContext";
import { useMeetingData } from "../../context/useMeetingData";
import VideoGrid, { type MeetingLayout } from "./VideoGrid";
import ScreenShareView from "./ScreenShareView";
import MeetingControls from "./MeetingControls";
import ReactionsOverlay from "./ReactionsOverlay";
import CaptionsOverlay from "./CaptionsOverlay";
import { WaitingScreen, AdmissionBar } from "./WaitingRoomOverlay";
import ParticipantsPanel from "../panels/ParticipantsPanel";
import MeetingChatPanel from "../panels/MeetingChatPanel";
import PollsPanel from "../panels/PollsPanel";
import BackgroundPanel from "../panels/BackgroundPanel";
import DeviceSettingsPanel from "../panels/DeviceSettingsPanel";

import { useVirtualBackground } from "../../hooks/useVirtualBackground";
import { useNoiseCancellation } from "../../hooks/useNoiseCancellation";
import { useLiveTranscription } from "../../hooks/useLiveTranscription";
import { usePictureInPicture } from "../../hooks/usePictureInPicture";
import { usePolls } from "../../hooks/usePolls";
import { useRecording } from "../../hooks/useRecording";
import { useWaitingRoom } from "../../hooks/useWaitingRoom";
import { useDeviceSwitcher } from "../../hooks/useDeviceSwitcher";

interface MeetingRoomProps {
  session: IStartMeetingResponse;
  onLeave: () => void;
  onEnd: () => void;
}

const MeetingRoomInner: React.FC<MeetingRoomProps> = ({
  session,
  onLeave,
  onEnd,
}): JSX.Element => {
  const [layout, setLayout] = useState<MeetingLayout>("speaker");
  const [participantsPanelOpen, setParticipantsPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [pollsPanelOpen, setPollsPanelOpen] = useState(false);
  const [backgroundPanelOpen, setBackgroundPanelOpen] = useState(false);
  const [devicesPanelOpen, setDevicesPanelOpen] = useState(false);

  const {
    isReconnecting,
    isRecording,
    setIsRecording,
    isLocked,
    incrementUnreadChat,
    markChatRead,
    setPinnedIdentity,
    broadcastMuteAll,
    broadcastSpotlight,
    broadcastLock,
    broadcastRecordingState,
  } = useMeetingData();

  const { localParticipant } = useLocalParticipant();
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const hasScreenShare = screenShareTracks.length > 0;

  const { chatMessages } = useChat();
  const prevMsgCountRef = useRef(chatMessages.length);
  const localIdentityRef = useRef(localParticipant.identity);
  const chatOpenRef = useRef(chatPanelOpen);
  useEffect(() => {
    localIdentityRef.current = localParticipant.identity;
  }, [localParticipant.identity]);
  useEffect(() => {
    chatOpenRef.current = chatPanelOpen;
  }, [chatPanelOpen]);
  useEffect(() => {
    if (chatMessages.length <= prevMsgCountRef.current) {
      prevMsgCountRef.current = chatMessages.length;
      return;
    }
    const newMsgs = chatMessages.slice(prevMsgCountRef.current);
    prevMsgCountRef.current = chatMessages.length;
    if (!chatOpenRef.current) {
      newMsgs
        .filter((m) => m.from?.identity !== localIdentityRef.current)
        .forEach(() => incrementUnreadChat());
    }
  }, [chatMessages, incrementUnreadChat]);

  const background = useVirtualBackground();
  const noise = useNoiseCancellation();
  const transcription = useLiveTranscription();
  const pip = usePictureInPicture();
  const polls = usePolls();
  const devices = useDeviceSwitcher();
  const waitingRoom = useWaitingRoom(session.role);

  const recording = useRecording(
    useCallback(
      (rec: boolean) => {
        setIsRecording(rec);
        broadcastRecordingState(rec);
      },
      [setIsRecording, broadcastRecordingState],
    ),
  );

  const spotlightContainerRef = useRef<HTMLDivElement>(null);

  // Panel handlers
  const closeSecondaryPanels = useCallback(() => {
    setChatPanelOpen(false);
    setPollsPanelOpen(false);
    setBackgroundPanelOpen(false);
    setDevicesPanelOpen(false);
  }, []);

  const handleToggleParticipants = useCallback(
    () => setParticipantsPanelOpen((v) => !v),
    [],
  );
  const handleToggleChat = useCallback(() => {
    setChatPanelOpen((v) => {
      const next = !v;
      if (next) {
        markChatRead();
        closeSecondaryPanels();
      }
      return next;
    });
  }, [markChatRead, closeSecondaryPanels]);
  const handleTogglePolls = useCallback(() => {
    setPollsPanelOpen((v) => {
      if (!v) closeSecondaryPanels();
      return !v;
    });
  }, [closeSecondaryPanels]);
  const handleToggleBackground = useCallback(() => {
    setBackgroundPanelOpen((v) => {
      if (!v) closeSecondaryPanels();
      return !v;
    });
  }, [closeSecondaryPanels]);
  const handleToggleDevices = useCallback(() => {
    setDevicesPanelOpen((v) => {
      if (!v) closeSecondaryPanels();
      return !v;
    });
  }, [closeSecondaryPanels]);
  const toggleLayout = useCallback(
    () => setLayout((l) => (l === "speaker" ? "grid" : "speaker")),
    [],
  );

  const handleMuteAll = useCallback(
    () => broadcastMuteAll(),
    [broadcastMuteAll],
  );
  const handleSpotlight = useCallback(
    (id: string) => {
      setPinnedIdentity(id);
      broadcastSpotlight(id);
    },
    [setPinnedIdentity, broadcastSpotlight],
  );
  const handleToggleLock = useCallback(
    (cur: boolean) => broadcastLock(!cur),
    [broadcastLock],
  );
  const handleRemoveParticipant = useCallback(
    (identity: string) => {
      const { id, workspace_id, channel_id } = session.meeting;
      axiosConfig
        .post(
          `/workspace/${workspace_id}/channels/${channel_id}/meetings/${id}/remove-participant`,
          { identity },
        )
        .catch(() => {});
    },
    [session.meeting],
  );

  const handleStartRecording = useCallback(() => {
    const { id, workspace_id, channel_id } = session.meeting;
    recording.startRecording(id, workspace_id, channel_id);
  }, [session.meeting, recording]);
  const handleStopRecording = useCallback(() => {
    const { id, workspace_id, channel_id } = session.meeting;
    recording.stopRecording(id, workspace_id, channel_id);
  }, [session.meeting, recording]);

  const handleAdmit = useCallback(
    (identity: string) => {
      const { id, workspace_id, channel_id } = session.meeting;
      waitingRoom.admit(identity, id, workspace_id, channel_id);
    },
    [session.meeting, waitingRoom],
  );
  const handleDeny = useCallback(
    (identity: string) => {
      const { id, workspace_id, channel_id } = session.meeting;
      waitingRoom.deny(identity, id, workspace_id, channel_id);
    },
    [session.meeting, waitingRoom],
  );

  return (
    <div
      data-meeting
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--mf-bg-base)" }}
    >
      <RoomAudioRenderer />
      {waitingRoom.isWaiting && <WaitingScreen />}

      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <ReactionsOverlay />
      </div>

      {/* ── Topbar ────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-2.5 z-20 relative"
        style={{
          background: "var(--mf-bg-raised)",
          borderBottom: "1px solid var(--mf-border)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Live badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
            style={{
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.22)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--mf-danger-strong)",
                animation: "mf-live-dot 1.6s ease infinite",
              }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--mf-danger)" }}
            >
              Live
            </span>
          </div>

          <span
            className="text-sm font-semibold truncate"
            style={{ color: "var(--mf-text-primary)" }}
          >
            {session.meeting.title}
          </span>

          {isLocked && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: "var(--mf-warning-muted)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <Lock
                className="h-2.5 w-2.5"
                style={{ color: "var(--mf-warning)" }}
              />
              <span
                className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--mf-warning)" }}
              >
                Locked
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isReconnecting ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--mf-warning-muted)",
                border: "1px solid rgba(251,191,36,0.22)",
              }}
            >
              <WifiOff
                className="h-3 w-3"
                style={{ color: "var(--mf-warning)" }}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--mf-warning)" }}
              >
                Reconnecting…
              </span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5"
              style={{ color: "var(--mf-text-muted)" }}
            >
              <Wifi className="h-3 w-3" />
              <span className="text-[11px]">Connected</span>
            </div>
          )}
          {isRecording && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <Radio
                className="h-3 w-3"
                style={{ color: "var(--mf-danger)" }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--mf-danger)" }}
              >
                REC
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden z-0">
        <div
          className="flex flex-col flex-1 min-w-0 overflow-hidden relative"
          ref={spotlightContainerRef}
        >
          <AdmissionBar
            waitingParticipants={waitingRoom.waitingParticipants}
            onAdmit={handleAdmit}
            onDeny={handleDeny}
          />
          {hasScreenShare ? <ScreenShareView /> : <VideoGrid layout={layout} />}
          <CaptionsOverlay
            captions={transcription.captions}
            enabled={transcription.enabled}
          />
        </div>

        {participantsPanelOpen && (
          <ParticipantsPanel
            session={session}
            onClose={() => setParticipantsPanelOpen(false)}
            onMuteAll={handleMuteAll}
            onRemoveParticipant={handleRemoveParticipant}
            onSpotlight={handleSpotlight}
            onToggleLock={() => handleToggleLock(isLocked)}
            isLocked={isLocked}
          />
        )}
        {chatPanelOpen && (
          <MeetingChatPanel onClose={() => setChatPanelOpen(false)} />
        )}
        {pollsPanelOpen && (
          <PollsPanel
            activePoll={polls.activePoll}
            myVote={polls.myVote}
            isHost={session.role === "host"}
            onVote={polls.vote}
            onCreatePoll={polls.createPoll}
            onEndPoll={polls.endPoll}
            onClose={() => setPollsPanelOpen(false)}
          />
        )}
        {backgroundPanelOpen && (
          <BackgroundPanel
            hook={background}
            onClose={() => setBackgroundPanelOpen(false)}
          />
        )}
        {devicesPanelOpen && (
          <DeviceSettingsPanel
            hook={devices}
            onClose={() => setDevicesPanelOpen(false)}
          />
        )}
      </div>

      {/* ── Controls bar ──────────────────────────────────────────────── */}
      <div className="z-20">
        <MeetingControls
          meetingTitle={session.meeting.title}
          role={session.role}
          layout={layout}
          onLayoutToggle={toggleLayout}
          participantsPanelOpen={participantsPanelOpen}
          chatPanelOpen={chatPanelOpen}
          onToggleParticipants={handleToggleParticipants}
          onToggleChat={handleToggleChat}
          onTogglePollsPanel={handleTogglePolls}
          onToggleBackgroundPanel={handleToggleBackground}
          onToggleDevicesPanel={handleToggleDevices}
          onEndForEveryone={onEnd}
          onLeave={onLeave}
          onMuteAll={handleMuteAll}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          transcription={transcription}
          noise={noise}
          background={background}
          pip={pip}
          spotlightContainerRef={spotlightContainerRef}
          pollsPanelOpen={pollsPanelOpen}
          backgroundPanelOpen={backgroundPanelOpen}
          devicesPanelOpen={devicesPanelOpen}
          waitingCount={waitingRoom.waitingParticipants.length}
        />
      </div>
    </div>
  );
};

const MeetingRoom: React.FC<MeetingRoomProps> = (props): JSX.Element => (
  <MeetingDataProvider session={props.session}>
    <MeetingRoomInner {...props} />
  </MeetingDataProvider>
);

export default MeetingRoom;
