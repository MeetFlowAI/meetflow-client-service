import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  title?: string;
}

/**
 * WelcomeIllustration — Auth page decorative background.
 *
 * An abstract geometric composition suggesting connection and
 * collaboration: overlapping circles and connecting lines that
 * imply a network of participants.
 *
 * Designed to be large (200–300px wide) and used as a background
 * or side panel decoration on sign-in / sign-up pages.
 * Uses CSS variable fills for complete dark/light theme support.
 *
 * USAGE CONTEXT:
 *   Glass panel overlays — use with glass-panel utility class
 *   Auth page right-side panel decoration
 *   Onboarding step illustrations
 *
 * NOT FOR: dense dashboard UI, tables, lists, or repeated layouts.
 */
export function WelcomeIllustration({
  className,
  title = "Welcome to MeetFlow",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-xs", className)}
      role="img"
      aria-label={title}
    >
      {/* ── Background gradient circle (large, ambient) ───────────────── */}
      <circle cx="160" cy="140" r="130" style={{ fill: "var(--primary-subtle)" }} opacity="0.4" />

      {/* ── Primary node: central participant ─────────────────────────── */}
      <circle cx="160" cy="120" r="40" style={{ fill: "var(--primary-subtle)" }} />
      <circle cx="160" cy="120" r="28" style={{ fill: "var(--primary)" }} opacity="0.15" />
      {/* Avatar silhouette — head */}
      <circle cx="160" cy="110" r="14" style={{ fill: "var(--primary)" }} opacity="0.6" />
      {/* Avatar silhouette — body arc */}
      <path
        d="M 136 138 Q 136 124 160 124 Q 184 124 184 138"
        style={{ fill: "var(--primary)" }}
        opacity="0.6"
      />

      {/* ── Secondary node: top-left participant ──────────────────────── */}
      <line
        x1="125"
        y1="105"
        x2="90"
        y2="82"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <circle cx="78" cy="74" r="26" style={{ fill: "var(--muted)" }} />
      <circle cx="78" cy="66" r="10" style={{ fill: "var(--border-strong)" }} opacity="0.5" />
      <path
        d="M 60 84 Q 60 74 78 74 Q 96 74 96 84"
        style={{ fill: "var(--border-strong)" }}
        opacity="0.5"
      />

      {/* ── Secondary node: top-right participant ────────────────────── */}
      <line
        x1="195"
        y1="105"
        x2="228"
        y2="82"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <circle cx="240" cy="74" r="26" style={{ fill: "var(--muted)" }} />
      <circle cx="240" cy="66" r="10" style={{ fill: "var(--border-strong)" }} opacity="0.5" />
      <path
        d="M 222 84 Q 222 74 240 74 Q 258 74 258 84"
        style={{ fill: "var(--border-strong)" }}
        opacity="0.5"
      />

      {/* ── Tertiary node: bottom participant ─────────────────────────── */}
      <line
        x1="160"
        y1="160"
        x2="160"
        y2="192"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <circle cx="160" cy="210" r="22" style={{ fill: "var(--muted)" }} />
      <circle cx="160" cy="202" r="8" style={{ fill: "var(--border-strong)" }} opacity="0.5" />
      <path
        d="M 146 220 Q 146 212 160 212 Q 174 212 174 220"
        style={{ fill: "var(--border-strong)" }}
        opacity="0.5"
      />

      {/* ── Decorative floating dots (depth / ambient) ────────────────── */}
      <circle cx="56" cy="160" r="5" style={{ fill: "var(--primary)" }} opacity="0.25" />
      <circle cx="48" cy="148" r="3" style={{ fill: "var(--primary)" }} opacity="0.15" />
      <circle cx="264" cy="160" r="5" style={{ fill: "var(--primary)" }} opacity="0.25" />
      <circle cx="272" cy="148" r="3" style={{ fill: "var(--primary)" }} opacity="0.15" />
      <circle cx="100" cy="222" r="4" style={{ fill: "var(--primary)" }} opacity="0.20" />
      <circle cx="220" cy="222" r="4" style={{ fill: "var(--primary)" }} opacity="0.20" />

      {/* ── MeetFlow brand mark (M shape, abstract) ────────────────────── */}
      <path
        d="M 148 254 L 148 266 L 156 258 L 164 266 L 164 254"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M 166 254 L 172 266"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
