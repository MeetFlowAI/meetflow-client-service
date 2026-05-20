interface SvgIconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * WorkspaceIcon — Represents a workspace or team space.
 * A 2×2 grid of rounded squares suggesting a collaborative environment.
 */
export function WorkspaceIcon({ className, ...props }: SvgIconProps) {
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
      {/* Top-left */}
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      {/* Top-right */}
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      {/* Bottom-left */}
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      {/* Bottom-right */}
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
