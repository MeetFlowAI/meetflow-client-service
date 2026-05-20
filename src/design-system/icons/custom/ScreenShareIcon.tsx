interface SvgIconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
  active?: boolean;
}

/**
 * ScreenShareIcon — Screen sharing control.
 * A monitor outline with an upload arrow indicating content sharing.
 */
export function ScreenShareIcon({ className, active = false, ...props }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Monitor */}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      {/* Stand */}
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      {/* Upload arrow — active state fills the arrow */}
      <polyline points="8,10 12,6 16,10" fill={active ? "currentColor" : "none"} />
      <line x1="12" y1="6" x2="12" y2="14" />
    </svg>
  );
}
