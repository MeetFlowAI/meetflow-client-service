interface SvgIconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * MeetingRoomIcon — Video meeting room indicator.
 * A camera body with a lens circle and a triangular viewfinder wing.
 * Used in meeting lists, room status indicators, and navigation.
 */
export function MeetingRoomIcon({ className, ...props }: SvgIconProps) {
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
      {/* Camera body */}
      <rect x="2" y="7" width="14" height="11" rx="2" />
      {/* Lens */}
      <circle cx="9" cy="12.5" r="2.5" />
      {/* Viewfinder wing (video indicator) */}
      <polyline points="16,10 22,8 22,17 16,15" />
    </svg>
  );
}
