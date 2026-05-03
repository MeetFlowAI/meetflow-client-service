/**
 * hooks/useRecording.ts  (v2 — clean, no internal data channel)
 *
 * Recording state is broadcast by MeetingRoom via context.broadcastRecordingState.
 * This hook only owns the HTTP calls to start/stop Egress.
 */

import { useState, useCallback, useRef } from "react";
import axiosConfig from "@/lib/axios";

export interface UseRecordingReturn {
  isStarting: boolean;
  startRecording: (meetingId: number, workspaceId: number, channelId: number) => Promise<void>;
  stopRecording: (meetingId: number, workspaceId: number, channelId: number) => Promise<void>;
}

export function useRecording(
  onRecordingChange: (recording: boolean) => void,
): UseRecordingReturn {
  const [isStarting, setIsStarting] = useState(false);
  const egressIdRef = useRef<string | null>(null);

  const startRecording = useCallback(
    async (meetingId: number, workspaceId: number, channelId: number) => {
      setIsStarting(true);
      onRecordingChange(true); // optimistic
      try {
        const res = await axiosConfig.post(
          `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/recording/start`,
        );
        egressIdRef.current = (res.data?.data?.egress_id as string) ?? null;
      } catch (e) {
        console.error("[MeetFlow] Start recording failed:", e);
        onRecordingChange(false); // rollback
      } finally {
        setIsStarting(false);
      }
    },
    [onRecordingChange],
  );

  const stopRecording = useCallback(
    async (meetingId: number, workspaceId: number, channelId: number) => {
      onRecordingChange(false);
      try {
        await axiosConfig.post(
          `/workspace/${workspaceId}/channels/${channelId}/meetings/${meetingId}/recording/stop`,
          { egress_id: egressIdRef.current },
        );
        egressIdRef.current = null;
      } catch (e) {
        console.error("[MeetFlow] Stop recording failed:", e);
      }
    },
    [onRecordingChange],
  );

  return { isStarting, startRecording, stopRecording };
}
