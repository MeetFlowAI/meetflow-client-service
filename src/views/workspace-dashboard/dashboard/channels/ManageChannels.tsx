/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Hash, Lock, Users, MessageSquare } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import {
  SectionHeader,
  SectionCards,
  SectionActions,
  type SectionCard,
  type SortOption,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getAllChannelsRequest } from "@/services/workspace-dashboard/channels";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import CreateChannelModal from "./components/CreateChannelModal";

// ----------------------------------------------------------------------

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "member_count", label: "Members" },
];

// ----------------------------------------------------------------------

/**
 * ManageChannels — full-page channel listing (right panel).
 * Visible when user navigates to /workspace/channels.
 *
 * @component
 */
const ManageChannels = (): JSX.Element => {
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspace();

  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);

  const fetchChannels = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getAllChannelsRequest(selectedWorkspaceId);
      const data = [
        ...(res?.publicChannels ?? []),
        ...(res?.privateChannels ?? []),
      ];
      setChannels(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load channels",
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  let filtered = channels.filter(
    (ch) =>
      ch.name?.toLowerCase().includes(search.toLowerCase()) ||
      ch.description?.toLowerCase().includes(search.toLowerCase()),
  );

  if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
    );
  } else if (sortBy === "member_count") {
    filtered = [...filtered].sort(
      (a, b) => (b.member_count ?? 0) - (a.member_count ?? 0),
    );
  }

  const publicCount = channels.filter((ch) => ch.type !== "private").length;
  const privateCount = channels.filter((ch) => ch.type === "private").length;

  const statCards: SectionCard[] = [
    {
      label: "Total Channels",
      value: channels.length,
      icon: Hash,
      color: "primary",
      hint: "All channels",
    },
    {
      label: "Public Channels",
      value: publicCount,
      icon: MessageSquare,
      color: "information",
      hint: "Open to everyone",
    },
    {
      label: "Private Channels",
      value: privateCount,
      icon: Lock,
      color: "warning",
      hint: "Invite-only",
    },
  ];

  return (
    <WorkspaceDashboardPage title="Channels">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Channels"
          subtitle="Browse and manage all workspace channels"
          addButtonLabel="Create Channel"
          onAddClick={() => setShowCreate(true)}
        />

        <SectionCards cards={statCards} isLoading={loading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search channels…"
          onSearchChange={(v) => setSearch(v)}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={setSortBy}
          onRefresh={fetchChannels}
        />

        {/* Channel grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse h-44 rounded-2xl bg-secondary-100 dark:bg-secondary-700"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((ch) => (
              <button
                key={ch.id}
                onClick={() =>
                  navigate(
                    PAGE_WORKSPACE_DASHBOARD.channels.view.absolutePath.replace(
                      ":id",
                      String(ch.id),
                    ),
                  )
                }
                className={clsx(
                  "flex flex-col gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left",
                  "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800",
                  "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      {ch.type === "private" ? (
                        <Lock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Hash className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100",
                        )}
                      >
                        {ch.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "mt-0.5 border-0 text-[10px] px-1.5 py-0.5",
                          ch.type === "private"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
                        )}
                      >
                        {ch.type === "private" ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p
                  className={clsx(
                    typography.regular14,
                    "text-secondary-500 leading-snug line-clamp-2 min-h-[2.5rem]",
                  )}
                >
                  {ch.description ?? "No description."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-secondary-100 dark:border-secondary-700">
                  <div className="flex items-center gap-1.5 text-secondary-400">
                    <Users className="h-3.5 w-3.5" />
                    <span className={typography.regular12}>
                      {ch.member_count ?? 0} members
                    </span>
                  </div>
                  {ch.updated_at && (
                    <span
                      className={clsx(
                        typography.regular12,
                        "text-secondary-400",
                      )}
                    >
                      {new Date(ch.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Hash className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mb-3" />
            <p className={clsx(typography.semibold14, "text-secondary-500")}>
              No channels found
            </p>
            <p
              className={clsx(typography.regular12, "text-secondary-400 mt-1")}
            >
              {search
                ? "Try a different search term."
                : "Create your first channel."}
            </p>
          </div>
        )}
      </div>

      {selectedWorkspaceId && (
        <CreateChannelModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          workspaceId={selectedWorkspaceId}
          onCreated={fetchChannels}
        />
      )}
    </WorkspaceDashboardPage>
  );
};

export default ManageChannels;
