/**
 * components/room/MeetingRoom.tsx  (v4 — COMPLETE, all features)
 *
 * Added in v4:
 *  ✅ useWaitingRoom — guest waiting screen + host admission bar
 *  ✅ useDeviceSwitcher — live camera/mic/speaker switching
 *  ✅ DeviceSettingsPanel — accessible from More menu
 */

import React, {
  useState, useEffect, useRef, useCallback, type JSX,
} from "react";
import { Track } from "livekit-client";
import {
  RoomAudioRenderer, useTracks, useChat, useLocalParticipant,
} from "@livekit/components-react";
import { Wifi, WifiOff, Radio, Lock } from "lucide-react";
import axiosConfig from "@/lib/axios";

import type { IStartMeetingResponse } from "@/services/workspace-dashboard/meetings";
import { MeetingDataProvider, useMeetingData } from "../../context/MeetingDataContext";
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

const MeetingRoomInner: React.FC<MeetingRoomProps> = ({ session, onLeave, onEnd }): JSX.Element => {
  // Panel state
  const [layout, setLayout] = useState<MeetingLayout>("speaker");
  const [participantsPanelOpen, setParticipantsPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [pollsPanelOpen, setPollsPanelOpen] = useState(false);
  const [backgroundPanelOpen, setBackgroundPanelOpen] = useState(false);
  const [devicesPanelOpen, setDevicesPanelOpen] = useState(false);

  // Context
  const {
    isReconnecting, isRecording, setIsRecording, isLocked,
    incrementUnreadChat, markChatRead,
    setPinnedIdentity,
    broadcastMuteAll, broadcastSpotlight, broadcastLock, broadcastRecordingState,
  } = useMeetingData();

  const { localParticipant } = useLocalParticipant();

  // Screen share detection
  const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const hasScreenShare = screenShareTracks.length > 0;

  // Unread chat tracking
  const { chatMessages } = useChat();
  const prevMsgCountRef = useRef(chatMessages.length);
  const localIdentityRef = useRef(localParticipant.identity);
  const chatOpenRef = useRef(chatPanelOpen);
  useEffect(() => { localIdentityRef.current = localParticipant.identity; }, [localParticipant.identity]);
  useEffect(() => { chatOpenRef.current = chatPanelOpen; }, [chatPanelOpen]);
  useEffect(() => {
    if (chatMessages.length <= prevMsgCountRef.current) { prevMsgCountRef.current = chatMessages.length; return; }
    const newMsgs = chatMessages.slice(prevMsgCountRef.current);
    prevMsgCountRef.current = chatMessages.length;
    if (!chatOpenRef.current) {
      newMsgs.filter(m => m.from?.identity !== localIdentityRef.current).forEach(() => incrementUnreadChat());
    }
  }, [chatMessages, incrementUnreadChat]);

  // All differentiator hooks
  const background = useVirtualBackground();
  const noise = useNoiseCancellation();
  const transcription = useLiveTranscription();
  const pip = usePictureInPicture();
  const polls = usePolls();
  const devices = useDeviceSwitcher();

  const recording = useRecording(useCallback((rec: boolean) => {
    setIsRecording(rec);
    broadcastRecordingState(rec);
  }, [setIsRecording, broadcastRecordingState]));

  // Waiting room
  const waitingRoom = useWaitingRoom(session.role);

  const spotlightContainerRef = useRef<HTMLDivElement>(null);

  // Panel helpers — only one right panel open at a time
  const handleToggleParticipants = useCallback(() => setParticipantsPanelOpen(v => !v), []);

  const handleToggleChat = useCallback(() => {
    setChatPanelOpen(v => {
      const next = !v;
      if (next) { markChatRead(); setPollsPanelOpen(false); setBackgroundPanelOpen(false); setDevicesPanelOpen(false); }
      return next;
    });
  }, [markChatRead]);

  const handleTogglePolls = useCallback(() => {
    setPollsPanelOpen(v => { if (!v) { setChatPanelOpen(false); setBackgroundPanelOpen(false); setDevicesPanelOpen(false); } return !v; });
  }, []);

  const handleToggleBackground = useCallback(() => {
    setBackgroundPanelOpen(v => { if (!v) { setChatPanelOpen(false); setPollsPanelOpen(false); setDevicesPanelOpen(false); } return !v; });
  }, []);

  const handleToggleDevices = useCallback(() => {
    setDevicesPanelOpen(v => { if (!v) { setChatPanelOpen(false); setPollsPanelOpen(false); setBackgroundPanelOpen(false); } return !v; });
  }, []);

  const toggleLayout = useCallback(() => setLayout(l => l === "speaker" ? "grid" : "speaker"), []);

  // Host controls
  const handleMuteAll = useCallback(() => broadcastMuteAll(), [broadcastMuteAll]);
  const handleSpotlight = useCallback((identity: string) => { setPinnedIdentity(identity); broadcastSpotlight(identity); }, [setPinnedIdentity, broadcastSpotlight]);
  const handleToggleLock = useCallback((currentLocked: boolean) => broadcastLock(!currentLocked), [broadcastLock]);

  const handleRemoveParticipant = useCallback((identity: string) => {
    const { id, workspace_id, channel_id } = session.meeting;
    axiosConfig.post(`/workspace/${workspace_id}/channels/${channel_id}/meetings/${id}/remove-participant`, { identity }).catch(() => {});
  }, [session.meeting]);

  const handleStartRecording = useCallback(() => {
    const { id, workspace_id, channel_id } = session.meeting;
    recording.startRecording(id, workspace_id, channel_id);
  }, [session.meeting, recording]);

  const handleStopRecording = useCallback(() => {
    const { id, workspace_id, channel_id } = session.meeting;
    recording.stopRecording(id, workspace_id, channel_id);
  }, [session.meeting, recording]);

  // Waiting room admit/deny
  const handleAdmit = useCallback((identity: string) => {
    const { id, workspace_id, channel_id } = session.meeting;
    waitingRoom.admit(identity, id, workspace_id, channel_id);
  }, [session.meeting, waitingRoom]);

  const handleDeny = useCallback((identity: string) => {
    const { id, workspace_id, channel_id } = session.meeting;
    waitingRoom.deny(identity, id, workspace_id, channel_id);
  }, [session.meeting, waitingRoom]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f] relative">
      <RoomAudioRenderer />

      {/* Guest waiting screen — covers entire meeting UI */}
      {waitingRoom.isWaiting && <WaitingScreen />}

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <ReactionsOverlay />
      </div>

      {/* ── Topbar ────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#0d0d0f] border-b border-white/[0.06] z-20 relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/[0.1] border border-red-500/20 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider">Live</span>
          </div>
          <span className="text-white/65 text-sm font-medium truncate">{session.meeting.title}</span>
          {isLocked && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Lock className="h-2.5 w-2.5 text-amber-400" />
              <span className="text-amber-400 text-[9px] font-semibold uppercase tracking-wider">Locked</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {isReconnecting ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <WifiOff className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-medium">Reconnecting…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-white/20">
              <Wifi className="h-3 w-3" />
              <span className="text-[11px]">Connected</span>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/[0.1] border border-red-500/20">
              <Radio className="h-3 w-3 text-red-400" />
              <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider">REC</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative z-0">
        {/* Video area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative" ref={spotlightContainerRef}>
          {/* Host: admission bar for waiting participants */}
          <AdmissionBar
            waitingParticipants={waitingRoom.waitingParticipants}
            onAdmit={handleAdmit}
            onDeny={handleDeny}
          />
          {hasScreenShare ? <ScreenShareView /> : <VideoGrid layout={layout} />}
          <CaptionsOverlay captions={transcription.captions} enabled={transcription.enabled} />
        </div>

        {/* Right panels */}
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
        {chatPanelOpen && <MeetingChatPanel onClose={() => setChatPanelOpen(false)} />}
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
        {backgroundPanelOpen && <BackgroundPanel hook={background} onClose={() => setBackgroundPanelOpen(false)} />}
        {devicesPanelOpen && <DeviceSettingsPanel hook={devices} onClose={() => setDevicesPanelOpen(false)} />}
      </div>

      {/* ── Controls bar ──────────────────────────────────────────────── */}
      <div className="z-20 relative">
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
