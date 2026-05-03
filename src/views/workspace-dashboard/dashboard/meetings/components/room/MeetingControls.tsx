/**
 * MeetingControls.tsx  (v5 — premium redesign, CSS token theming)
 *
 * Design:
 *  - Floating glass bar (not flush, lifted 10px off bottom edge)
 *  - Blur backdrop
 *  - Subtle separator between left/center/right groups
 *  - Smooth hover lift on every button
 *  - Danger buttons are pill-shaped for clear visual distinction
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
import { useMeetingData } from "../../context/useMeetingData";
import { useMeetingTimer } from "../../hooks/useMeetingTimer";
import ControlBtn from "../shared/ControlBtn";
import type { MeetingLayout } from "./VideoGrid";
import type { UseVirtualBackgroundReturn } from "../../hooks/useVirtualBackground";
import type { UseLiveTranscriptionReturn } from "../../hooks/useLiveTranscription";
import type { UseNoiseCancellationReturn } from "../../hooks/useNoiseCancellation";
import type { UsePictureInPictureReturn } from "../../hooks/usePictureInPicture";

// ── Emoji picker ───────────────────────────────────────────────────────────────

const EMOJIS = ["👍", "❤️", "😂", "😮", "🎉", "👏", "🔥", "😢"];

const ReactionPicker: React.FC<{
  onSelect: (e: string) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => (
  <div
    className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-40 flex gap-1 p-2 rounded-2xl"
    style={{
      background: "var(--mf-bg-elevated)",
      border: "1px solid var(--mf-border-medium)",
      boxShadow: "var(--mf-shadow-lg)",
      backdropFilter: "blur(12px)",
      animation: "mf-admit-in 0.15s ease-out",
    }}
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
        className="h-9 w-9 flex items-center justify-center text-xl rounded-xl transition-all duration-100 hover:scale-125 active:scale-100"
        style={{ borderRadius: "var(--mf-radius-md)" }}
        onMouseEnter={(ev) =>
          (ev.currentTarget.style.background = "var(--mf-bg-surface)")
        }
        onMouseLeave={(ev) =>
          (ev.currentTarget.style.background = "transparent")
        }
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
    <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
    <div
      className="absolute bottom-[calc(100%+8px)] right-0 z-40 w-52 py-1.5"
      style={{
        background: "var(--mf-bg-elevated)",
        border: "1px solid var(--mf-border-medium)",
        borderRadius: "var(--mf-radius-lg)",
        boxShadow: "var(--mf-shadow-lg)",
        backdropFilter: "blur(12px)",
        animation: "mf-admit-in 0.15s ease-out",
      }}
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
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors duration-100"
            style={{
              color: item.active
                ? "var(--mf-accent-text)"
                : item.danger
                  ? "var(--mf-danger)"
                  : "var(--mf-text-secondary)",
              background: item.active
                ? "var(--mf-accent-subtle)"
                : "transparent",
            }}
            onMouseEnter={(ev) => {
              if (!item.active)
                ev.currentTarget.style.background = "var(--mf-bg-surface)";
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.background = item.active
                ? "var(--mf-accent-subtle)"
                : "transparent";
            }}
          >
            <span
              style={{
                color: item.active
                  ? "var(--mf-accent-text)"
                  : item.danger
                    ? "var(--mf-danger)"
                    : "var(--mf-text-muted)",
              }}
            >
              {item.icon}
            </span>
            {item.label}
            {item.active && (
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: "var(--mf-accent-muted)",
                  color: "var(--mf-accent-text)",
                }}
              >
                ON
              </span>
            )}
          </button>
        ))}
    </div>
  </>
);

// ── Vertical separator ─────────────────────────────────────────────────────────

const Sep = () => (
  <div
    className="h-8 w-px mx-1 shrink-0"
    style={{ background: "var(--mf-border-medium)" }}
    aria-hidden
  />
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
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const handleToggleScreen = useCallback(async () => {
    try {
      await toggleScreen();
    } catch (e: any) {
      if (e?.name !== "NotAllowedError") console.warn(e);
    }
  }, [toggleScreen]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
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
    const ku = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
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

  const moreActive =
    transcription.enabled ||
    background.mode !== "none" ||
    isRecording ||
    pip.isActive;

  return (
    /* Floating bar container — 10px bottom margin, full width */
    <div
      className="shrink-0 px-3 pb-3 pt-0"
      style={{ background: "var(--mf-bg-base)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 relative"
        style={{
          background: "var(--mf-ctrl-bg)",
          border: "1px solid var(--mf-border-medium)",
          borderRadius: "var(--mf-radius-xl)",
          boxShadow: "var(--mf-shadow-md)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          minHeight: "68px",
        }}
      >
        {/* ── LEFT: media controls ──────────────────────────────────── */}
        <div className="flex items-end gap-1.5">
          <ControlBtn
            onClick={() => toggleMic()}
            active={micEnabled}
            muted={!micEnabled}
            label={micEnabled ? "Mute (M)" : "Unmute (M)"}
          >
            {micEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </ControlBtn>

          <ControlBtn
            onClick={() => toggleCamera()}
            active={cameraEnabled}
            muted={!cameraEnabled}
            label={cameraEnabled ? "Stop video (D)" : "Start video (D)"}
          >
            {cameraEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </ControlBtn>

          <ControlBtn
            onClick={handleToggleScreen}
            active={screenEnabled}
            label={screenEnabled ? "Stop sharing (S)" : "Share screen (S)"}
          >
            {screenEnabled ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </ControlBtn>
        </div>

        <Sep />

        {/* ── CENTER: timer + title ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5 min-w-0 flex-1 px-3">
          <span
            className="font-mono text-[14px] font-semibold tabular-nums tracking-tight"
            style={{ color: "var(--mf-text-primary)" }}
          >
            {timerText}
          </span>
          <div className="flex items-center gap-1.5">
            {isRecording && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--mf-danger)",
                  animation: "mf-live-dot 1.2s ease infinite",
                }}
              />
            )}
            <span
              className="text-[10px] font-medium truncate max-w-[160px]"
              style={{ color: "var(--mf-text-muted)" }}
            >
              {meetingTitle}
            </span>
          </div>
        </div>

        <Sep />

        {/* ── RIGHT: secondary controls ─────────────────────────────── */}
        <div className="flex items-end gap-1.5">
          <ControlBtn
            onClick={toggleHand}
            active={handRaised}
            label={handRaised ? "Lower hand (H)" : "Raise hand (H)"}
          >
            <Hand className="h-5 w-5" />
          </ControlBtn>

          {/* Reactions */}
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

          {/* More */}
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
              label="More"
            >
              <ChevronUp
                className={clsx(
                  "h-4 w-4 transition-transform duration-150",
                  moreMenuOpen && "rotate-180",
                )}
              />
            </ControlBtn>
          </div>

          <ControlBtn
            onClick={onToggleParticipants}
            active={participantsPanelOpen}
            label="Participants"
            badge={participants.length}
            badgeDot={role === "host" && waitingCount > 0}
          >
            <Users className="h-5 w-5" />
          </ControlBtn>

          <ControlBtn
            onClick={handleToggleChat}
            active={chatPanelOpen}
            label="Chat"
            badge={!chatPanelOpen ? unreadChatCount : 0}
            badgeDot={!chatPanelOpen && unreadChatCount > 0}
          >
            <MessageSquare className="h-5 w-5" />
          </ControlBtn>

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

          <Sep />

          {role === "host" && (
            <ControlBtn onClick={onEndForEveryone} danger label="End">
              <Square className="h-4 w-4 fill-white" />
            </ControlBtn>
          )}

          <ControlBtn onClick={onLeave} danger label="Leave">
            <PhoneOff className="h-5 w-5" />
          </ControlBtn>
        </div>
      </div>

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
