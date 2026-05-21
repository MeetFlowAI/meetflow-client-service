// Layer 0 (design-system) imports from lib/ — correct dependency direction.
// lib/ has no internal project imports; it is the lowest layer above npm.
import { cn } from "@/lib/utils";

/* ============================================================
   MeetFlow V2 — AppIcon

   The single rendering interface for all icons in the product.
   Feature code never imports Lucide or custom SVGs directly —
   it uses App Components that accept an icon prop and render
   AppIcon internally.

   PREFERRED USAGE PATTERN:
     1. Semantic icons (common, frequent): import from @/design-system/icons
          import { Icons } from "@/design-system/icons";
          <AppButton leftIcon={Icons.add}>Create</AppButton>

     2. Product-specific icons: import from @/design-system/icons
          import { MeetingRoomIcon } from "@/design-system/icons";
          <AppIcon icon={MeetingRoomIcon} size="xl" />

     3. Contextual one-offs (rare): direct Lucide import is acceptable
          import { Zap } from "lucide-react";
          <AppButton leftIcon={Zap}>Upgrade</AppButton>

   SIZE SCALE:
     xs  → 12px  dense table cells, inline status dots
     sm  → 14px  compact button icons, secondary actions
     md  → 16px  default — most UI contexts
     lg  → 18px  section headers, prominent actions
     xl  → 20px  empty state icons, feature highlights
     2xl → 24px  large callouts, illustration accents
     3xl → 32px  hero icons, onboarding steps
     4xl → 40px  illustration fills (rare)

   ACCESSIBILITY:
     - Provide `label` for icons with no adjacent text
     - Omit `label` when adjacent text conveys the meaning
   ============================================================ */

const sizeMap = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-[18px]",
  xl: "size-5",
  "2xl": "size-6",
  "3xl": "size-8",
  "4xl": "size-10",
} as const;

export type IconSize = keyof typeof sizeMap;

export interface AppIconProps {
  /** Icon component: Lucide icon, custom product icon, or brand logo */
  icon: React.ElementType;
  /** Visual size. Defaults to "md" (16px) */
  size?: IconSize;
  /** Accessible label. When provided, renders as img role. When omitted, aria-hidden. */
  label?: string;
  /** Additional Tailwind classes for color or margin overrides */
  className?: string;
}

export function AppIcon({ icon: Icon, size = "md", label, className }: AppIconProps) {
  return (
    <Icon
      className={cn(sizeMap[size], "shrink-0 inline-block", className)}
      aria-label={label}
      aria-hidden={!label}
      role={label ? "img" : undefined}
    />
  );
}
