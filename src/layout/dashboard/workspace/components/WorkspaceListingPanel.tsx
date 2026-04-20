/* Imports */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  type JSX,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Hash,
  Lock,
  Users,
  MessageCircle,
  Loader2,
  Zap,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import SessionContext from "@/context/SessionContext";
import { getAllChannelsRequest } from "@/services/workspace-dashboard/channels";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { ScrollArea } from "@/components/ui/scroll-area";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import Toast from "@/components/toast";

// ----------------------------------------------------------------------
// Design tokens:
//  Panel bg:      bg-white / dark:bg-secondary-800
//  Active item:   bg-primary-50 / dark:bg-primary-500/15
//  Border:        border-secondary-200 / dark:border-secondary-700
// ----------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

// ─── Shared: Panel Header ────────────────────────────────────────────────────

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  showAdd?: boolean;
  loading?: boolean;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  showAdd = true,
  loading,
}): JSX.Element => (
  <div
    className={clsx(
      "px-4 pt-4 pb-3 shrink-0",
      "border-b border-secondary-200 dark:border-secondary-700",
    )}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <h2
          className={clsx(
            typography.semibold14,
            "text-secondary-800 dark:text-secondary-100",
          )}
        >
          {title}
        </h2>
        {loading && (
          <Loader2 className="h-3.5 w-3.5 text-secondary-400 animate-spin" />
        )}
      </div>
      {showAdd && (
        <button
          onClick={onAdd}
          className={clsx(
            "h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
            "bg-primary-100 dark:bg-primary-500/20",
            "text-primary-600 dark:text-primary-400",
            "hover:bg-primary-200 dark:hover:bg-primary-500/30",
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
    {subtitle && (
      <p
        className={clsx(
          typography.regular12,
          "text-secondary-400 dark:text-secondary-500",
        )}
      >
        {subtitle}
      </p>
    )}
  </div>
);

// ─── Shared: Search Input ───────────────────────────────────────────────────

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
}): JSX.Element => (
  <div
    className={clsx(
      "flex items-center gap-2 px-2.5 h-8 rounded-lg mx-4 mt-3 mb-1",
      "bg-secondary-100 dark:bg-secondary-700",
      "border border-secondary-200 dark:border-secondary-600",
    )}
  >
    <Search className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500 shrink-0" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        typography.regular12,
        "flex-1 bg-transparent outline-none",
        "text-secondary-700 dark:text-secondary-200",
        "placeholder:text-secondary-400 dark:placeholder:text-secondary-500",
      )}
    />
  </div>
);

// ─── Shared: Item Skeleton ──────────────────────────────────────────────────

const ItemSkeleton = () => (
  <div className="animate-pulse flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl">
    <div className="h-8 w-8 rounded-xl bg-secondary-200 dark:bg-secondary-700 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
      <div className="h-2.5 bg-secondary-100 dark:bg-secondary-700/50 rounded w-1/2" />
    </div>
  </div>
);

// ─── HOME PANEL ─────────────────────────────────────────────────────────────

