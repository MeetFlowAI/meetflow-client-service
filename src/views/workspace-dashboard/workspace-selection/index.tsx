/* Imports */
import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Rocket,
  Users,
  Hash,
  LogOut,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import SessionContext from "@/context/SessionContext";
import {
  useWorkspace,
  type ISelectedWorkspace,
} from "@/context/WorkspaceContext";
import { getMyWorkspacesRequest } from "@/services/organization-dashboard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Toast from "@/components/toast";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";

// ----------------------------------------------------------------------

interface WorkspaceItem {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  channel_count: number;
  is_active: boolean;
}

const GRADIENT_PALETTE = [
  {
    from: "from-primary-500",
    to: "to-primary-700",
    light: "bg-primary-500",
    text: "text-white",
  },
  {
    from: "from-blue-500",
    to: "to-blue-700",
    light: "bg-blue-500",
    text: "text-white",
  },
  {
    from: "from-emerald-500",
    to: "to-emerald-700",
    light: "bg-emerald-500",
    text: "text-white",
  },
  {
    from: "from-violet-500",
    to: "to-violet-700",
    light: "bg-violet-500",
    text: "text-white",
  },
  {
    from: "from-amber-500",
    to: "to-amber-700",
    light: "bg-amber-500",
    text: "text-white",
  },
  {
    from: "from-rose-500",
    to: "to-rose-700",
    light: "bg-rose-500",
    text: "text-white",
  },
];

const getGradient = (i: number) =>
  GRADIENT_PALETTE[i % GRADIENT_PALETTE.length];

// ----------------------------------------------------------------------

/**
 * WorkspaceEnterOverlay — Slack-style full-screen "entering workspace" transition.
 */
const WorkspaceEnterOverlay = ({
  workspace,
}: {
  workspace: ISelectedWorkspace;
}): JSX.Element => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-secondary-900 gap-5 animate-in fade-in duration-200">
    <div className="flex flex-col items-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
      </div>
      <div className="text-center">
        <p
          className={clsx(
            typography.semibold20,
            "text-secondary-800 dark:text-secondary-100",
          )}
        >
          Opening {workspace.name}
        </p>
        <p
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500 mt-1",
          )}
        >
          Getting your workspace ready…
        </p>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------

/**
 * WorkspaceCard — individual workspace card in the selection grid.
 */
interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  index: number;
  onSelect: (ws: WorkspaceItem) => void;
  isLoading: boolean;
}

