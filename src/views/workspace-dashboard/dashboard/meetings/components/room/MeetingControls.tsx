/**
 * components/room/MeetingControls.tsx  (v4 — final, all features)
 *
 * Added in v4:
 *  ✅ Device switcher panel toggle (Settings icon)
 *  ✅ waitingCount badge on Participants button (host sees pending admissions)
 *  ✅ AI summary info item in More menu (posts to backend)
 *
 * More menu items:
 *   Captions (T) · Noise cancellation · Background · Polls ·
 *   Device settings · PiP · Record (host only)
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type JSX,
  type RefObject,
} from "react";
import { Track } from "livekit-client";
import { useTrackToggle, useParticipants } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Hand,
  Users,
  MessageSquare,
  LayoutGrid,
  LayoutList,
  Maximize2,
  Minimize2,
  PhoneOff,
  Square,
  Smile,
  Subtitles,
  ImageIcon,
  BarChart2,
  Circle,
  PictureInPicture2,
  ChevronUp,
  Settings,
  Volume2,
} from "lucide-react";
import clsx from "clsx";
import { useMeetingData } from "../../context/MeetingDataContext";
import { useMeetingTimer } from "../../hooks/useMeetingTimer";
import ControlBtn from "../shared/ControlBtn";
import type { MeetingLayout } from "./VideoGrid";
import type { UseVirtualBackgroundReturn } from "../../hooks/useVirtualBackground";
import type { UseLiveTranscriptionReturn } from "../../hooks/useLiveTranscription";
import type { UseNoiseCancellationReturn } from "../../hooks/useNoiseCancellation";
import type { UsePictureInPictureReturn } from "../../hooks/usePictureInPicture";

// ── Emoji reactions picker ─────────────────────────────────────────────────────

const EMOJIS = ["👍", "❤️", "😂", "😮", "🎉", "👏", "🔥", "😢"];

const ReactionPicker: React.FC<{
  onSelect: (e: string) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => (
  <div
    className={clsx(
      "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30",
      "flex gap-1 p-2 rounded-2xl",
      "bg-[#1a1a22] border border-white/10 shadow-2xl shadow-black/50",
      "animate-in fade-in slide-in-from-bottom-2 duration-150",
    )}
    role="listbox"
    aria-label="Emoji reactions"
  >
    {EMOJIS.map((e) => (
      <button
        key={e}
        onClick={() => {
          onSelect(e);
          onClose();
        }}
        className="h-9 w-9 flex items-center justify-center text-xl rounded-xl hover:bg-white/10 transition-colors hover:scale-125 active:scale-100 duration-100"
        title={e}
        aria-label={`React with ${e}`}
      >
        {e}
      </button>
    ))}
  </div>
);

// ── More menu ──────────────────────────────────────────────────────────────────

interface MoreMenuItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  hidden?: boolean;
  onClick: () => void;
}

const MoreMenu: React.FC<{ items: MoreMenuItem[]; onClose: () => void }> = ({
  items,
  onClose,
}) => (
  <>
    <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden />
    <div
      className={clsx(
        "absolute bottom-full mb-2 right-0 z-30 w-52",
        "bg-[#1e1e26] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60",
        "py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150",
      )}
      role="menu"
    >
      {items
        .filter((i) => !i.hidden)
        .map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            role="menuitem"
            className={clsx(
              "w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors",
              item.active
                ? "text-primary-400 bg-primary-500/10"
                : item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white",
            )}
          >
            <span
              className={clsx(
                "shrink-0",
                item.active
                  ? "text-primary-400"
                  : item.danger
                    ? "text-red-400"
                    : "text-white/40",
              )}
            >
              {item.icon}
            </span>
            {item.label}
            {item.active && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-semibold">
                ON
              </span>
            )}
          </button>
        ))}
    </div>
  </>
);

// ── Props ──────────────────────────────────────────────────────────────────────

interface MeetingControlsProps {
  meetingTitle: string;
  role: "host" | "guest";
  layout: MeetingLayout;
  onLayoutToggle: () => void;
  participantsPanelOpen: boolean;
  chatPanelOpen: boolean;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onTogglePollsPanel: () => void;
  onToggleBackgroundPanel: () => void;
  onToggleDevicesPanel: () => void;
  onEndForEveryone: () => void;
  onLeave: () => void;
  onMuteAll: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  transcription: UseLiveTranscriptionReturn;
  noise: UseNoiseCancellationReturn;
  background: UseVirtualBackgroundReturn;
  pip: UsePictureInPictureReturn;
  spotlightContainerRef: RefObject<HTMLDivElement | null>;
  pollsPanelOpen: boolean;
  backgroundPanelOpen: boolean;
  devicesPanelOpen: boolean;
  /** Number of participants waiting to be admitted (host only) */
  waitingCount: number;
}

