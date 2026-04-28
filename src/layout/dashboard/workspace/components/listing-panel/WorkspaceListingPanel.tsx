/**
 * layout/dashboard/workspace/components/listing-panel/WorkspaceListingPanel.tsx
 *
 * Thin router — renders the correct panel based on activeNav from WorkspaceContext.
 * All business logic lives in the individual panels (ChannelsPanel, ChatsPanel, etc).
 *
 * Before: 758 lines (Home + Channels + Chats + Members + shared UI all in one file)
 * After:  ~80 lines (router only)
 *
 * Each panel is lazy-loaded so we don't pay for all 4 panels on initial load.
 */

import React, { lazy, Suspense, type JSX } from "react";
import clsx from "clsx";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import PanelHeader from "./shared/PanelHeader";

// ── Lazy panels ───────────────────────────────────────────────────────
// Each panel is in its own file — code-split on the panel level.

const HomePanel = lazy(() => import("./panels/HomePanel"));
const ChannelsPanel = lazy(() => import("./panels/ChannelsPanel"));
const ChatsPanel = lazy(() => import("./panels/ChatsPanel"));
const MembersPanel = lazy(() => import("./panels/MembersPanel"));

// ----------------------------------------------------------------------

// Panel metadata — title, subtitle, add button label per nav item
const PANEL_META: Record<
  string,
  { title: string; subtitle?: string; addLabel?: string }
> = {
  home: { title: "Home" },
  channels: {
    title: "Channels",
    subtitle: undefined,
    addLabel: "Create channel",
  },
  chats: { title: "Direct Messages" },
  members: { title: "Members" },
};

// Minimal inline loader for panel Suspense fallback
const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="h-4 w-4 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
  </div>
);

// ----------------------------------------------------------------------

interface WorkspaceListingPanelProps {
  onCreateChannel?: () => void;
}

/**
 * WorkspaceListingPanel
 *
 * Reads `activeNav` from WorkspaceContext and renders the correct panel.
 * Provides the panel header (title + add button) for all panels.
 */
const WorkspaceListingPanel: React.FC<WorkspaceListingPanelProps> = ({
  onCreateChannel,
}): JSX.Element => {
  const { activeNav } = useWorkspace();

  const meta = PANEL_META[activeNav] ?? PANEL_META.home;
  const showAdd = activeNav === "channels" && !!onCreateChannel;

  return (
    <div
      className={clsx(
        "flex flex-col h-full overflow-hidden",
        "bg-white dark:bg-secondary-900",
      )}
    >
      {/* ── Unified panel header ─────────────────────────────────── */}
      <PanelHeader
        title={meta.title}
        subtitle={meta.subtitle}
        onAdd={showAdd ? onCreateChannel : undefined}
        addLabel={meta.addLabel}
      />

      {/* ── Panel body — lazy-loaded per activeNav ───────────────── */}
      <Suspense fallback={<PanelLoader />}>
        {activeNav === "home" && <HomePanel />}
        {activeNav === "channels" && (
          <ChannelsPanel onCreateChannel={onCreateChannel} />
        )}
        {activeNav === "chats" && <ChatsPanel />}
        {activeNav === "members" && <MembersPanel />}
      </Suspense>
    </div>
  );
};

export default WorkspaceListingPanel;
