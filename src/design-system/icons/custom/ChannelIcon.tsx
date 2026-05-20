interface SvgIconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * ChannelIcon — Communication channel indicator.
 * A hash/pound symbol (#) — the universal convention for channels
 * (Slack, Discord, Teams). Used in channel lists and navigation.
 */
export function ChannelIcon({ className, ...props }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      {...props}
    >
      {/* Vertical bars */}
      <line x1="9" y1="3" x2="7" y2="21" />
      <line x1="17" y1="3" x2="15" y2="21" />
      {/* Horizontal bars */}
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}
