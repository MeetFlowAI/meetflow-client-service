/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Users,
  MessageSquare,
  ArrowRight,
  Search,
  LayoutGrid,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import OrgDashboardPage from "@/components/page/dashboard/organization";
import { SectionHeader } from "@/components/dashboard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Toast from "@/components/toast";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";
import { getMyWorkspacesRequest } from "@/services/organization-dashboard";

// ----------------------------------------------------------------------

interface WorkspaceItem {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  channel_count: number;
  is_active: boolean;
}

// Cycle through gradient pairs so every workspace gets a distinct colour band
const GRADIENT_PALETTE = [
  "from-primary-500 to-primary-700",
  "from-information-500 to-information-700",
  "from-success-500 to-success-700",
  "from-warning-500 to-warning-700",
  "from-destructive-500 to-destructive-700",
  "from-secondary-400 to-secondary-600",
];

const getGradient = (index: number): string =>
  GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];

// ----------------------------------------------------------------------

/**
 * Launchpad — workspace selection page for org members.
 *
 * Fetches workspaces the current user belongs to via `GET /workspace/workspaces/my-workspaces`.
 * Clicking "Open Workspace" navigates into that workspace's dashboard.
 */
const Launchpad = (): JSX.Element => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyWorkspacesRequest();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setWorkspaces(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load workspaces",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = workspaces.filter(
    (w) => !search || w.name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = workspaces.filter((w) => w.is_active).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <OrgDashboardPage title="Launchpad">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Launchpad"
          subtitle="Select a workspace to jump into its dashboard"
        />

        {/* Summary bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl",
              "bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800",
            )}
          >
            <LayoutGrid className="h-4 w-4 text-primary-500" />
            <span
              className={clsx(
                typography.medium14,
                "text-primary-700 dark:text-primary-300",
              )}
            >
              {loading ? "…" : workspaces.length} Workspaces
            </span>
          </div>
          <div
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl",
              "bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-800",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-success-500 shrink-0" />
            <span
              className={clsx(
                typography.medium14,
                "text-success-700 dark:text-success-300",
              )}
            >
              {loading ? "…" : activeCount} Active
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces…"
            className="pl-10"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
              <Rocket className="h-7 w-7 text-secondary-400" />
            </div>
            <p
              className={clsx(
                typography.semibold14,
                "text-secondary-600 dark:text-secondary-400",
              )}
            >
              {search ? "No workspaces found" : "No workspaces yet"}
            </p>
            <p
              className={clsx(
                typography.regular14,
                "text-secondary-400 dark:text-secondary-500",
              )}
            >
              {search
                ? "Try a different search term"
                : "You haven't been added to any workspace yet."}
            </p>
          </div>
        )}

        {/* Workspace grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ws, index) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                gradient={getGradient(index)}
                onOpen={() =>
                  navigate(PAGE_WORKSPACE_DASHBOARD.home.absolutePath)
                }
              />
            ))}
          </div>
        )}
      </div>
    </OrgDashboardPage>
  );
};

// ----------------------------------------------------------------------

interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  gradient: string;
  onOpen: () => void;
}

const WorkspaceCard = ({
  workspace,
  gradient,
  onOpen,
}: WorkspaceCardProps): JSX.Element => {
  return (
    <Card
      className={clsx(
        "rounded-2xl border overflow-hidden shadow-sm transition-all duration-200",
        workspace.is_active
          ? "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800"
          : "border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/60 opacity-70",
      )}
    >
      {/* Colour header band */}
      <div className={clsx("h-1.5 w-full bg-gradient-to-r", gradient)} />

      <CardContent className="px-5 py-5 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          {/* Initials avatar */}
          <div
            className={clsx(
              "h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-semibold text-sm",
              gradient,
            )}
          >
            {workspace.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={clsx(
              "border-0 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0",
              workspace.is_active
                ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
            )}
          >
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full",
                workspace.is_active ? "bg-success-500" : "bg-secondary-400",
              )}
            />
            {workspace.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Name + description */}
        <div className="flex flex-col gap-1">
          <h3
            className={clsx(
              typography.semibold16,
              "text-secondary-900 dark:text-white",
            )}
          >
            {workspace.name}
          </h3>
          <p
            className={clsx(
              typography.regular14,
              "text-secondary-400 dark:text-secondary-500 line-clamp-2 min-h-[2.5rem]",
            )}
          >
            {workspace.description ?? "No description."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-secondary-400" />
            <span
              className={clsx(
                typography.medium12,
                "text-secondary-500 dark:text-secondary-400",
              )}
            >
              {workspace.member_count ?? 0} members
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-secondary-400" />
            <span
              className={clsx(
                typography.medium12,
                "text-secondary-500 dark:text-secondary-400",
              )}
            >
              {workspace.channel_count ?? 0} channels
            </span>
          </div>
        </div>

        {/* Open button */}
        <Button
          size="medium"
          onClick={onOpen}
          disabled={!workspace.is_active}
          className={clsx(
            "w-full rounded-[10px] mt-1",
            !workspace.is_active && "opacity-50 cursor-not-allowed",
          )}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {workspace.is_active ? "Open Workspace" : "Inactive"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Launchpad;
