/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import { Video, Play, Users, Clock } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import {
  SectionHeader,
  SectionCards,
  SectionActions,
  type SectionCard,
  type SortOption,
  type FilterGroup,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  getAllMeetingsRequest,
} from "@/services/workspace-dashboard/meetings";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";
import CreateMeetingModal from "./components/CreateMeetingModal";

// ----------------------------------------------------------------------

const SORT_OPTIONS: SortOption[] = [
  { value: "scheduled_at", label: "Date" },
  { value: "title", label: "Title" },
];

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Status",
    options: [
      { value: "live", label: "Live" },
      { value: "upcoming", label: "Upcoming" },
      { value: "ended", label: "Ended" },
    ],
  },
];

const meetingStatusStyle = {
  live: {
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-500 dark:text-red-400",
    label: "Live",
    btn: "bg-red-500 hover:bg-red-600 text-white",
    action: "Join Now",
  },
  upcoming: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Upcoming",
    btn: "bg-primary-500 hover:bg-primary-600 text-white",
    action: "Join",
  },
  ended: {
    dot: "bg-secondary-400",
    badge:
      "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
    label: "Ended",
    btn: "bg-secondary-200 dark:bg-secondary-600 hover:bg-secondary-300 text-secondary-700",
    action: "Recording",
  },
};

// ----------------------------------------------------------------------

/**
 * ManageMeetings — lists all workspace meetings from the real API.
 *
 * @component
 */
const ManageMeetings = (): JSX.Element => {
  const { selectedWorkspaceId } = useWorkspace();

  /* States */
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMeetingsRequest({
        workspace_id: selectedWorkspaceId ?? undefined,
        limit: 100,
      });
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setMeetings(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load meetings",
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // ── Derived ────────────────────────────────────────────────────────────────
  let filtered = meetings.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilters.size === 0 || activeFilters.has(m.status ?? "upcoming");
    return matchSearch && matchFilter;
  });

  if (sortBy === "scheduled_at") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(a.scheduled_at ?? 0).getTime() -
        new Date(b.scheduled_at ?? 0).getTime(),
    );
  } else if (sortBy === "title") {
    filtered = [...filtered].sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? ""),
    );
  }

  const liveCount = meetings.filter((m) => m.status === "live").length;
  const upcomingCount = meetings.filter(
    (m) => m.status === "upcoming" || !m.status,
  ).length;

  const statCards: SectionCard[] = [
    {
      label: "Live Now",
      value: liveCount,
      icon: Video,
      color: "destructive",
      hint: "Active meetings",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: Clock,
      color: "warning",
      hint: "Scheduled",
    },
    {
      label: "Total Meetings",
      value: meetings.length,
      icon: Users,
      color: "primary",
      hint: "All meetings",
    },
  ];

  /* Output */
  return (
    <WorkspaceDashboardPage title="Meetings">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Manage Meetings"
          subtitle="Schedule, join, and manage workspace meetings"
          addButtonLabel="Schedule Meeting"
          onAddClick={() => setShowCreate(true)}
        />

        <SectionCards cards={statCards} isLoading={loading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search meetings…"
          onSearchChange={(v) => setSearch(v)}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={setSortBy}
          filterGroups={FILTER_GROUPS}
          activeFilters={activeFilters}
          onFilterChange={(v, c) =>
            setActiveFilters((p) => {
              const n = new Set(p);
              if (c) n.add(v);
              else n.delete(v);
              return n;
            })
          }
          onClearFilters={() => setActiveFilters(new Set())}
          onRefresh={fetchMeetings}
        />

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800"
              >
                <div className="h-11 w-11 rounded-xl bg-secondary-200 dark:bg-secondary-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
                  <div className="h-3 bg-secondary-100 dark:bg-secondary-700/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((meeting) => {
              const status: "live" | "upcoming" | "ended" =
                meeting.status === "live"
                  ? "live"
                  : meeting.status === "ended"
                    ? "ended"
                    : "upcoming";
              const s = meetingStatusStyle[status];

              return (
                <div
                  key={meeting.id}
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                    "border-secondary-100 dark:border-secondary-700",
                    "bg-white dark:bg-secondary-800",
                    "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm",
                  )}
                >
                  <div
                    className={clsx(
                      "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                      status === "live"
                        ? "bg-red-500/10"
                        : status === "upcoming"
                          ? "bg-primary-500/10"
                          : "bg-secondary-100 dark:bg-secondary-700",
                    )}
                  >
                    <Video
                      className={clsx(
                        "h-5 w-5",
                        status === "live"
                          ? "text-red-500"
                          : status === "upcoming"
                            ? "text-primary-500"
                            : "text-secondary-400",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100 truncate",
                        )}
                      >
                        {meeting.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "border-0 flex items-center gap-1.5 w-fit px-2 py-0.5 shrink-0",
                          s.badge,
                        )}
                      >
                        <span
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            s.dot,
                          )}
                        />
                        <span className={typography.medium12}>{s.label}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {meeting.scheduled_at && (
                        <span
                          className={clsx(
                            typography.regular12,
                            "text-secondary-400",
                          )}
                        >
                          {new Date(meeting.scheduled_at).toLocaleString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}
                      {meeting.duration_minutes && (
                        <>
                          <span className="text-secondary-300 dark:text-secondary-600">
                            ·
                          </span>
                          <span
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400",
                            )}
                          >
                            {meeting.duration_minutes}m
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button size="sm" className={clsx("shrink-0", s.btn)}>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    {s.action}
                  </Button>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Video className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mb-3" />
                <p
                  className={clsx(typography.semibold14, "text-secondary-500")}
                >
                  No meetings found
                </p>
                <p
                  className={clsx(
                    typography.regular12,
                    "text-secondary-400 mt-1",
                  )}
                >
                  Schedule a new meeting or clear your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateMeetingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={selectedWorkspaceId ?? 0}
        onCreated={fetchMeetings}
      />
    </WorkspaceDashboardPage>
  );
};

export default ManageMeetings;
