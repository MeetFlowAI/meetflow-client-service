interface SvgIconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
  /** When true, fills the record dot to indicate active recording */
  active?: boolean;
}

/**
 * RecordingIcon — Recording status indicator.
 * An outer ring with an inner circle. The inner circle is filled
 * when `active` is true (live recording in progress).
 * Used in meeting controls, recording status bars.
 */
export function RecordingIcon({ className, active = false, ...props }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      {...props}
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9" />
      {/* Inner indicator — filled when active */}
      <circle
        cx="12"
        cy="12"
        r="4"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.75}
      />
    </svg>
  );
}
