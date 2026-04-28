/**
 * components/shared/PanelHeader.tsx
 *
 * Reusable header for right-side meeting panels (Chat, Participants).
 */

import React, { type JSX } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  badge?: number;
  onClose: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  icon,
  badge,
  onClose,
}): JSX.Element => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] shrink-0">
    <div className="flex items-center gap-2.5">
      {icon && (
        <span className="text-white/50">{icon}</span>
      )}
      <span className="text-sm font-semibold text-white tracking-tight">
        {title}
      </span>
      {badge !== undefined && (
        <span
          className={clsx(
            "h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold",
            "flex items-center justify-center leading-none",
            "bg-white/[0.08] text-white/60",
          )}
        >
          {badge}
        </span>
      )}
    </div>

    <button
      onClick={onClose}
      aria-label="Close panel"
      className="h-7 w-7 flex items-center justify-center rounded-lg text-white/35 hover:text-white hover:bg-white/10 transition-colors duration-150"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default PanelHeader;
