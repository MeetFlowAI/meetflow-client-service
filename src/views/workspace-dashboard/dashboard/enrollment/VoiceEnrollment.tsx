/**
 * VoiceEnrollment.tsx
 *
 * Voice enrollment wizard for speaker recognition.
 * Route: /workspace/enroll-voice
 *
 * Flow:
 *  Step 0 — Intro: explain what voice enrollment is and why it matters
 *  Step 1-3 — Record 3 audio clips (each 8-15 seconds) via MediaRecorder API
 *  Step 4 — Upload: POST clips to backend → AI service processes ECAPA-TDNN embeddings
 *  Step 5 — Done: show quality score and next steps
 */

import { useState, useRef, useCallback, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Mic,
  Square,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Bot,
  Volume2,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { typography } from "@/theme/typography";
import { enrollVoiceRequest } from "@/services/workspace-dashboard/enrollment";

// ----------------------------------------------------------------------

const CLIPS_REQUIRED = 3;
const MIN_RECORDING_SECONDS = 6;

const RECORDING_PROMPTS = [
  "Introduce yourself and describe what you're working on today.",
  "Talk about a recent project decision or update from your team.",
  "Describe your plans for the rest of this week.",
];

// ----------------------------------------------------------------------

type RecordingState = "idle" | "recording" | "recorded";

interface Clip {
  blob: Blob;
  durationSeconds: number;
}

// ----------------------------------------------------------------------

export default function VoiceEnrollment(): JSX.Element {
  const { selectedWorkspaceId } = useWorkspace();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(0); // 0=intro, 1-3=record, 4=uploading, 5=done
  const [clips, setClips] = useState<(Clip | null)[]>([null, null, null]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Cleanup: release microphone on unmount ────────────────────────────────
  // Prevents mic staying open when user navigates away mid-recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stream
            ?.getTracks()
            .forEach((t) => t.stop());
          if (mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
        } catch {
          // already stopped — safe to ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Recording logic ──────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(200); // collect every 200ms
      startTimeRef.current = Date.now();
      setRecordingState("recording");
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }, 500);
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access and try again.",
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    const duration = (Date.now() - startTimeRef.current) / 1000;

    if (duration < MIN_RECORDING_SECONDS) {
      setError(
        `Please record for at least ${MIN_RECORDING_SECONDS} seconds for best accuracy.`,
      );
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setRecordingState("idle");
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const clipIndex = step - 1; // step 1 → index 0
      setClips((prev) => {
        const updated = [...prev];
        updated[clipIndex] = { blob, durationSeconds: Math.round(duration) };
        return updated;
      });
      setRecordingState("recorded");
    };

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }, [step]);

  // ── Upload mutation ───────────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: () => {
      const audioBlobs = clips
        .filter((c): c is Clip => c !== null)
        .map((c) => c.blob);
      return enrollVoiceRequest(selectedWorkspaceId!, audioBlobs);
    },
    onSuccess: (result) => {
      setQualityScore(result.quality_score);
      setStep(5);
    },
    onError: (err: Error) => {
      setError(err.message || "Enrollment failed. Please try again.");
      setStep(3); // go back to last recording step
    },
  });

  const handleUpload = () => {
    const readyClips = clips.filter(Boolean);
    if (readyClips.length < CLIPS_REQUIRED) {
      setError(`Please record all ${CLIPS_REQUIRED} audio clips.`);
      return;
    }
    setStep(4);
    uploadMutation.mutate();
  };

  const handleNextStep = () => {
    setRecordingState("idle");
    setRecordingSeconds(0);
    setError(null);
    if (step < CLIPS_REQUIRED) {
      setStep(step + 1);
    } else {
      handleUpload();
    }
  };

  const handleReRecord = () => {
    setRecordingState("idle");
    setRecordingSeconds(0);
    setError(null);
    const clipIndex = step - 1;
    setClips((prev) => {
      const updated = [...prev];
      updated[clipIndex] = null;
      return updated;
    });
  };

  // ── Step 0: Intro ─────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <WorkspaceDashboardPage title="Voice Enrollment">
        <div className="max-w-lg mx-auto flex flex-col gap-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-secondary-400 hover:text-secondary-600 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className={typography.regular14}>Back</span>
          </button>

          <div
            className={clsx(
              "rounded-2xl border border-secondary-200 dark:border-secondary-700",
              "bg-white dark:bg-secondary-800 p-8 flex flex-col items-center text-center gap-5",
            )}
          >
            <div className="h-16 w-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary-500" />
            </div>

            <div>
              <h1
                className={clsx(
                  typography.semibold18,
                  "text-secondary-900 dark:text-secondary-50 mb-2",
                )}
              >
                Set Up Voice Recognition
              </h1>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-500 dark:text-secondary-400 leading-relaxed",
                )}
              >
                MeetFlow AI identifies who said what in your meetings. By
                enrolling your voice, you'll be automatically recognized in
                every meeting in this workspace.
              </p>
            </div>

            <div className="w-full text-left flex flex-col gap-3 pt-2">
              {[
                "Record 3 short audio clips (about 10 seconds each)",
                "Speak naturally — just talk about anything",
                "Works for all future meetings in this workspace",
                "Your voice data is stored securely and privately",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span
                    className={clsx(
                      typography.regular14,
                      "text-secondary-600 dark:text-secondary-400",
                    )}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={() => setStep(1)} className="w-full gap-2 mt-2">
              <Mic className="h-4 w-4" />
              Start Voice Enrollment
            </Button>
          </div>
        </div>
      </WorkspaceDashboardPage>
    );
  }

  // ── Step 5: Done ──────────────────────────────────────────────────────────────
  if (step === 5) {
    const score = qualityScore ?? 0;
    const scoreColor =
      score >= 0.8
        ? "text-green-500"
        : score >= 0.6
          ? "text-amber-500"
          : "text-red-500";
    const scoreLabel =
      score >= 0.8
        ? "Excellent"
        : score >= 0.6
          ? "Good"
          : "Low — consider re-enrolling with clearer audio";

    return (
      <WorkspaceDashboardPage title="Voice Enrollment Complete">
        <div className="max-w-lg mx-auto flex flex-col gap-6 py-8">
          <div
            className={clsx(
              "rounded-2xl border border-green-200 dark:border-green-800/50",
              "bg-white dark:bg-secondary-800 p-8 flex flex-col items-center text-center gap-5",
            )}
          >
            <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>

            <div>
              <h1
                className={clsx(
                  typography.semibold18,
                  "text-secondary-900 dark:text-secondary-50 mb-2",
                )}
              >
                Voice Enrolled Successfully!
              </h1>
              <p
                className={clsx(
                  typography.regular14,
                  "text-secondary-500 dark:text-secondary-400",
                )}
              >
                You'll now be recognized in all meetings within this workspace.
              </p>
            </div>

            {qualityScore !== null && (
              <div
                className={clsx(
                  "w-full rounded-xl border border-secondary-100 dark:border-secondary-700",
                  "bg-secondary-50 dark:bg-secondary-700/40 p-4",
                )}
              >
                <p
                  className={clsx(
                    typography.semibold12,
                    "text-secondary-400 uppercase tracking-wider mb-1",
                  )}
                >
                  Enrollment Quality
                </p>
                <p className={clsx("text-2xl font-bold", scoreColor)}>
                  {Math.round(score * 100)}%
                </p>
                <p
                  className={clsx(
                    typography.regular12,
                    "text-secondary-400 mt-0.5",
                  )}
                >
                  {scoreLabel}
                </p>
              </div>
            )}

            <Button onClick={() => navigate(-1)} className="w-full">
              Back to Workspace
            </Button>
          </div>
        </div>
      </WorkspaceDashboardPage>
    );
  }

  // ── Step 4: Uploading ─────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <WorkspaceDashboardPage title="Voice Enrollment">
        <div className="max-w-lg mx-auto flex flex-col gap-6 py-8">
          <div
            className={clsx(
              "rounded-2xl border border-secondary-200 dark:border-secondary-700",
              "bg-white dark:bg-secondary-800 p-10 flex flex-col items-center text-center gap-5",
            )}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary-400" />
            <div>
              <p
                className={clsx(
                  typography.semibold16,
                  "text-secondary-800 dark:text-secondary-200 mb-1",
                )}
              >
                Processing your voice...
              </p>
              <p className={clsx(typography.regular14, "text-secondary-400")}>
                Generating voice embeddings using AI. This takes a few seconds.
              </p>
            </div>
          </div>
        </div>
      </WorkspaceDashboardPage>
    );
  }

  // ── Steps 1-3: Recording ──────────────────────────────────────────────────────
  const clipIndex = step - 1;
  const currentClip = clips[clipIndex];
  const isLastClip = step === CLIPS_REQUIRED;

  return (
    <WorkspaceDashboardPage title="Voice Enrollment">
      <div className="max-w-lg mx-auto flex flex-col gap-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {Array.from({ length: CLIPS_REQUIRED }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < step
                  ? clips[i]
                    ? "bg-green-400"
                    : "bg-primary-400"
                  : "bg-secondary-200 dark:bg-secondary-700",
              )}
            />
          ))}
        </div>

        <div
          className={clsx(
            "rounded-2xl border border-secondary-200 dark:border-secondary-700",
            "bg-white dark:bg-secondary-800 p-6 flex flex-col gap-5",
          )}
        >
          {/* Step header */}
          <div>
            <p
              className={clsx(
                typography.semibold12,
                "text-secondary-400 uppercase tracking-wider mb-1",
              )}
            >
              Clip {step} of {CLIPS_REQUIRED}
            </p>
            <h2
              className={clsx(
                typography.semibold16,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              Record Audio Clip {step}
            </h2>
          </div>

          {/* Prompt */}
          <div
            className={clsx(
              "rounded-xl border border-secondary-100 dark:border-secondary-700",
              "bg-secondary-50 dark:bg-secondary-700/40 p-4",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Volume2 className="h-3.5 w-3.5 text-secondary-400" />
              <p
                className={clsx(
                  typography.semibold12,
                  "text-secondary-400 uppercase tracking-wider",
                )}
              >
                What to say
              </p>
            </div>
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-600 dark:text-secondary-400 italic",
              )}
            >
              "{RECORDING_PROMPTS[clipIndex]}"
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p
                className={clsx(
                  typography.regular12,
                  "text-red-500 dark:text-red-400",
                )}
              >
                {error}
              </p>
            </div>
          )}

          {/* Recording UI */}
          <div className="flex flex-col items-center gap-4 py-4">
            {recordingState === "idle" && !currentClip && (
              <>
                <div className="h-20 w-20 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                  <Mic className="h-8 w-8 text-secondary-400" />
                </div>
                <Button onClick={startRecording} className="gap-2">
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              </>
            )}

            {recordingState === "recording" && (
              <>
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-red-500" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse border-2 border-white dark:border-secondary-800" />
                </div>
                <p
                  className={clsx(
                    typography.semibold16,
                    "text-red-500 tabular-nums",
                  )}
                >
                  {recordingSeconds}s
                </p>
                <p className={clsx(typography.regular12, "text-secondary-400")}>
                  Speak for at least {MIN_RECORDING_SECONDS} seconds
                </p>
                <Button
                  variant="outline"
                  onClick={stopRecording}
                  className="gap-2 border-red-300 text-red-500 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                >
                  <Square className="h-4 w-4 fill-red-500" />
                  Stop Recording
                </Button>
              </>
            )}

            {recordingState === "recorded" && currentClip && (
              <>
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p
                  className={clsx(
                    typography.semibold14,
                    "text-green-600 dark:text-green-400",
                  )}
                >
                  Clip recorded ({currentClip.durationSeconds}s)
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleReRecord}>
                    Re-record
                  </Button>
                  <Button size="sm" onClick={handleNextStep} className="gap-2">
                    {isLastClip ? "Finish & Upload" : "Next Clip"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Clips progress indicators */}
          <div className="flex gap-2 justify-center">
            {Array.from({ length: CLIPS_REQUIRED }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "h-2 w-2 rounded-full transition-colors",
                  clips[i]
                    ? "bg-green-400"
                    : i === clipIndex
                      ? "bg-primary-400"
                      : "bg-secondary-200 dark:bg-secondary-700",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </WorkspaceDashboardPage>
  );
}
