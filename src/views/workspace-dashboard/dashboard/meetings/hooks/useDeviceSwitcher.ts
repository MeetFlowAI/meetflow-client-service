/**
 * hooks/useDeviceSwitcher.ts
 *
 * Live device switching without reconnect — DIFFERENTIATOR FEATURE
 *
 * LiveKit API: localParticipant.switchActiveDevice(kind, deviceId)
 * This updates the published track in-place, no reconnect needed.
 *
 * Returns the available cameras/mics and helpers to switch them live.
 */

import { useState, useEffect, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";

export interface MediaDevice {
  deviceId: string;
  label: string;
}

export interface UseDeviceSwitcherReturn {
  cameras: MediaDevice[];
  microphones: MediaDevice[];
  speakers: MediaDevice[];
  activeCameraId: string | null;
  activeMicId: string | null;
  activeSpeakerId: string | null;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchSpeaker: (deviceId: string) => Promise<void>;
  isSwitching: boolean;
}

export function useDeviceSwitcher(): UseDeviceSwitcherReturn {
  const room = useRoomContext();

  const [cameras, setCameras] = useState<MediaDevice[]>([]);
  const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
  const [speakers, setSpeakers] = useState<MediaDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [activeMicId, setActiveMicId] = useState<string | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Enumerate devices on mount
  useEffect(() => {
    const enumerate = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(
          devices
            .filter(d => d.kind === "videoinput")
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` })),
        );
        setMicrophones(
          devices
            .filter(d => d.kind === "audioinput")
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` })),
        );
        setSpeakers(
          devices
            .filter(d => d.kind === "audiooutput")
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${i + 1}` })),
        );
      } catch { /* silent */ }
    };
    enumerate();
    navigator.mediaDevices.addEventListener("devicechange", enumerate);
    return () => navigator.mediaDevices.removeEventListener("devicechange", enumerate);
  }, []);

  // Read active device IDs from current room state
  useEffect(() => {
    setActiveCameraId(room.getActiveDevice("videoinput") ?? null);
    setActiveMicId(room.getActiveDevice("audioinput") ?? null);
    setActiveSpeakerId(room.getActiveDevice("audiooutput") ?? null);
  }, [room]);

  const switchCamera = useCallback(async (deviceId: string) => {
    setIsSwitching(true);
    try {
      await room.switchActiveDevice("videoinput", deviceId);
      setActiveCameraId(room.getActiveDevice("videoinput") ?? deviceId);
    } catch (e) {
      console.error("[MeetFlow] Camera switch failed:", e);
    } finally {
      setIsSwitching(false);
    }
  }, [room]);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    setIsSwitching(true);
    try {
      await room.switchActiveDevice("audioinput", deviceId);
      setActiveMicId(room.getActiveDevice("audioinput") ?? deviceId);
    } catch (e) {
      console.error("[MeetFlow] Mic switch failed:", e);
    } finally {
      setIsSwitching(false);
    }
  }, [room]);

  const switchSpeaker = useCallback(async (deviceId: string) => {
    setIsSwitching(true);
    try {
      await room.switchActiveDevice("audiooutput", deviceId);
      setActiveSpeakerId(room.getActiveDevice("audiooutput") ?? deviceId);
    } catch (e) {
      console.error("[MeetFlow] Speaker switch failed:", e);
    } finally {
      setIsSwitching(false);
    }
  }, [room]);

  return {
    cameras, microphones, speakers,
    activeCameraId, activeMicId, activeSpeakerId,
    switchCamera, switchMicrophone, switchSpeaker,
    isSwitching,
  };
}
