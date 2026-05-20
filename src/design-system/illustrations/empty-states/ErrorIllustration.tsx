import { cn } from "@/shared/utils/cn";

interface IllustrationProps {
  className?: string;
  title?: string;
}

/**
 * ErrorIllustration — General error or unexpected failure state.
 *
 * A warning triangle with an exclamation mark.
 * Uses --destructive-subtle as background to signal an error
 * while remaining non-alarming.
 */
export function ErrorIllustration({
  className,
  title = "Something went wrong",
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
      {/* Outer circle background */}
      <circle cx="80" cy="58" r="40" style={{ fill: "var(--destructive-subtle)" }} />
      {/* Triangle */}
      <path
        d="M80 30 L108 78 L52 78 Z"
        style={{
          fill: "var(--muted)",
          stroke: "var(--destructive)",
        }}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Exclamation shaft */}
      <line
        x1="80"
        y1="48"
        x2="80"
        y2="64"
        stroke="var(--destructive)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Exclamation dot */}
      <circle cx="80" cy="71" r="2.5" style={{ fill: "var(--destructive)" }} />
      {/* Ground shadow */}
      <ellipse cx="80" cy="114" rx="38" ry="4" style={{ fill: "var(--border)" }} opacity="0.4" />
    </svg>
  );
}
