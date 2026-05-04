/* Local Imports */
import axiosConfig from "@/lib/axios";

// ----------------------------------------------------------------------

export interface IEnrollmentResult {
  participant_id: string;
  status: string;
  quality_score: number;
  issues: string[];
}

/**
 * Upload audio clips for voice enrollment.
 * Sends multipart/form-data with up to 5 audio Blob files.
 * Backend forwards to AI service for ECAPA-TDNN processing.
 *
 * @param workspaceId - The workspace to enroll in
 * @param audioClips  - Array of recorded audio Blobs (3–5 clips, each 8–15s)
 */
export const enrollVoiceRequest = (
  workspaceId: number | string,
  audioClips: Blob[],
): Promise<IEnrollmentResult> => {
  const form = new FormData();
  audioClips.forEach((clip, i) => {
    form.append("audio_clips", clip, `clip_${i + 1}.webm`);
  });

  return axiosConfig
    .post(`/workspace/${workspaceId}/enroll-voice`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.data);
};