const WorkspaceCard = ({
  workspace,
  index,
  onSelect,
  isLoading,
}: WorkspaceCardProps): JSX.Element => {
  const gradient = getGradient(index);
  const initials = workspace.name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => onSelect(workspace)}
      disabled={!workspace.is_active || isLoading}
      className={clsx(
        "group relative w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden",
        workspace.is_active
          ? [
              "bg-white dark:bg-secondary-800",
              "border-secondary-200 dark:border-secondary-700",
              "hover:border-primary-300 dark:hover:border-primary-700",
              "hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5",
              "hover:-translate-y-0.5",
              "cursor-pointer",
            ]
          : [
              "bg-secondary-50 dark:bg-secondary-800/50 opacity-60 cursor-not-allowed",
              "border-secondary-200 dark:border-secondary-700",
            ],
      )}
    >
      {/* Gradient top accent */}
      <div
        className={clsx(
          "h-1 w-full bg-gradient-to-r",
          gradient.from,
          gradient.to,
        )}
      />

      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Avatar */}
          <div
            className={clsx(
              "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
              "text-white font-bold text-sm shadow-sm",
              gradient.from,
              gradient.to,
            )}
          >
            {initials}
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
                workspace.is_active
                  ? "bg-success-500 animate-pulse"
                  : "bg-secondary-400",
              )}
            />
            {workspace.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Name + description */}
        <div className="flex flex-col gap-1.5">
          <h3
            className={clsx(
              typography.semibold16,
              "text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",
            )}
          >
            {workspace.name}
          </h3>
          <p
            className={clsx(
              typography.regular14,
              "text-secondary-400 dark:text-secondary-500 line-clamp-2",
              "min-h-[2.5rem]",
            )}
          >
            {workspace.description ?? "No description provided."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1 border-t border-secondary-100 dark:border-secondary-700">
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
            <Hash className="h-3.5 w-3.5 text-secondary-400" />
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

        {/* Open indicator */}
        {workspace.is_active && (
          <div
            className={clsx(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200",
              "bg-secondary-50 dark:bg-secondary-700/30 border border-secondary-200 dark:border-secondary-600",
              "group-hover:bg-primary-500 group-hover:border-primary-500",
              "group-hover:text-white",
            )}
          >
            <CheckCircle2
              className={clsx(
                "h-4 w-4 transition-colors",
                "text-secondary-400 dark:text-secondary-500",
                "group-hover:text-white",
              )}
            />
            <span
              className={clsx(
                typography.medium14,
                "text-secondary-500 dark:text-secondary-400 transition-colors",
                "group-hover:text-white",
              )}
            >
              Open Workspace
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

// ----------------------------------------------------------------------

/**
 * WorkspaceSelection — full-page workspace selection for org members.
 * Slack-style: full screen, no sidebar, logo top-left, logout top-right.
 * On card click → "entering workspace" overlay → navigate to dashboard.
 *
 * @component
 * @returns {JSX.Element}
 */
const WorkspaceSelection = (): JSX.Element => {
  /* Hooks */
  const navigate = useNavigate();
  const { user, LogoutUser } = useContext(SessionContext);
  const { enterWorkspace, isEnteringWorkspace, selectedWorkspace } =
    useWorkspace();

  /* States */
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectingId, setSelectingId] = useState<number | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = workspaces.filter(
    (w) => !search || w.name.toLowerCase().includes(search.toLowerCase()),
  );

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Member";

  // ── Select handler ────────────────────────────────────────────────────────
  const handleSelect = async (ws: WorkspaceItem) => {
    if (!ws.is_active) return;
    setSelectingId(ws.id);
    try {
      await enterWorkspace(ws as ISelectedWorkspace);
      navigate(PAGE_WORKSPACE_DASHBOARD.home.absolutePath, { replace: true });
    } finally {
      setSelectingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Slack-style entering overlay */}
      {isEnteringWorkspace && selectedWorkspace && (
        <WorkspaceEnterOverlay workspace={selectedWorkspace} />
      )}
      {selectingId !== null && !isEnteringWorkspace && (
        <WorkspaceEnterOverlay
          workspace={
            workspaces.find((w) => w.id === selectingId) as ISelectedWorkspace
          }
        />
      )}

      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col">
        {/* ── Top Bar ──────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={AppLogoDark}
              alt="MeetFlow"
              className="h-8 hidden dark:block"
            />
            <img
              src={AppLogoLight}
              alt="MeetFlow"
              className="h-8 block dark:hidden"
            />
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <span
                  className={clsx(
                    typography.semibold12,
                    "text-primary-600 dark:text-primary-400",
                  )}
                >
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
              <span
                className={clsx(
                  typography.medium14,
                  "text-secondary-700 dark:text-secondary-300 hidden sm:block",
                )}
              >
                {fullName}
              </span>
            </div>
            <button
              onClick={LogoutUser}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                "text-secondary-500 dark:text-secondary-400",
                "hover:bg-secondary-100 dark:hover:bg-secondary-700",
                "hover:text-secondary-700 dark:hover:text-secondary-200",
                typography.medium14,
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </header>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center px-6 py-12 max-w-5xl mx-auto w-full">
          {/* Hero heading */}
          <div className="text-center mb-10">
            <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h1
              className={clsx(
                typography.semibold32,
                "text-secondary-900 dark:text-white mb-2",
              )}
            >
              Choose a workspace
            </h1>
            <p
              className={clsx(
                typography.regular16,
                "text-secondary-400 dark:text-secondary-500",
              )}
            >
              Select a workspace to start collaborating with your team
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md mb-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces…"
              className="pl-10"
            />
          </div>

          {/* Meta info */}
          {!loading && workspaces.length > 0 && (
            <div className="flex items-center gap-2 mb-6 self-start w-full">
              <span
                className={clsx(
                  typography.medium14,
                  "text-secondary-500 dark:text-secondary-400",
                )}
              >
                {filtered.length} workspace{filtered.length !== 1 ? "s" : ""}{" "}
                {search ? "found" : "available"}
              </span>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
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
                  "text-secondary-400 dark:text-secondary-500 text-center max-w-xs",
                )}
              >
                {search
                  ? "Try a different search term"
                  : "You haven't been added to any workspace yet. Contact your administrator."}
              </p>
            </div>
          )}

          {/* Workspace grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {filtered.map((ws, index) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  index={index}
                  onSelect={handleSelect}
                  isLoading={selectingId !== null}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default WorkspaceSelection;
