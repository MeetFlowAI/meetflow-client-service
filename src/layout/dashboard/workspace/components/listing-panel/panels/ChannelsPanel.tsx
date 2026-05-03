/**
 * layout/dashboard/workspace/components/listing-panel/panels/ChannelsPanel.tsx
 *
 * Listing panel for Channels nav item.
 * Shows public and private channels in collapsible sections (Slack-style).
 *
 * Data: useQuery — auto-cached, deduplicated across WorkspaceHome + this panel.
 * Design: Slack channel list style — # for public, 🔒 for private.
 */

import React, { useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hash, Lock, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  getAllChannelsRequest,
  type IChannel,
} from "@/services/workspace-dashboard/channels";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { ScrollArea } from "@/components/ui/scroll-area";
import PanelSearch from "../shared/PanelSearch";
import PanelItem from "../shared/PanelItem";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

// Skeleton for loading state
const ChannelSkeleton = () => (
  <div className="px-2 space-y-0.5">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg animate-pulse"
      >
        <div className="h-5 w-5 rounded bg-secondary-200 dark:bg-secondary-700 shrink-0" />
        <div
          className="flex-1 h-3 rounded bg-secondary-200 dark:bg-secondary-700"
          style={{ width: `${50 + i * 10}%` }}
        />
      </div>
    ))}
  </div>
);

// Collapsible section label (Public / Private)
interface SectionLabelProps {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  count,
  isOpen,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className={clsx(
      "w-full flex items-center gap-1 px-3 py-1.5 rounded-md",
      "hover:bg-secondary-100 dark:hover:bg-secondary-800/60",
      "transition-colors group",
    )}
  >
    {isOpen ? (
      <ChevronDown className="h-3 w-3 text-secondary-400 dark:text-secondary-500" />
    ) : (
      <ChevronRight className="h-3 w-3 text-secondary-400 dark:text-secondary-500" />
    )}
    <span
      className={clsx(
        typography.semibold12,
        "text-secondary-500 dark:text-secondary-400 uppercase tracking-widest flex-1 text-left",
      )}
      style={{ fontSize: "10px" }}
    >
      {label}
    </span>
    <span
      className="text-secondary-400 dark:text-secondary-500"
      style={{ fontSize: "10px" }}
    >
      {count}
    </span>
  </button>
);

// ----------------------------------------------------------------------

interface ChannelsPanelProps {
  onCreateChannel?: () => void;
}

const ChannelsPanel: React.FC<ChannelsPanelProps> = ({
  onCreateChannel,
}): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspaceId } = useWorkspace();

  const [search, setSearch] = useState("");
  const [publicOpen, setPublicOpen] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);

  // ── Data: TanStack Query ─────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["channels", selectedWorkspaceId],
    queryFn: () => getAllChannelsRequest(selectedWorkspaceId!),
    enabled: !!selectedWorkspaceId,
    staleTime: 30_000, // 30s — channels don't change that fast
  });

  const publicChannels: IChannel[] = data?.publicChannels ?? [];
  const privateChannels: IChannel[] = data?.privateChannels ?? [];

  // ── Filter ───────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredPublic = q
    ? publicChannels.filter((ch) => ch.name.toLowerCase().includes(q))
    : publicChannels;
  const filteredPrivate = q
    ? privateChannels.filter((ch) => ch.name.toLowerCase().includes(q))
    : privateChannels;

  // ── Derive active channel from URL ───────────────────────────────────
  const viewBase = PAGE_WORKSPACE_DASHBOARD.channels.view.absolutePath.replace(
    ":id",
    "",
  );
  const activeChannelId = location.pathname.startsWith(viewBase)
    ? location.pathname.replace(viewBase, "")
    : null;

  const handleChannelClick = (channelId: number) => {
    navigate(
      PAGE_WORKSPACE_DASHBOARD.channels.view.absolutePath.replace(
        ":id",
        String(channelId),
      ),
    );
  };

  // ── Icon helper ──────────────────────────────────────────────────────
  const ChannelIcon = ({ type }: { type: "public" | "private" }) =>
    type === "private" ? (
      <div className="h-6 w-6 rounded-md bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
        <Lock className="h-3 w-3 text-secondary-500 dark:text-secondary-400" />
      </div>
    ) : (
      <div className="h-6 w-6 rounded-md bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
        <Hash className="h-3 w-3 text-secondary-500 dark:text-secondary-400" />
      </div>
    );

  // ── Empty state ──────────────────────────────────────────────────────
  const isEmpty =
    !isLoading && filteredPublic.length === 0 && filteredPrivate.length === 0;

  return (
    <>
      {/* Search */}
      <PanelSearch
        value={search}
        onChange={setSearch}
        placeholder="Search channels…"
      />

      {/* Channel list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="pt-2">
            <ChannelSkeleton />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Hash className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
            <p
              className={clsx(
                typography.medium14,
                "text-secondary-500 dark:text-secondary-400",
              )}
            >
              {search ? "No channels match your search" : "No channels yet"}
            </p>
            {!search && onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="mt-3 text-xs text-primary-500 dark:text-primary-400 hover:underline font-medium"
              >
                Create the first channel
              </button>
            )}
          </div>
        ) : (
          <div className="py-1 space-y-0.5">
            {/* Public channels */}
            {filteredPublic.length > 0 && (
              <div>
                <SectionLabel
                  label="Public"
                  count={filteredPublic.length}
                  isOpen={publicOpen}
                  onToggle={() => setPublicOpen((v) => !v)}
                />
                {publicOpen && (
                  <div className="px-1.5 space-y-0.5 mt-0.5">
                    {filteredPublic.map((ch) => (
                      <PanelItem
                        key={ch.id}
                        isActive={activeChannelId === String(ch.id)}
                        icon={<ChannelIcon type="public" />}
                        title={ch.name}
                        subtitle={ch.description ?? undefined}
                        onClick={() => handleChannelClick(ch.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Private channels */}
            {filteredPrivate.length > 0 && (
              <div>
                <SectionLabel
                  label="Private"
                  count={filteredPrivate.length}
                  isOpen={privateOpen}
                  onToggle={() => setPrivateOpen((v) => !v)}
                />
                {privateOpen && (
                  <div className="px-1.5 space-y-0.5 mt-0.5">
                    {filteredPrivate.map((ch) => (
                      <PanelItem
                        key={ch.id}
                        isActive={activeChannelId === String(ch.id)}
                        icon={<ChannelIcon type="private" />}
                        title={ch.name}
                        subtitle={ch.description ?? undefined}
                        onClick={() => handleChannelClick(ch.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default ChannelsPanel;
