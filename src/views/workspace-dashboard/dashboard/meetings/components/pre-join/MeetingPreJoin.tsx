/**
 * MeetingPreJoin.tsx  (v3 — premium redesign, theme-aware)
 *
 * Design system: uses [data-prejoin] CSS tokens from meeting.css.
 * Supports light + dark mode fully through CSS variables.
 *
 * Layout:
 *   Full-screen gradient backdrop
 *   └── Centered glass card (max-w-3xl)
 *       ├── LEFT: camera preview + mic/cam toggles
 *       └── RIGHT: identity · device selects · mic bars · join CTA
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type JSX,
} from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ChevronDown,
  Shield,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { typography } from "@/theme/typography";
import {
  getParticipantColor,
  getParticipantInitials,
  getDisplayName,
} from "../../utils/participant";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PreJoinChoices {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId: string;
  audioDeviceId: string;
}

interface MeetingPreJoinProps {
  meetingTitle: string;
  role: "host" | "guest";
  userName?: string;
  userIdentity?: string;
  onJoin: (choices: PreJoinChoices) => void;
  onCancel: () => void;
}

interface MediaDeviceItem {
  deviceId: string;
  label: string;
}

// ── Mic level bars visualiser ──────────────────────────────────────────────────

const MicBars: React.FC<{ level: number; active: boolean }> = ({
  level,
  active,
}) => {
  const bars = 5;
  return (
    <div className="flex items-center gap-0.5 h-5" aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const threshold = ((i + 1) / bars) * 100;
        const lit = active && level >= threshold * 0.7;
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-75"
            style={{
              width: "3px",
              height: `${8 + i * 3}px`,
              background: lit
                ? level > 80
                  ? "var(--mf-danger)"
                  : "var(--mf-success)"
                : "var(--mf-pj-input-bg)",
              opacity: active ? 1 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Device select ──────────────────────────────────────────────────────────────

const DeviceSelect: React.FC<{
  label: string;
  id: string;
  devices: MediaDeviceItem[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}> = ({ label, id, devices, value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-[10px] font-semibold uppercase tracking-widest"
      style={{ color: "var(--mf-pj-text-muted)" }}
    >
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none h-10 pl-3 pr-9 text-sm outline-none transition-all duration-150"
        style={{
          background: "var(--mf-pj-input-bg)",
          border: "1px solid var(--mf-pj-input-border)",
          borderRadius: "10px",
          color: "var(--mf-pj-text-primary)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onFocus={(e) => {
          (e.target as HTMLElement).style.borderColor = "var(--mf-accent)";
          (e.target as HTMLElement).style.boxShadow =
            "0 0 0 3px var(--mf-pj-input-focus)";
        }}
        onBlur={(e) => {
          (e.target as HTMLElement).style.borderColor =
            "var(--mf-pj-input-border)";
          (e.target as HTMLElement).style.boxShadow = "none";
        }}
      >
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
        {devices.length === 0 && <option value="">No devices found</option>}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
        style={{ color: "var(--mf-pj-text-muted)" }}
      />
    </div>
  </div>
);

// ── Toggle button ──────────────────────────────────────────────────────────────

const ToggleBtn: React.FC<{
  on: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
}> = ({ on, onClick, onIcon, offIcon, onLabel, offLabel, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 rounded-xl select-none"
    style={{
      background: on ? "var(--mf-pj-toggle-on)" : "var(--mf-pj-toggle-off)",
      color: on
        ? "var(--mf-pj-toggle-on-text)"
        : "var(--mf-pj-toggle-off-text)",
      border: on
        ? "1px solid var(--mf-pj-surface-border)"
        : "1px solid rgba(239,68,68,0.25)",
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    {on ? onIcon : offIcon}
    {on ? onLabel : offLabel}
  </button>
);

// ── Main component ─────────────────────────────────────────────────────────────

const MeetingPreJoin: React.FC<MeetingPreJoinProps> = ({
  meetingTitle,
  role,
  userName,
  userIdentity,
  onJoin,
  onCancel,
}): JSX.Element => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceItem[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceItem[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [permState, setPermState] = useState<
    "loading" | "granted" | "denied" | "unavailable"
  >("loading");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(animRef.current);
  }, []);

  const startPreview = useCallback(
    async (camId?: string, micId?: string) => {
      stopStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: camId ? { deviceId: { exact: camId } } : true,
          audio: micId ? { deviceId: { exact: micId } } : true,
        });
        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // toggle track based on current state
          stream.getVideoTracks().forEach((t) => {
            t.enabled = videoEnabled;
          });
          stream.getAudioTracks().forEach((t) => {
            t.enabled = audioEnabled;
          });
        }
        // Mic analyser
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const tick = () => {
          if (!mountedRef.current) return;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((s, v) => s + v, 0) / data.length;
          setMicLevel(Math.min(100, (avg / 128) * 250));
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e: any) {
        if (!mountedRef.current) return;
        setPermState(e?.name === "NotFoundError" ? "unavailable" : "denied");
      }
    },
    [stopStream, videoEnabled, audioEnabled],
  );

  useEffect(() => {
    mountedRef.current = true;

    const initDevices = async () => {
      try {
        // Start with current toggle states
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          stream.getVideoTracks().forEach((t) => {
            t.enabled = videoEnabled;
          });
          stream.getAudioTracks().forEach((t) => {
            t.enabled = audioEnabled;
          });
        }

        // Mic analyser
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const tick = () => {
          if (!mountedRef.current) return;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((s, v) => s + v, 0) / data.length;
          setMicLevel(Math.min(100, (avg / 128) * 250));
          animRef.current = requestAnimationFrame(tick);
        };
        tick();

        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mountedRef.current) return;
        const cams = devices
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${i + 1}`,
          }));
        const mics = devices
          .filter((d) => d.kind === "audioinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${i + 1}`,
          }));
        setCameras(cams);
        setMicrophones(mics);
        setSelectedCamera(cams[0]?.deviceId ?? "");
        setSelectedMic(mics[0]?.deviceId ?? "");
        setPermState("granted");
      } catch (e: any) {
        if (!mountedRef.current) return;
        setPermState(e?.name === "NotFoundError" ? "unavailable" : "denied");
      }
    };

    initDevices();

    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = videoEnabled;
    });
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = audioEnabled;
    });
  }, [videoEnabled, audioEnabled]);

  const handleCameraSwitch = async (id: string) => {
    setSelectedCamera(id);
    if (permState === "granted") await startPreview(id, selectedMic);
  };

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !videoEnabled;
    });
    setVideoEnabled((v) => !v);
  };

  const toggleAudio = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !audioEnabled;
    });
    setAudioEnabled((v) => !v);
  };

  const displayName = getDisplayName(userName, userIdentity);
  const avatarColor = getParticipantColor(userIdentity ?? displayName);
  const initials = getParticipantInitials(displayName);
  const isLoading = permState === "loading";

  return (
    <div
      data-prejoin
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{
        background:
          "linear-gradient(135deg, var(--mf-pj-bg-from) 0%, var(--mf-pj-bg-to) 100%)",
      }}
    >
      {/* Ambient accent blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(77,65,243,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      {/* Glass card */}
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
        style={{
          background: "var(--mf-pj-card)",
          border: "1px solid var(--mf-pj-card-border)",
          boxShadow: "var(--mf-pj-shadow)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--mf-pj-divider)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "var(--mf-accent-subtle)",
                border: "1px solid var(--mf-accent-muted)",
              }}
            >
              <Video
                className="h-4 w-4"
                style={{ color: "var(--mf-accent-text)" }}
              />
            </div>
            <div className="min-w-0">
              <p
                className={clsx(
                  typography.semibold16,
                  "truncate leading-tight",
                )}
                style={{ color: "var(--mf-pj-text-primary)" }}
              >
                {meetingTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {role === "host" ? (
                  <Shield
                    className="h-3 w-3 shrink-0"
                    style={{ color: "var(--mf-accent-text)" }}
                  />
                ) : (
                  <Users
                    className="h-3 w-3 shrink-0"
                    style={{ color: "var(--mf-pj-text-muted)" }}
                  />
                )}
                <span
                  className={clsx(typography.regular12)}
                  style={{ color: "var(--mf-pj-text-muted)" }}
                >
                  {role === "host"
                    ? "You are the host"
                    : "Joining as participant"}
                </span>
              </div>
            </div>
          </div>

          {/* Identity chip */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
            style={{
              background: "var(--mf-pj-surface)",
              border: "1px solid var(--mf-pj-surface-border)",
            }}
          >
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
            <span
              className="text-[12px] font-medium max-w-[140px] truncate"
              style={{ color: "var(--mf-pj-text-secondary)" }}
            >
              {displayName}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col lg:flex-row">
          {/* ── LEFT: Camera preview ──────────────────────────────────── */}
          <div
            className="flex-1 p-5 flex flex-col gap-4 lg:border-r"
            style={{ borderColor: "var(--mf-pj-divider)" }}
          >
            {/* Preview box */}
            <div
              className="relative rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "var(--mf-pj-preview-bg)",
                border: "1px solid var(--mf-pj-preview-border)",
                aspectRatio: "16/9",
              }}
            >
              {/* Loading spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    className="h-8 w-8 animate-spin"
                    style={{ color: "var(--mf-accent-text)" }}
                  />
                </div>
              )}

              {/* Permission denied */}
              {permState === "denied" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--mf-danger-muted)" }}
                  >
                    <AlertTriangle
                      className="h-6 w-6"
                      style={{ color: "var(--mf-danger)" }}
                    />
                  </div>
                  <p
                    className={clsx(typography.semibold14)}
                    style={{ color: "var(--mf-pj-text-primary)" }}
                  >
                    Camera access denied
                  </p>
                  <p
                    className={clsx(typography.regular12)}
                    style={{ color: "var(--mf-pj-text-muted)" }}
                  >
                    Allow camera & microphone access in your browser, then
                    reload.
                  </p>
                </div>
              )}

              {/* No devices */}
              {permState === "unavailable" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <VideoOff
                    className="h-10 w-10"
                    style={{ color: "var(--mf-pj-text-muted)" }}
                  />
                  <p
                    className={typography.medium14}
                    style={{ color: "var(--mf-pj-text-muted)" }}
                  >
                    No camera found
                  </p>
                </div>
              )}

              {/* Camera off avatar */}
              {permState === "granted" && !videoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: avatarColor }}
                  >
                    {initials}
                  </div>
                  <p
                    className={typography.medium12}
                    style={{ color: "var(--mf-pj-text-muted)" }}
                  >
                    Camera is off
                  </p>
                </div>
              )}

              {/* Video element */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{
                  transform: "scaleX(-1)",
                  opacity: permState === "granted" && videoEnabled ? 1 : 0,
                }}
              />

              {/* Preview label */}
              {permState === "granted" && (
                <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      color: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    Preview
                  </span>
                </div>
              )}
            </div>

            {/* Toggle buttons */}
            <div className="flex gap-3">
              <ToggleBtn
                on={videoEnabled}
                onClick={toggleVideo}
                disabled={permState !== "granted"}
                onIcon={<Video className="h-4 w-4" />}
                offIcon={<VideoOff className="h-4 w-4" />}
                onLabel="Camera on"
                offLabel="Camera off"
              />
              <ToggleBtn
                on={audioEnabled}
                onClick={toggleAudio}
                disabled={permState !== "granted"}
                onIcon={<Mic className="h-4 w-4" />}
                offIcon={<MicOff className="h-4 w-4" />}
                onLabel="Mic on"
                offLabel="Mic off"
              />
            </div>
          </div>

          {/* ── RIGHT: Settings & CTA ──────────────────────────────────── */}
          <div className="w-full lg:w-72 p-5 flex flex-col gap-5">
            {/* Heading */}
            <div>
              <h2
                className={clsx(typography.semibold24, "leading-tight")}
                style={{ color: "var(--mf-pj-text-primary)" }}
              >
                {role === "host" ? "Start your meeting" : "Ready to join?"}
              </h2>
              <p
                className={clsx(typography.regular14, "mt-1")}
                style={{ color: "var(--mf-pj-text-secondary)" }}
              >
                Check your audio and video before entering.
              </p>
            </div>

            {/* Device selects */}
            {permState === "granted" && (
              <div className="flex flex-col gap-4">
                {cameras.length > 0 && (
                  <DeviceSelect
                    label="Camera"
                    id="cam-select"
                    devices={cameras}
                    value={selectedCamera}
                    onChange={handleCameraSwitch}
                  />
                )}

                {microphones.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <DeviceSelect
                      label="Microphone"
                      id="mic-select"
                      devices={microphones}
                      value={selectedMic}
                      onChange={setSelectedMic}
                    />
                    {/* Mic level visualiser */}
                    <div className="flex items-center gap-2.5 mt-1 px-1">
                      <Mic
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--mf-pj-text-muted)" }}
                      />
                      <MicBars level={micLevel} active={audioEnabled} />
                      <span
                        className="text-[10px] tabular-nums w-8 text-right"
                        style={{ color: "var(--mf-pj-text-muted)" }}
                      >
                        {Math.round(micLevel)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Privacy notice */}
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl mt-auto"
              style={{
                background: "var(--mf-pj-input-bg)",
                border: "1px solid var(--mf-pj-surface-border)",
              }}
            >
              <Shield
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: "var(--mf-accent-text)" }}
              />
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--mf-pj-text-muted)" }}
              >
                Camera and mic are only active during the meeting. Nothing is
                recorded without your knowledge.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() =>
                  onJoin({
                    videoEnabled,
                    audioEnabled,
                    videoDeviceId: selectedCamera,
                    audioDeviceId: selectedMic,
                  })
                }
                className="h-12 rounded-xl text-[14px] font-semibold transition-all duration-150 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mf-accent) 0%, #6c5ff5 100%)",
                  color: "var(--mf-pj-btn-text)",
                  boxShadow:
                    "var(--mf-shadow-accent), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.filter =
                    "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.filter = "";
                }}
              >
                {role === "host" ? "Start Meeting" : "Join Meeting"}
              </button>
              <button
                onClick={onCancel}
                className="h-10 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--mf-pj-text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--mf-pj-input-bg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingPreJoin;
