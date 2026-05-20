/* ============================================================
   MeetFlow V2 — Motion Transition Presets

   Reusable transition configuration objects.
   These are passed to Framer Motion's `transition` prop or
   used inside variant definitions.

   DIFFERENCE FROM VARIANTS:
     variants.ts  → define WHAT changes (opacity, scale, position)
     transitions.ts → define HOW it changes (duration, easing, spring)

   USAGE:
     // Inline transition override
     <motion.div animate={{ x: 0 }} transition={transitions.smooth} />

     // Inside a variant definition
     visible: { opacity: 1, transition: transitions.snappy }

     // Orchestration (delay children)
     visible: { transition: { ...transitions.stagger, delayChildren: 0.1 } }
   ============================================================ */

import type { Transition } from "framer-motion";
import { easing } from "./variants";

// ── Tween transitions (duration-based) ───────────────────────────────────────

/** 150ms ease-out — default for most UI state changes */
export const normal: Transition = {
  type: "tween",
  duration: 0.15,
  ease: easing.easeOut,
};

/** 200ms ease-out — content appearance, dropdowns, tooltips */
export const moderate: Transition = {
  type: "tween",
  duration: 0.2,
  ease: easing.easeOut,
};

/** 300ms ease-out — panels, sections, larger elements */
export const slow: Transition = {
  type: "tween",
  duration: 0.3,
  ease: easing.easeOut,
};

/** 100ms ease-in — exits and dismissals */
export const quick: Transition = {
  type: "tween",
  duration: 0.1,
  ease: easing.easeIn,
};

/** 50ms linear — instant micro-interactions (checkboxes, radio) */
export const instant: Transition = {
  type: "tween",
  duration: 0.05,
  ease: "linear",
};

/** Smooth ease-in-out for positional changes */
export const smooth: Transition = {
  type: "tween",
  duration: 0.25,
  ease: easing.easeInOut,
};

// ── Spring transitions (physics-based) ───────────────────────────────────────

/**
 * Snappy spring — tight, responsive, no overshoot.
 * Use for: interactive element feedback, toggle states,
 * drag handles snapping to position.
 */
export const snappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

/**
 * Gentle spring — soft, natural settling with minimal overshoot.
 * Use for: cards sliding into position, panel reveals,
 * content that should feel physical but not bouncy.
 */
export const gentle: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

/**
 * Bouncy spring — playful overshoot.
 * Use sparingly: success confirmations, achievement unlocks,
 * onboarding celebrations. NOT for data-dense UI.
 */
export const bouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
  mass: 0.8,
};

/**
 * Stiff spring — almost instant with very slight springiness.
 * Use for: micro-interactions where spring physics are desired
 * but movement should be imperceptible.
 */
export const stiff: Transition = {
  type: "spring",
  stiffness: 800,
  damping: 40,
  mass: 0.5,
};

// ── Orchestration helpers ─────────────────────────────────────────────────────

/**
 * Stagger config for list containers.
 * Apply to the PARENT container; children use listItemVariants.
 */
export const stagger: Transition = {
  staggerChildren: 0.04,
  delayChildren: 0.05,
};

/**
 * Faster stagger for dense lists (tables, compact menus).
 */
export const staggerFast: Transition = {
  staggerChildren: 0.025,
  delayChildren: 0.03,
};

/**
 * Slow stagger for feature showcases, onboarding steps.
 */
export const staggerSlow: Transition = {
  staggerChildren: 0.1,
  delayChildren: 0.1,
};

// ── Composed presets ──────────────────────────────────────────────────────────
// Pre-built transition + variant pairs for the most common patterns.
// Import these directly into App Components for zero-configuration use.

/** Standard modal/dialog entrance */
export const modalTransition: Transition = {
  type: "tween",
  duration: 0.2,
  ease: easing.spring,
};

/** Sheet / right-panel slide transition */
export const sheetTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: easing.easeOut,
};

/** Page-level route transition */
export const pageTransition: Transition = {
  type: "tween",
  duration: 0.25,
  ease: easing.easeOut,
};

/** Dropdown / popover entrance */
export const popoverTransition: Transition = {
  type: "tween",
  duration: 0.15,
  ease: easing.easeOut,
};

/** Toast / notification slide-in */
export const toastTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};
