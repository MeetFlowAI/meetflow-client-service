import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  title?: string;
}

/**
 * NoNotificationsIllustration — Notification center is empty.
 *
 * A bell silhouette without any badge, placed inside a soft circle.
 * The absence of badge intentionally communicates "all clear".
 */
export function NoNotificationsIllustration({
  className,
  title = "No notifications",
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
      {/* Background circle */}
      <circle cx="80" cy="56" r="42" style={{ fill: "var(--muted)" }} opacity="0.5" />
      {/* Bell dome */}
      <path
        d="M80 22
           C 60 22 52 36 52 52
           L52 66 L44 72 L116 72 L108 66 L108 52
           C108 36 100 22 80 22 Z"
        style={{
          fill: "var(--surface-raised)",
          stroke: "var(--border-strong)",
        }}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Bell clapper */}
      <path
        d="M72 72 Q72 82 80 82 Q88 82 88 72"
        style={{ stroke: "var(--border-strong)" }}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem at top of bell */}
      <line
        x1="80"
        y1="14"
        x2="80"
        y2="22"
        stroke="var(--border-strong)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Small horizontal bar at stem top */}
      <line
        x1="75"
        y1="14"
        x2="85"
        y2="14"
        stroke="var(--border-strong)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Ground shadow */}
      <ellipse cx="80" cy="114" rx="36" ry="4" style={{ fill: "var(--border)" }} opacity="0.4" />
    </svg>
  );
}
