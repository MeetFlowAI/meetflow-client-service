/**
 * utils/participant.ts
 *
 * Shared pure-utility functions for participant display.
 * Replaces 3× duplicated getColor / getInitials across components.
 */

// Deterministic avatar color palette (accessible on dark backgrounds)
export const AVATAR_COLORS: readonly string[] = [
  "#7C3AED", // violet
  "#059669", // emerald
  "#2563EB", // blue
  "#DB2777", // pink
  "#D97706", // amber
  "#0891B2", // cyan
  "#E11D48", // rose
  "#4F46E5", // indigo
  "#047857", // green
  "#B45309", // orange
] as const;

/**
 * Returns a deterministic color for a participant identity string.
 * Same identity always maps to the same color.
 */
export function getParticipantColor(identity: string): string {
  if (!identity) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Returns 1–2 character initials from a display name.
 */
export function getParticipantInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Returns the best display name for a participant, with a safe fallback.
 */
export function getDisplayName(name: string | undefined, identity: string | undefined): string {
  if (name?.trim()) return name.trim();
  if (identity?.trim()) return identity.trim();
  return "Participant";
}
