import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  title?: string;
}

/**
 * NoResultIllustration — Search returned no matches.
 *
 * A magnifying glass with an X mark inside the lens,
 * universally understood as "nothing found".
 */
export function NoResultIllustration({ className, title = "No results found" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-40 h-auto", className)}
      role="img"
      aria-label={title}
    >
      {/* Magnifying glass circle */}
      <circle
        cx="68"
        cy="56"
        r="34"
        style={{
          fill: "var(--muted)",
          stroke: "var(--border-strong)",
        }}
        strokeWidth="5"
      />
      {/* Inner circle (lens) */}
      <circle cx="68" cy="56" r="24" style={{ fill: "var(--surface-raised)" }} />
      {/* X mark inside lens */}
      <line
        x1="58"
        y1="46"
        x2="78"
        y2="66"
        stroke="var(--muted-foreground)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="46"
        x2="58"
        y2="66"
        stroke="var(--muted-foreground)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Handle */}
      <line
        x1="95"
        y1="83"
        x2="116"
        y2="104"
        stroke="var(--border-strong)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Ground shadow */}
      <ellipse cx="80" cy="116" rx="40" ry="4" style={{ fill: "var(--border)" }} opacity="0.4" />
    </svg>
  );
}
