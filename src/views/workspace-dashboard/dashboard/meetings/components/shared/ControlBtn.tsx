/**
 * components/shared/ControlBtn.tsx  (v2 — theme-aware, premium design)
 *
 * Uses --mf-* CSS tokens from meeting.css.
 * Two sizes: default (44px) and sm (36px).
 * States: default · active · muted (red) · danger · disabled.
 * Badge: number or dot variant.
 */

import React, { type JSX } from "react";
import clsx from "clsx";

export interface ControlBtnProps {
  onClick?: () => void;
  active?: boolean;
  /** Red destructive variant (Leave / End) */
  danger?: boolean;
  /** Red icon without full red background (mic off, camera off) */
  muted?: boolean;
  disabled?: boolean;
  label: string;
  badge?: number;
  badgeDot?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm";
}

const ControlBtn: React.FC<ControlBtnProps> = ({
  onClick,
  active,
  danger,
  muted,
  disabled,
  label,
  badge,
  badgeDot,
  children,
  className,
  size = "default",
}): JSX.Element => {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <div className="relative flex flex-col items-center gap-1 group">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        title={label}
        style={{
          background: danger
            ? "var(--mf-danger-strong)"
            : muted
              ? "var(--mf-danger-muted)"
              : active
                ? "var(--mf-ctrl-btn-active)"
                : "var(--mf-ctrl-btn)",
          transition: "background var(--mf-transition), box-shadow var(--mf-transition), transform var(--mf-transition)",
          borderRadius: "var(--mf-radius-md)",
          color: danger
            ? "#fff"
            : muted
              ? "var(--mf-danger)"
              : active
                ? "var(--mf-text-primary)"
                : "var(--mf-text-secondary)",
          boxShadow: active && !danger && !muted
            ? "inset 0 0 0 1px var(--mf-border-medium)"
            : "none",
        }}
        className={clsx(
          "relative flex items-center justify-center",
          "outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--mf-accent)] focus-visible:ring-offset-1",
          "focus-visible:ring-offset-[var(--mf-bg-base)]",
          !disabled && !danger && "hover:!bg-[var(--mf-ctrl-btn-hover)] hover:!text-[var(--mf-text-primary)]",
          !disabled && danger && "hover:brightness-110",
          !disabled && "active:scale-95",
          disabled && "opacity-30 cursor-not-allowed pointer-events-none",
          dim,
          className,
        )}
      >
        {children}

        {/* Number badge */}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold leading-none"
            style={{
              minWidth: "16px",
              height: "16px",
              padding: "0 3px",
              fontSize: "9px",
              background: "var(--mf-accent)",
              border: "1.5px solid var(--mf-bg-base)",
            }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}

        {/* Dot badge */}
        {badgeDot && (badge === undefined || badge === 0) && (
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
            style={{
              background: "var(--mf-danger)",
              border: "1.5px solid var(--mf-bg-base)",
            }}
          />
        )}
      </button>

      {/* Label */}
      <span
        className="text-[9px] font-medium leading-none whitespace-nowrap transition-colors"
        style={{ color: "var(--mf-text-muted)" }}
      >
        {label.split(" (")[0]}
      </span>
    </div>
  );
};

export default ControlBtn;
