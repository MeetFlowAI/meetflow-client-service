import { cn } from "@/shared/utils/cn";

/* ============================================================
   MeetFlow V2 — AppIcon

   The single interface for ALL icons used in the product.
   Feature code never imports Lucide or custom SVGs directly —
   it uses App Components that accept an icon prop and render
   AppIcon internally.

   SIZE SCALE (maps to CSS sizing utilities):
     xs  → 12px  dense table cells, badges, inline indicators
     sm  → 14px  compact button icons, secondary actions
     md  → 16px  default — most UI contexts
     lg  → 18px  section headers, prominent actions
     xl  → 20px  empty state icons, feature highlights
     2xl → 24px  large callouts, illustration accents
     3xl → 32px  hero icons, onboarding steps
     4xl → 40px  illustration fills (rare)

   ACCESSIBILITY:
     - Provide `label` for standalone decorative-to-informational icons
     - Omit `label` for icons paired with visible text (aria-hidden applied)
     - Never rely on icon alone to convey critical information
   ============================================================ */

const sizeMap = {
  xs: "size-3", // 12px
  sm: "size-3.5", // 14px
  md: "size-4", // 16px
  lg: "size-[18px]", // 18px
  xl: "size-5", // 20px
  "2xl": "size-6", // 24px
  "3xl": "size-8", // 32px
  "4xl": "size-10", // 40px
} as const;

export type IconSize = keyof typeof sizeMap;

export interface AppIconProps {
  /**
   * The icon component to render.
   * Accepts any Lucide icon, custom product icon, or brand logo.
   * @example icon={Building2} icon={MeetingRoomIcon} icon={GoogleLogo}
   */
  icon: React.ElementType;

  /**
   * Visual size of the icon. Defaults to "md" (16px).
   */
  size?: IconSize;

  /**
   * Accessible label for standalone icons.
   * When provided: sets aria-label and removes aria-hidden.
   * When omitted: sets aria-hidden="true" (icon is decorative).
   */
  label?: string;

  /**
   * Additional Tailwind classes. Useful for color overrides
   * when the icon must be a specific semantic color.
   * @example className="text-primary" className="text-muted-foreground"
   */
  className?: string;
}

export function AppIcon({ icon: Icon, size = "md", label, className }: AppIconProps) {
  return (
    <Icon
      className={cn(
        sizeMap[size],
        "shrink-0", // prevent flex shrinking in tight layouts
        "inline-block", // baseline-align in text contexts
        className
      )}
      aria-label={label}
      aria-hidden={!label}
      role={label ? "img" : undefined}
    />
  );
}
