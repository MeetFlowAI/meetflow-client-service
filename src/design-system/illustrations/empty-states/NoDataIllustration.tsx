import { cn } from "@/shared/utils/cn";

interface IllustrationProps {
  className?: string;
  /** Optional title for screen readers */
  title?: string;
}

/**
 * NoDataIllustration — Empty table or empty collection state.
 *
 * Depicts an open folder with a subtle document outline inside,
 * suggesting a container that exists but holds nothing.
 *
 * CSS variable fills auto-adapt to light and dark themes.
 * No hardcoded color values.
 */
export function NoDataIllustration({ className, title = "No data" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-40 h-auto", className)}
      role="img"
      aria-label={title}
    >
      {/* Folder back panel */}
      <rect x="20" y="40" width="120" height="72" rx="8" style={{ fill: "var(--muted)" }} />
      {/* Folder tab */}
      <path
        d="M20 48 Q20 40 28 40 L60 40 Q68 40 72 48 L72 52 L20 52 Z"
        style={{ fill: "var(--border)" }}
      />
      {/* Folder front panel (slightly lighter) */}
      <rect
        x="20"
        y="52"
        width="120"
        height="60"
        rx="4"
        style={{ fill: "var(--surface-raised)" }}
      />
      {/* Document outline inside folder */}
      <rect
        x="56"
        y="62"
        width="48"
        height="40"
        rx="4"
        style={{ fill: "var(--border)" }}
        opacity="0.6"
      />
      {/* Document lines */}
      <line
        x1="64"
        y1="74"
        x2="96"
        y2="74"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="64"
        y1="82"
        x2="88"
        y2="82"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="64"
        y1="90"
        x2="80"
        y2="90"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Shadow/ground shadow */}
      <ellipse cx="80" cy="116" rx="44" ry="4" style={{ fill: "var(--border)" }} opacity="0.4" />
    </svg>
  );
}
