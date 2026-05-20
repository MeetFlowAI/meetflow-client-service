import { cn } from "@/shared/utils/cn";

interface IllustrationProps {
  className?: string;
  title?: string;
}

/**
 * OfflineIllustration — Network unavailable state.
 *
 * A WiFi signal with a slash through it and a cloud outline above,
 * communicating loss of connectivity clearly.
 */
export function OfflineIllustration({
  className,
  title = "No internet connection",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-40 h-auto", className)}
      role="img"
      aria-label={title}
    >
      {/* Cloud body */}
      <path
        d="M 48 62
           Q 44 62 41 59 Q 32 58 32 49 Q 32 40 41 38
           Q 42 28 52 26 Q 62 22 70 30
           Q 76 22 86 24 Q 98 26 98 40
           Q 106 42 106 52 Q 106 62 96 62 Z"
        style={{
          fill: "var(--muted)",
          stroke: "var(--border-strong)",
        }}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Large diagonal slash */}
      <line
        x1="38"
        y1="82"
        x2="122"
        y2="30"
        stroke="var(--destructive)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* WiFi arc — outer (dimmed) */}
      <path
        d="M 44 88 Q 80 58 116 88"
        stroke="var(--border-strong)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* WiFi arc — middle (dimmed) */}
      <path
        d="M 56 96 Q 80 78 104 96"
        stroke="var(--border-strong)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* WiFi dot */}
      <circle cx="80" cy="107" r="4" style={{ fill: "var(--border-strong)" }} opacity="0.35" />
      {/* Ground shadow */}
      <ellipse cx="80" cy="116" rx="38" ry="3" style={{ fill: "var(--border)" }} opacity="0.4" />
    </svg>
  );
}
