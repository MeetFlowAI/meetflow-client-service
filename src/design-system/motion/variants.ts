import type { Variants } from "framer-motion";

/* ============================================================
   MeetFlow V2 — Motion Variant Presets

   Framer Motion Variants used throughout App Components.
   These are imported by App Components only — feature code
   never imports from design-system/motion directly.

   NAMING CONVENTION:
     {motion}{Direction}Variants
     fadeVariants, slideUpVariants, slideRightVariants, etc.

   USAGE IN APP COMPONENTS:
     <motion.div
       variants={fadeVariants}
       initial="hidden"
       animate="visible"
       exit="exit"
     />

   DURATION REFERENCE (maps to animation.css tokens):
     instant:  50ms   → micro-interactions (toggles, checkboxes)
     fast:    100ms   → icon swaps, badge updates
     normal:  150ms   → default state transitions
     moderate: 200ms  → content appearance (dropdowns, tooltips)
     slow:    300ms   → page sections, panels
     slower:  400ms   → modals, sheets
     slowest: 500ms   → page-level transitions

   EASING REFERENCE:
     ease-out:   [0, 0, 0.2, 1]       → elements entering (natural deceleration)
     ease-in:    [0.4, 0, 1, 1]       → elements exiting  (natural acceleration)
     ease-in-out:[0.4, 0, 0.2, 1]    → elements moving (position changes)
     spring:     [0.175, 0.885, 0.32, 1.275] → playful entrance, scale effects
   ============================================================ */

// ── Shared easing constants ───────────────────────────────────────────────────
// Mirror the CSS easing tokens from animation.css for use in JS

export const easing = {
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
} as const;

// ── Fade ─────────────────────────────────────────────────────────────────────
// Simple opacity transition. Use for content that appears/disappears in-place
// with no positional movement — tooltips, badge counters, status labels.

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easing.easeOut } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: easing.easeIn } },
};

// ── Slide up ──────────────────────────────────────────────────────────────────
// Fades in while rising from slightly below. Use for:
//   Dropdown menus, context menus, bottom sheet previews,
//   toast notifications, popover content.

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: easing.easeOut } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15, ease: easing.easeIn } },
};

// ── Slide down ────────────────────────────────────────────────────────────────
// Fades in while descending. Use for:
//   Dropdown menus that open downward, select option lists.

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: easing.easeOut } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: easing.easeIn } },
};

// ── Slide from right ──────────────────────────────────────────────────────────
// Full-width slide from right edge. Use for:
//   AppSheet (detail panels), right-side drawers, notification panels.

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.25, ease: easing.easeIn },
  },
};

// ── Slide from left ───────────────────────────────────────────────────────────
// Full-width slide from left edge. Use for:
//   Left-side navigation drawers (mobile), back-navigation panels.

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: { duration: 0.25, ease: easing.easeIn },
  },
};

// ── Slide from bottom ─────────────────────────────────────────────────────────
// Full-height slide from bottom. Use for:
//   Mobile bottom sheets, mobile menu overlays.

export const slideBottomVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.25, ease: easing.easeIn },
  },
};

// ── Scale ─────────────────────────────────────────────────────────────────────
// Scales in from slightly smaller while fading. Use for:
//   AppModal, AppConfirmDialog, alert banners, popover cards.

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: easing.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: easing.easeIn },
  },
};

// ── Scale from center (playful) ───────────────────────────────────────────────
// More pronounced scale with spring. Use for:
//   Success confirmations, achievement badges, onboarding steps.

export const scaleBounceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easing.bounce },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15, ease: easing.easeIn },
  },
};

// ── Page transition ───────────────────────────────────────────────────────────
// Subtle fade-up used at the route/page level. Keeps navigation
// feeling fast while providing perceptible visual continuity.

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: { duration: 0.15, ease: easing.easeIn },
  },
};

// ── Stagger container ─────────────────────────────────────────────────────────
// Parent container that staggers its children's animations.
// Use with listItemVariants on child elements.
//
// @example
// <motion.ul variants={listContainerVariants} initial="hidden" animate="visible">
//   {items.map((item) => (
//     <motion.li key={item.id} variants={listItemVariants}>...</motion.li>
//   ))}
// </motion.ul>

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // When this variant animates, stagger child animations 40ms apart
      staggerChildren: 0.04,
      // Slight delay before the first child starts
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
};

// ── Stagger list item ─────────────────────────────────────────────────────────
// Children used inside listContainerVariants.
// Each item slides up and fades in, staggered from the container.

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: 3,
    transition: { duration: 0.1, ease: easing.easeIn },
  },
};

// ── Accordion ────────────────────────────────────────────────────────────────
// Height expansion for accordion/collapsible content.
// Note: Radix handles accordion animation via CSS in Shadcn's implementation.
// This variant is for custom accordion implementations.

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.25, ease: easing.easeOut },
  },
};

// ── Overlay backdrop ──────────────────────────────────────────────────────────
// Semi-transparent scrim behind modals and drawers.
// Separate from the content so they can animate independently.

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easing.easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easing.easeIn } },
};

// ── Notification / toast entrance ────────────────────────────────────────────
// Enters from the top-right, exits to the top-right.
// Sonner handles its own animations, but this is available for
// custom notification systems.

export const notificationVariants: Variants = {
  hidden: { opacity: 0, x: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.25, ease: easing.spring },
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.96,
    transition: { duration: 0.2, ease: easing.easeIn },
  },
};