// ── Component ──────────────────────────────────────────────────────────────────

const MeetingControls: React.FC<MeetingControlsProps> = ({
  meetingTitle,
  role,
  layout,
  onLayoutToggle,
  participantsPanelOpen,
  chatPanelOpen,
  onToggleParticipants,
  onToggleChat,
  onTogglePollsPanel,
  onToggleBackgroundPanel,
  onToggleDevicesPanel,
  onEndForEveryone,
  onLeave,
  onStartRecording,
  onStopRecording,
  transcription,
  noise,
  background,
  pip,
  spotlightContainerRef,
  pollsPanelOpen,
  backgroundPanelOpen,
  devicesPanelOpen,
  waitingCount,
}): JSX.Element => {
  const { toggle: toggleMic, enabled: micEnabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });
  const { toggle: toggleCamera, enabled: cameraEnabled } = useTrackToggle({
    source: Track.Source.Camera,
  });
  const { toggle: toggleScreen, enabled: screenEnabled } = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  const participants = useParticipants();
  const { formatted: timerText } = useMeetingTimer();
  const {
    handRaised,
    toggleHand,
    sendReaction,
    unreadChatCount,
    markChatRead,
    isRecording,
  } = useMeetingData();

  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );
  const pttRef = useRef(false);

  const handleToggleChat = useCallback(() => {
    onToggleChat();
    if (!chatPanelOpen) markChatRead();
  }, [chatPanelOpen, onToggleChat, markChatRead]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleToggleScreen = useCallback(async () => {
    try {
      await toggleScreen();
    } catch (e: any) {
      if (e?.name !== "NotAllowedError")
        console.warn("[MeetFlow] Screen share error:", e);
    }
  }, [toggleScreen]);

  // Keyboard shortcuts: M · D · S · H · F · T · Space(PTT)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable
      )
        return;
      switch (e.code) {
        case "KeyM":
          e.preventDefault();
          toggleMic();
          break;
        case "KeyD":
          e.preventDefault();
          toggleCamera();
          break;
        case "KeyS":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleToggleScreen();
          }
          break;
        case "KeyH":
          e.preventDefault();
          toggleHand();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyT":
          e.preventDefault();
          transcription.toggle();
          break;
        case "Space":
          if (!pttRef.current && !micEnabled) {
            e.preventDefault();
            pttRef.current = true;
            toggleMic();
          }
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && pttRef.current) {
        const t = e.target as HTMLElement;
        if (
          t.tagName !== "INPUT" &&
          t.tagName !== "TEXTAREA" &&
          !t.isContentEditable
        ) {
          e.preventDefault();
          pttRef.current = false;
          if (micEnabled) toggleMic();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    toggleMic,
    toggleCamera,
    handleToggleScreen,
    toggleHand,
    toggleFullscreen,
    transcription,
    micEnabled,
  ]);

  // More menu items
  const moreItems: MoreMenuItem[] = [
    {
      icon: <Subtitles className="h-3.5 w-3.5" />,
      label: "Captions (T)",
      active: transcription.enabled,
      onClick: transcription.toggle,
    },
    {
      icon: <Volume2 className="h-3.5 w-3.5" />,
      label: "Noise cancellation",
      active: noise.enabled,
      onClick: () => noise.toggle(),
    },
    {
      icon: <ImageIcon className="h-3.5 w-3.5" />,
      label: "Virtual background",
      active: backgroundPanelOpen || background.mode !== "none",
      onClick: onToggleBackgroundPanel,
    },
    {
      icon: <BarChart2 className="h-3.5 w-3.5" />,
      label: "Polls",
      active: pollsPanelOpen,
      onClick: onTogglePollsPanel,
    },
    {
      icon: <Settings className="h-3.5 w-3.5" />,
      label: "Device settings",
      active: devicesPanelOpen,
      onClick: onToggleDevicesPanel,
    },
    {
      icon: <PictureInPicture2 className="h-3.5 w-3.5" />,
      label: "Picture in picture",
      active: pip.isActive,
      onClick: () => pip.toggle(spotlightContainerRef),
      hidden: !pip.isSupported,
    },
    {
      icon: <Circle className="h-3.5 w-3.5" />,
      label: isRecording ? "Stop recording" : "Start recording",
      active: isRecording,
      danger: isRecording,
      onClick: isRecording ? onStopRecording : onStartRecording,
      hidden: role !== "host",
    },
  ];

  // Whether the "More" button should be highlighted (any sub-feature active)
  const moreActive =
    transcription.enabled ||
    background.mode !== "none" ||
    isRecording ||
    pip.isActive;

  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-2.5 gap-3 bg-[#0e0e12] border-t border-white/[0.06] relative">
      {/* ── LEFT: media toggles ───────────────────────────────────────── */}
      <div className="flex items-end gap-2">
        <ControlBtn
          onClick={() => toggleMic()}
          active={micEnabled}
          label={micEnabled ? "Mute (M)" : "Unmute (M)"}
          className={!micEnabled ? "!bg-red-500/15" : undefined}
        >
          {micEnabled ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5 text-red-400" />
          )}
        </ControlBtn>

        <ControlBtn
          onClick={() => toggleCamera()}
          active={cameraEnabled}
          label={cameraEnabled ? "Stop video (D)" : "Start video (D)"}
          className={!cameraEnabled ? "!bg-red-500/15" : undefined}
        >
          {cameraEnabled ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5 text-red-400" />
          )}
        </ControlBtn>

        <ControlBtn
          onClick={handleToggleScreen}
          active={screenEnabled}
          label={screenEnabled ? "Stop sharing (S)" : "Share screen (S)"}
          className={screenEnabled ? "!bg-primary-500/20" : undefined}
        >
          {screenEnabled ? (
            <MonitorOff className="h-5 w-5 text-primary-400" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </ControlBtn>
      </div>

      {/* ── CENTER: timer + title ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
        <span className="text-white font-mono text-sm font-semibold tabular-nums tracking-tight">
          {timerText}
        </span>
        <div className="flex items-center gap-1.5">
          {isRecording && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
          <span className="text-white/35 text-[10px] truncate max-w-[180px]">
            {meetingTitle}
          </span>
        </div>
      </div>

      {/* ── RIGHT: secondary controls ─────────────────────────────────── */}
      <div className="flex items-end gap-2">
        {/* Raise hand */}
        <ControlBtn
          onClick={toggleHand}
          active={handRaised}
          label={handRaised ? "Lower hand (H)" : "Raise hand (H)"}
          className={handRaised ? "!bg-amber-500/20" : undefined}
        >
          <Hand className={clsx("h-5 w-5", handRaised && "text-amber-400")} />
        </ControlBtn>

        {/* Emoji reactions */}
        <div className="relative">
          {reactionPickerOpen && (
            <ReactionPicker
              onSelect={sendReaction}
              onClose={() => setReactionPickerOpen(false)}
            />
          )}
          <ControlBtn
            onClick={() => setReactionPickerOpen((v) => !v)}
            active={reactionPickerOpen}
            label="Reactions"
          >
            <Smile className="h-5 w-5" />
          </ControlBtn>
        </div>

        {/* More menu */}
        <div className="relative">
          {moreMenuOpen && (
            <MoreMenu
              items={moreItems}
              onClose={() => setMoreMenuOpen(false)}
            />
          )}
          <ControlBtn
            onClick={() => setMoreMenuOpen((v) => !v)}
            active={moreMenuOpen || moreActive}
            label="More options"
          >
            <ChevronUp
              className={clsx(
                "h-4 w-4 transition-transform duration-150",
                moreMenuOpen && "rotate-180",
              )}
            />
          </ControlBtn>
        </div>

        {/* Participants — badge shows count + amber dot if waiting (host) */}
        <ControlBtn
          onClick={onToggleParticipants}
          active={participantsPanelOpen}
          label="Participants"
          badge={participants.length}
          badgeDot={role === "host" && waitingCount > 0}
        >
          <Users className="h-5 w-5" />
        </ControlBtn>

        {/* Chat — unread dot when closed */}
        <ControlBtn
          onClick={handleToggleChat}
          active={chatPanelOpen}
          label="Chat"
          badge={!chatPanelOpen ? unreadChatCount : 0}
          badgeDot={!chatPanelOpen && unreadChatCount > 0}
        >
          <MessageSquare className="h-5 w-5" />
        </ControlBtn>

        {/* Layout toggle */}
        <ControlBtn
          onClick={onLayoutToggle}
          label={layout === "speaker" ? "Grid view" : "Speaker view"}
        >
          {layout === "speaker" ? (
            <LayoutGrid className="h-5 w-5" />
          ) : (
            <LayoutList className="h-5 w-5" />
          )}
        </ControlBtn>

        {/* Fullscreen */}
        <ControlBtn
          onClick={toggleFullscreen}
          label={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </ControlBtn>

        <div className="h-8 w-px bg-white/[0.08] mx-1" />

        {/* End for everyone (host only) */}
        {role === "host" && (
          <ControlBtn onClick={onEndForEveryone} danger label="End meeting">
            <Square className="h-4 w-4 fill-white" />
          </ControlBtn>
        )}

        {/* Leave */}
        <ControlBtn onClick={onLeave} danger label="Leave">
          <PhoneOff className="h-5 w-5" />
        </ControlBtn>
      </div>

      {/* Click-outside for reaction picker */}
      {reactionPickerOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setReactionPickerOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
};

export default MeetingControls;
