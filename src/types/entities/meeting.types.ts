import type { UserRef } from "./user.types";

export type MeetingStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface Meeting {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  hostId: string;
  host: UserRef;
  status: MeetingStatus;
  startsAt: string; // ISO 8601
  endsAt: string | null; // null if still live
  scheduledEndAt: string | null;
  recordingUrl: string | null;
  participantCount: number;
  isRecorded: boolean;
  joinToken: string | null; // only present when user is joining
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  user: UserRef;
  joinedAt: string;
  leftAt: string | null;
  role: "host" | "co-host" | "participant" | "viewer";
  isAudioOn: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
}

export interface MeetingRecording {
  id: string;
  meetingId: string;
  url: string;
  durationSec: number;
  sizeBytes: number;
  createdAt: string;
}
