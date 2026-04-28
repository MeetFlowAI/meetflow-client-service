/**
 * hooks/useLiveTranscription.ts
 *
 * Live transcription captions via LiveKit TranscriptionSegment events.
 *
 * DIFFERENTIATOR FEATURE
 *
 * LiveKit fires RoomEvent.TranscriptionReceived with TranscriptionSegment[]:
 *   { id: string; text: string; final: boolean; firstReceivedTime: number;
 *     lastReceivedTime: number; language?: string }
 *
 * We keep a rolling window of the last N finalised segments as caption lines,
 * plus the current in-progress (non-final) segment.
 *
 * Captions are displayed as an overlay at the bottom of the video area.
 */

import { useState, useEffect } from "react";
import {
  RoomEvent,
  type TranscriptionSegment,
  type Participant,
} from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

export interface CaptionLine {
  id: string;
  text: string;
  speakerName: string;
  final: boolean;
  timestamp: number;
}

const MAX_HISTORY = 4; // keep last 4 final lines

export interface UseLiveTranscriptionReturn {
  enabled: boolean;
  toggle: () => void;
  captions: CaptionLine[];
}

export function useLiveTranscription(): UseLiveTranscriptionReturn {
  const room = useRoomContext();
  const [enabled, setEnabled] = useState(false);
  const [captions, setCaptions] = useState<CaptionLine[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant,
    ) => {
      const speakerName =
        participant?.name ?? participant?.identity ?? "Speaker";

      setCaptions((prev) => {
        const next = [...prev];

        for (const seg of segments) {
          const existing = next.findIndex((c) => c.id === seg.id);
          const line: CaptionLine = {
            id: seg.id,
            text: seg.text,
            speakerName,
            final: seg.final,
            timestamp: seg.firstReceivedTime ?? Date.now(),
          };

          if (existing >= 0) {
            next[existing] = line;
          } else {
            next.push(line);
          }
        }

        // Keep only last MAX_HISTORY final lines + any in-progress
        const finals = next.filter((c) => c.final).slice(-MAX_HISTORY);
        const inProgress = next.filter((c) => !c.final);
        return [...finals, ...inProgress];
      });
    };

    room.on(RoomEvent.TranscriptionReceived, onTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, onTranscription);
    };
  }, [room, enabled]);

  const toggle = () =>
    setEnabled((currentEnabled) => {
      if (currentEnabled) {
        setCaptions([]);
      }

      return !currentEnabled;
    });

  return { enabled, toggle, captions };
}
