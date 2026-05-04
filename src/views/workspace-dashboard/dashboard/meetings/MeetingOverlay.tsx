/**
 * MeetingOverlay.tsx
 *
 * Full-page meeting overlay entry point.
 *
 * UX Decision: Meeting runs INLINE inside the app (not a new tab).
 *
 * Rationale:
 *  1. RELIABILITY — New tab approach loses authentication context, requires
 *     token re-hydration, and breaks on Safari/Firefox popup blockers.
 *  2. SCALABILITY — Inline keeps the React tree alive; we can persist channel
 *     messages, show notification banners, and return seamlessly after the call.
 *  3. UX CONTINUITY — Users can reference channel history without alt-tabbing.
 *     Same pattern used by Slack Huddles, Linear Calls, and Notion Calls.
 *  4. PERFORMANCE — No new JS bundle parse/eval cost for the new tab.
 *     The LiveKit SDK is already loaded in the current bundle.
 *
 * Implementation:
 *   - MeetingOverlay renders as `fixed inset-0 z-50` — covers the entire app
 *   - Escape key is disabled inside the meeting (prevents accidental leave)
 *   - Tab title updates to show "🔴 {meetingTitle} — MeetFlow" during the call
 *   - Title restores on leave/end
 *   - Error boundary wraps LiveKitRoom to prevent full-app crash on SDK errors
 *
 * Stage machine:
 *   "pre-join"  → MeetingPreJoin (camera/mic setup)
 *   "in-room"   → LiveKitRoom + MeetingRoom (live meeting)
 */

import React, {
  useState,
  useEffect,
  Component,
  type JSX,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";

import type { IStartMeetingResponse } from "@/services/workspace-dashboard/meetings";
import MeetingPreJoin, { type PreJoinChoices } from "./components/pre-join/MeetingPreJoin";
import MeetingRoom from "./components/room/MeetingRoom";

// ── Error Boundary ─────────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; message: string }

class LiveKitErrorBoundary extends Component<
  { children: ReactNode; onLeave: () => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MeetFlow] LiveKit error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#0d0d0f] text-center px-8 gap-5">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-2">
              Something went wrong with the meeting
            </p>
            <p className="text-white/40 text-sm max-w-sm">
              {this.state.message || "An unexpected error occurred. Please leave and try again."}
            </p>
          </div>
          <button
            onClick={this.props.onLeave}
            className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
          >
            Leave Meeting
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main Overlay ───────────────────────────────────────────────────────────────

interface MeetingOverlayProps {
  session: IStartMeetingResponse;
  onLeave: () => void;
  onEnd: () => void;
}

type Stage = "pre-join" | "in-room";

const MeetingOverlay: React.FC<MeetingOverlayProps> = ({
  session,
  onLeave,
  onEnd,
}): JSX.Element => {
  const [stage, setStage] = useState<Stage>("pre-join");
  const [choices, setChoices] = useState<PreJoinChoices | null>(null);

  // ── Update browser tab title during meeting ────────────────────────────
  useEffect(() => {
    const original = document.title;
    document.title = `🔴 ${session.meeting.title} — MeetFlow`;
    return () => {
      document.title = original;
    };
  }, [session.meeting.title]);

  // ── Prevent Escape key from bubbling and closing overlays ────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only stop propagation — we don't want Escape to close the meeting
        // accidentally. User must click Leave/End explicitly.
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const handlePreJoinSubmit = (c: PreJoinChoices) => {
    setChoices(c);
    setStage("in-room");
  };

  // ── Stage 1: Pre-join ──────────────────────────────────────────────────
  if (stage === "pre-join") {
    return (
      <MeetingPreJoin
        meetingTitle={session.meeting.title}
        role={session.role}
        onJoin={handlePreJoinSubmit}
        onCancel={onLeave}
      />
    );
  }

  // ── Stage 2: In-room ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50">
      <LiveKitErrorBoundary onLeave={onLeave}>
        {/*
          LiveKitRoom is the SDK context provider.
          - serverUrl: LiveKit server URL from backend token response
          - token: per-participant JWT from backend
          - connect: true — initiate connection immediately on mount
          - audio/video: from pre-join user choices
          - onDisconnected: when LiveKit fully disconnects → surface leave
          - options: disable default log noise in production
        */}
        <LiveKitRoom
          serverUrl={session.livekit_url}
          token={session.token}
          connect={true}
          audio={choices?.audioEnabled ?? true}
          video={choices?.videoEnabled ?? true}
          onDisconnected={onLeave}
          style={{ width: "100%", height: "100%" }}
          data-lk-theme="default"
          options={{
            disconnectOnPageLeave: true,
            // Publish quality: let LiveKit auto-select based on connection
            publishDefaults: {
              simulcast: true,
              videoSimulcastLayers: undefined, // use LiveKit defaults
              dtx: true, // Discontinuous Transmission — saves bandwidth on silence
              red: true, // Redundant encoding for packet loss resilience
            },
            // Capture defaults — can be overridden by device selection
            audioCaptureDefaults: {
              deviceId: choices?.audioDeviceId || undefined,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            videoCaptureDefaults: {
              deviceId: choices?.videoDeviceId || undefined,
            },
          }}
        >
          <MeetingRoom session={session} onLeave={onLeave} onEnd={onEnd} />
        </LiveKitRoom>
      </LiveKitErrorBoundary>
    </div>
  );
};

export default MeetingOverlay;
