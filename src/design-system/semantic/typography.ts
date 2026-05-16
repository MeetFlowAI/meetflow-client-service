/* ============================================================
   MeetFlow V2 — Semantic Typography Scale
   Source: ShopPulse typography system (sp-* classes)
           Inter (body) + Plus Jakarta Sans (heading)
           + JetBrains Mono (data/code)

   USAGE:
     import { heading, body, label, kpi, caption } from
       "@/design-system/semantic/typography";

     // In App Components only — features use App Components
     <h2 className={heading.h3}>Section Title</h2>
     <p className={body.md}>Content text</p>
     <span className={kpi.large}>$48,294</span>

   RULES:
     - App Components import these constants
     - Feature modules never import these directly
     - Always use the most semantically appropriate variant
     - Avoid composing typography variants ad-hoc
   ============================================================ */

// ── Heading Scale (Plus Jakarta Sans) ────────────────────────────────────────
// Used for page titles, section headers, widget titles, card headings.
export const heading = {
  /** 36px / 800 / tracking-tight — page hero titles, display contexts  */
  display: "font-heading text-4xl font-extrabold leading-tight tracking-tight",

  /** 30px / 700 / tracking-tight — primary page titles               */
  h1: "font-heading text-3xl font-bold leading-tight tracking-tight",

  /** 24px / 700 / tracking-tight — major section titles              */
  h2: "font-heading text-2xl font-bold leading-snug tracking-tight",

  /** 20px / 600 — widget headers, card titles, subsection headings   */
  h3: "font-heading text-xl font-semibold leading-snug",

  /** 18px / 600 — sidebar section headings, panel titles            */
  h4: "font-heading text-lg font-semibold leading-snug",

  /** 16px / 600 — small section headings                            */
  h5: "font-heading text-base font-semibold leading-snug",

  /** 14px / 600 — minimum heading, dense contexts                   */
  h6: "font-heading text-sm font-semibold leading-snug",
} as const;

// ── Body Scale (Inter) ────────────────────────────────────────────────────────
// Used for content text, descriptions, paragraphs, table cells.
export const body = {
  /** 20px / 400 / relaxed — lead paragraphs, featured descriptions  */
  xl: "font-body text-xl font-normal leading-relaxed",

  /** 16px / 400 / relaxed — large body, landing sections            */
  lg: "font-body text-base font-normal leading-relaxed",

  /** 14px / 400 / relaxed — primary content text (default)          */
  md: "font-body text-sm font-normal leading-relaxed",

  /** 13px / 400 / normal — compact content, table cells             */
  sm: "font-body text-[13px] font-normal leading-normal",

  /** 12px / 400 / normal — metadata, timestamps, secondary info     */
  xs: "font-body text-xs font-normal leading-normal",

  /** 10px / 400 / normal — fine print, legal, footnotes             */
  detail: "font-body text-[10px] font-normal leading-normal",
} as const;

// ── Label Scale (Inter, medium weight) ───────────────────────────────────────
// Used for form labels, input labels, button text, table column headers.
export const label = {
  /** 14px / 500 — form field labels, tab labels                     */
  lg: "font-body text-sm font-medium leading-none",

  /** 12px / 500 — compact labels, badge text                        */
  md: "font-body text-xs font-medium leading-none",

  /** 10px / 600 / uppercase / wide — overline labels, section tags  */
  sm: "font-heading text-[10px] font-semibold leading-none tracking-widest uppercase",
} as const;

// ── Data & KPI Scale (JetBrains Mono) ────────────────────────────────────────
// Used for metrics, statistics, prices, counts — any number displayed as data.
// tabular-nums ensures digits align vertically in columns.
export const kpi = {
  /** 56px / 800 — hero metric, primary dashboard KPI                */
  hero: "font-mono text-5xl font-extrabold leading-none tabular-nums tracking-tight",

  /** 40px / 700 — large metric display                              */
  display: "font-mono text-4xl font-bold leading-none tabular-nums tracking-tight",

  /** 32px / 700 — primary KPI card value                            */
  large: "font-mono text-3xl font-bold leading-none tabular-nums",

  /** 24px / 600 — secondary metric, widget stat                     */
  medium: "font-mono text-2xl font-semibold leading-none tabular-nums",

  /** 20px / 600 — compact metric                                    */
  small: "font-mono text-xl font-semibold leading-none tabular-nums",

  /** 16px / 500 — inline data value                                 */
  inline: "font-mono text-base font-medium leading-none tabular-nums",

  /** 14px / 400 — table number cells, aligned numeric data          */
  table: "font-mono text-sm font-normal leading-none tabular-nums",

  /** 12px / 400 — compact data (badges with numbers, IDs)           */
  sm: "font-mono text-xs font-normal leading-none tabular-nums",

  /** 10px / 400 — fine data, reference numbers, very compact        */
  xs: "font-mono text-[10px] font-normal leading-none tabular-nums",
} as const;

// ── Caption & Auxiliary (Inter) ───────────────────────────────────────────────
// Used for helper text, timestamps, metadata, descriptions under inputs.
export const caption = {
  /** 12px / 400 / muted — standard helper text                      */
  default: "font-body text-xs font-normal text-muted-foreground leading-normal",

  /** 12px / 500 / muted — emphasized helper text                    */
  strong: "font-body text-xs font-medium text-muted-foreground leading-normal",
} as const;

// ── Code (JetBrains Mono) ─────────────────────────────────────────────────────
export const code = {
  /** 14px / 400 — inline code snippets                              */
  inline: "font-mono text-sm font-normal",

  /** 13px / 400 — code blocks                                       */
  block: "font-mono text-[13px] font-normal leading-relaxed",
} as const;

// ── Type Helpers ──────────────────────────────────────────────────────────────
export type HeadingVariant = keyof typeof heading;
export type BodyVariant = keyof typeof body;
export type LabelVariant = keyof typeof label;
export type KpiVariant = keyof typeof kpi;
export type CaptionVariant = keyof typeof caption;
export type CodeVariant = keyof typeof code;
