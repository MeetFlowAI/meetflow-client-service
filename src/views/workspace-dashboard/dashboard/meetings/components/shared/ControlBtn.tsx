/**
 * components/shared/ControlBtn.tsx
 *
 * Reusable control bar button used in MeetingControls.
 * Supports active, danger, disabled states and a numeric badge.
 */

import React, { type JSX } from "react";
import clsx from "clsx";

export interface ControlBtnProps {
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  /** Numeric badge shown in top-right corner (hidden when 0 or undefined) */
  badge?: number;
  /** Show an unread dot instead of a number */
  badgeDot?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({
  onClick,
  active,
  danger,
  disabled,
  label,
  badge,
  badgeDot,
  children,
  className,
  title,
}): JSX.Element => (
  <div className="relative flex flex-col items-center gap-1 group">
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      className={clsx(
        "relative h-11 w-11 flex items-center justify-center rounded-xl",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#111115]",
        danger
          ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
          : active
            ? "bg-white/15 text-white hover:bg-white/20"
            : "bg-white/[0.06] text-white/65 hover:bg-white/12 hover:text-white",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      {children}

      {/* Numeric badge */}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {/* Unread dot badge */}
      {badgeDot && (badge === undefined || badge === 0) && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 border border-[#111115]" />
      )}
    </button>

    {/* Tooltip label on hover */}
    <span
      className={clsx(
        "text-[9px] leading-none text-white/35 transition-colors duration-100",
        "group-hover:text-white/55",
      )}
    >
      {label}
    </span>
  </div>
);

export default ControlBtn;
