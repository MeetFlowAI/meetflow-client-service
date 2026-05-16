/* ============================================================
   MeetFlow V2 — Breakpoint Constants (JS-accessible)
   Source: ShopPulse screen dimensions (375/768/1440)

   USE IN JS/TS ONLY.
   CSS media queries always use Tailwind utility prefixes (md:, lg:, 2xl:).
   These values exist for use in:
     - useBreakpoint hook (shared/hooks/useBreakpoint.ts)
     - Conditional JS rendering logic
     - Manual window.matchMedia calls
   ============================================================ */

export const breakpoints = {
  /** 375px — Primary mobile canvas from Figma */
  mobile: 375,
  /** 640px — Tailwind sm: breakpoint */
  sm: 640,
  /** 768px — Tablet layout pivot (Tailwind md:) */
  tablet: 768,
  /** 768px — Alias for tablet */
  md: 768,
  /** 1024px — Intermediate desktop (Tailwind lg:) */
  lg: 1024,
  /** 1280px — Standard desktop (Tailwind xl:) */
  xl: 1280,
  /** 1440px — Primary desktop design canvas (Tailwind 2xl:) */
  desktop: 1440,
  /** 1440px — Alias for desktop */
  "2xl": 1440,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Returns a CSS media query string for a minimum-width breakpoint.
 * @example mediaQuery("tablet") → "@media (min-width: 768px)"
 */
export function mediaQuery(bp: Breakpoint): string {
  return `@media (min-width: ${breakpoints[bp]}px)`;
}

/**
 * Returns a window.matchMedia query string for a breakpoint.
 * @example matchMediaQuery("desktop") → "(min-width: 1440px)"
 */
export function matchMediaQuery(bp: Breakpoint): string {
  return `(min-width: ${breakpoints[bp]}px)`;
}
