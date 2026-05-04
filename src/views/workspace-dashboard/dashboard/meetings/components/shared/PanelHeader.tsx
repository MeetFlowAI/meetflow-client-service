/**
 * components/shared/PanelHeader.tsx  (v2 — theme-aware)
 */

import React, { type JSX } from "react";
import { X } from "lucide-react";

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  badge?: number;
  onClose: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title, icon, badge, onClose,
}): JSX.Element => (
  <div
    className="flex items-center justify-between px-4 py-3.5 shrink-0"
    style={{
      background: "var(--mf-panel-header, var(--mf-bg-raised))",
      borderBottom: "1px solid var(--mf-panel-border, var(--mf-border))",
    }}
  >
    <div className="flex items-center gap-2.5">
      {icon && (
        <span style={{ color: "var(--mf-text-muted)" }}>{icon}</span>
      )}
      <span
        className="text-sm font-semibold tracking-tight"
        style={{ color: "var(--mf-text-primary)" }}
      >
        {title}
      </span>
      {badge !== undefined && (
        <span
          className="flex items-center justify-center rounded-full text-[11px] font-semibold leading-none px-1.5 py-0.5"
          style={{
            background: "var(--mf-bg-elevated)",
            color: "var(--mf-text-muted)",
            minWidth: "20px",
          }}
        >
          {badge}
        </span>
      )}
    </div>

    <button
      onClick={onClose}
      aria-label="Close panel"
      className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors"
      style={{
        color: "var(--mf-text-muted)",
        borderRadius: "var(--mf-radius-sm)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "var(--mf-bg-elevated)";
        (e.currentTarget as HTMLElement).style.color = "var(--mf-text-primary)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = "var(--mf-text-muted)";
      }}
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default PanelHeader;
