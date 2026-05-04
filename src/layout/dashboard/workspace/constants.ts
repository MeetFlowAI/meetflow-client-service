/**
 * layout/dashboard/workspace/constants.ts
 *
 * Single source of truth for workspace layout dimensions.
 * These values are mirrored as CSS custom properties in index.css:
 *   --workspace-topbar-height
 *   --workspace-nav-rail-width
 *
 * Use these JS constants when you need the values in TSX (e.g. inline offsets).
 * Use the CSS variables in Tailwind arbitrary values or style= props.
 *
 * ⚠️  If you change a value here, update index.css too (search for --workspace-).
 */

export const WORKSPACE_TOPBAR_HEIGHT = 48; // px — matches --workspace-topbar-height
export const WORKSPACE_NAV_RAIL_WIDTH = 68; // px — matches --workspace-nav-rail-width

/** Default listing panel width as a fraction of the remaining viewport */
export const LISTING_PANEL_DEFAULT_SIZE = 25; // percent of the resizable group
export const LISTING_PANEL_MIN_SIZE = 50; // percent
export const LISTING_PANEL_MAX_SIZE = 38; // percent