const HomeListingPanel: React.FC = (): JSX.Element => {
  const navigate = useNavigate();

  const QUICK_ACTIONS = [
    {
      label: "Browse Channels",
      icon: Hash,
      lightColor: "text-violet-600",
      lightBg: "bg-violet-50",
      darkColor: "dark:text-violet-400",
      darkBg: "dark:bg-violet-500/10",
      action: () => navigate(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath),
    },
    {
      label: "Direct Messages",
      icon: MessageCircle,
      lightColor: "text-blue-600",
      lightBg: "bg-blue-50",
      darkColor: "dark:text-blue-400",
      darkBg: "dark:bg-blue-500/10",
      action: () => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath),
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <h3
              className={clsx(
                typography.semibold12,
                "text-secondary-400 dark:text-secondary-500 uppercase tracking-wider",
              )}
            >
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(
              ({
                label,
                icon: Icon,
                lightColor,
                lightBg,
                darkColor,
                darkBg,
                action,
              }) => (
                <button
                  key={label}
                  onClick={action}
                  className={clsx(
                    "flex flex-col items-start gap-2 p-3 rounded-xl text-left group transition-all duration-150",
                    "bg-secondary-50 dark:bg-secondary-700/40",
                    "border border-secondary-200 dark:border-secondary-700/50",
                    "hover:border-secondary-300 dark:hover:border-secondary-600",
                    "hover:bg-white dark:hover:bg-secondary-700/60 hover:shadow-sm",
                  )}
                >
                  <div className={clsx("p-1.5 rounded-lg", lightBg, darkBg)}>
                    <Icon className={clsx("h-4 w-4", lightColor, darkColor)} />
                  </div>
                  <span
                    className={clsx(
                      typography.medium12,
                      "text-secondary-600 dark:text-secondary-300 group-hover:text-secondary-800 dark:group-hover:text-secondary-100 transition-colors",
                    )}
                  >
                    {label}
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};

// ─── CHANNELS PANEL ─────────────────────────────────────────────────────────

interface ChannelsListingPanelProps {
  onCreateChannel: () => void;
}

const ChannelsListingPanel: React.FC<ChannelsListingPanelProps> = ({
  onCreateChannel,
}): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspaceId } = useWorkspace();

  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchChannels = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getAllChannelsRequest(selectedWorkspaceId);
      console.log("res of channels is", res);
      const data = [
        ...(res?.publicChannels || []),
        ...(res?.privateChannels || []),
      ];
      setChannels(data);
    } catch {
      Toast.error({ message: "Failed to load channels" });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const filtered = channels.filter((ch) =>
    ch.name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* Derive active channel from URL */
  const activeChannelId = (() => {
    const m = location.pathname.match(/\/workspace\/channels\/view\/(\d+)/);
    return m ? parseInt(m[1]) : null;
  })();

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="Channels" onAdd={onCreateChannel} loading={loading} />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Find channels…"
      />

      <ScrollArea className="flex-1 mt-1">
        <div className="px-2 pb-2 space-y-0.5">
          {loading && [1, 2, 3, 4].map((i) => <ItemSkeleton key={i} />)}

          {!loading &&
            filtered.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
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
                    "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left group transition-all duration-150",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-500/15 border border-primary-200 dark:border-primary-500/30"
                      : "border border-transparent hover:bg-secondary-50 dark:hover:bg-secondary-700/40 hover:border-secondary-200 dark:hover:border-secondary-600",
                  )}
                >
                  <div
                    className={clsx(
                      "mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isActive
                        ? "bg-primary-100 dark:bg-primary-500/30"
                        : "bg-secondary-100 dark:bg-secondary-700/60 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-600/60",
                    )}
                  >
                    {ch.type === "private" ? (
                      <Lock
                        className={clsx(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-secondary-400",
                        )}
                      />
                    ) : (
                      <Hash
                        className={clsx(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-secondary-400",
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={clsx(
                          typography.medium14,
                          "truncate",
                          isActive
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-secondary-700 dark:text-secondary-200 group-hover:text-secondary-800 dark:group-hover:text-secondary-100",
                        )}
                      >
                        {ch.name}
                      </span>
                    </div>
                    {ch.description && (
                      <p
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400 dark:text-secondary-500 truncate mt-0.5",
                        )}
                      >
                        {ch.description}
                      </p>
                    )}
                    {ch.member_count !== undefined && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3 text-secondary-400 dark:text-secondary-600" />
                        <span
                          className="text-secondary-400 dark:text-secondary-600"
                          style={{ fontSize: "10px" }}
                        >
                          {ch.member_count}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Hash className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500",
                )}
              >
                {search ? "No channels found" : "No channels yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ─── CHATS PANEL (Workspace Members) ────────────────────────────────────────

const ChatsListingPanel: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspaceId } = useWorkspace();
  const { user } = useContext(SessionContext);

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembersRequest(selectedWorkspaceId);
      const data = res?.data ?? [];
      setMembers(data);
    } catch {
      Toast.error({ message: "Failed to load members" });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* Exclude self from list */
  const filtered = members
    .filter((m) => m?.member?.id !== user?.id)
    .filter((m) => {
      const name =
        `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });

  /* Derive active chat from URL */
  const activeChatId = (() => {
    const m = location.pathname.match(/\/workspace\/chats\/view\/(\d+)/);
    return m ? parseInt(m[1]) : null;
  })();

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="Direct Messages" showAdd={false} loading={loading} />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Find people…"
      />

      <ScrollArea className="flex-1 mt-1">
        <div className="px-2 pb-2 space-y-0.5">
          {loading && [1, 2, 3, 4].map((i) => <ItemSkeleton key={i} />)}

          {!loading &&
            filtered.map((member, idx) => {
              const u = member.member;
              const name =
                `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
              const initials =
                `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isOnline = u?.is_active ?? false;
              const isActive = u?.id === activeChatId;

              return (
                <button
                  key={member.id}
                  onClick={() =>
                    navigate(
                      PAGE_WORKSPACE_DASHBOARD.chats.view.absolutePath.replace(
                        ":id",
                        String(u?.id),
                      ),
                    )
                  }
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left group transition-all duration-150",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-500/15 border border-primary-200 dark:border-primary-500/30"
                      : "border border-transparent hover:bg-secondary-50 dark:hover:bg-secondary-700/40 hover:border-secondary-200 dark:hover:border-secondary-600",
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className={clsx(
                        "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                        avatarColor,
                      )}
                    >
                      {initials}
                    </div>
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2",
                        isActive
                          ? "border-primary-50 dark:border-secondary-800"
                          : "border-white dark:border-secondary-800",
                        isOnline
                          ? "bg-green-400"
                          : "bg-secondary-300 dark:bg-secondary-500",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={clsx(
                        typography.medium14,
                        "truncate block",
                        isActive
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-secondary-700 dark:text-secondary-200 group-hover:text-secondary-800 dark:group-hover:text-secondary-100",
                      )}
                    >
                      {name}
                    </span>
                    <p
                      className={clsx(
                        typography.regular12,
                        "text-secondary-400 dark:text-secondary-500 mt-0.5",
                      )}
                    >
                      {isOnline ? "Active" : "Offline"}
                    </p>
                  </div>
                </button>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageCircle className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500",
                )}
              >
                {search ? "No people found" : "No team members yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ─── MEMBERS PANEL ──────────────────────────────────────────────────────────

const MembersListingPanel: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspace();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembersRequest(selectedWorkspaceId);
      setMembers(res?.data ?? []);
    } catch {
      Toast.error({ message: "Failed to load members" });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filtered = members.filter((m) => {
    const name =
      `${m.member?.first_name ?? ""} ${m.member?.last_name ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeMembers = members.filter((m) => m.member?.id);

  return (
    <div className="flex flex-col h-full">
      <PanelHeader
        title="Members"
        subtitle={`${activeMembers.length} in workspace`}
        showAdd={false}
        loading={loading}
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Find members…"
      />

      <ScrollArea className="flex-1 mt-1">
        <div className="px-2 pb-2 space-y-0.5">
          {loading && [1, 2, 3, 4].map((i) => <ItemSkeleton key={i} />)}

          {!loading &&
            filtered.map((member, idx) => {
              const u = member.member;
              const name =
                `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
              const initials =
                `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`.toUpperCase();
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isOnline = u?.is_active ?? false;

              return (
                <div
                  key={member.id}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
                    "border border-transparent",
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className={clsx(
                        "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                        avatarColor,
                      )}
                    >
                      {initials}
                    </div>
                    <span
                      className={clsx(
                        "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white dark:border-secondary-800",
                        isOnline
                          ? "bg-green-400"
                          : "bg-secondary-300 dark:bg-secondary-500",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={clsx(
                        typography.medium14,
                        "truncate block text-secondary-700 dark:text-secondary-200",
                      )}
                    >
                      {name}
                    </span>
                    <span
                      className="text-secondary-400 dark:text-secondary-500 capitalize"
                      style={{ fontSize: "10px" }}
                    >
                      {member.role?.replace("workspace_", "") ?? "member"}
                    </span>
                  </div>
                </div>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="h-8 w-8 text-secondary-300 dark:text-secondary-600 mb-2" />
              <p
                className={clsx(
                  typography.regular12,
                  "text-secondary-400 dark:text-secondary-500",
                )}
              >
                {search ? "No members found" : "No members yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Manage all members link */}
      <div className="shrink-0 px-3 py-3 border-t border-secondary-200 dark:border-secondary-700">
        <button
          onClick={() =>
            navigate(PAGE_WORKSPACE_DASHBOARD.members.absolutePath)
          }
          className={clsx(
            "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors",
            "bg-secondary-100 dark:bg-secondary-700/40 text-secondary-600 dark:text-secondary-300",
            "hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400",
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Manage All Members
        </button>
      </div>
    </div>
  );
};

// ─── ROOT ───────────────────────────────────────────────────────────────────

interface WorkspaceListingPanelProps {
  onCreateChannel?: () => void;
}

/**
 * WorkspaceListingPanel — renders the correct sub-panel based on active nav.
 * All data fetched from real APIs. Fully light/dark compatible.
 *
 * @component
 */
const WorkspaceListingPanel: React.FC<WorkspaceListingPanelProps> = ({
  onCreateChannel = () => {},
}): JSX.Element => {
  const { activeNav } = useWorkspace();

  const renderPanel = () => {
    switch (activeNav) {
      case "home":
        return <HomeListingPanel />;
      case "channels":
        return <ChannelsListingPanel onCreateChannel={onCreateChannel} />;
      case "chats":
        return <ChatsListingPanel />;
      case "members":
        return <MembersListingPanel />;
      default:
        return <HomeListingPanel />;
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col h-full overflow-hidden",
        "bg-white dark:bg-secondary-800",
      )}
    >
      {renderPanel()}
    </div>
  );
};

export default WorkspaceListingPanel;
