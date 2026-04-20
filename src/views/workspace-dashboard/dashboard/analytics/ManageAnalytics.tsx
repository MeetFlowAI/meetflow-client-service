/* Imports */
import { useState, useEffect, useCallback, type JSX } from "react";
import {
  MessageCircle,
  Video,
  CheckSquare,
  Users,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Hash,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import { SectionHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getAllMeetingsRequest } from "@/services/workspace-dashboard/meetings";
import { getAllTasksRequest } from "@/services/workspace-dashboard/tasks";
import { getAllChannelsRequest } from "@/services/workspace-dashboard/channels";
import { getAllChatsRequest } from "@/services/workspace-dashboard/chats";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const BAR_COLORS = [
  "bg-primary-500",
  "bg-information-500",
  "bg-success-500",
  "bg-amber-500",
  "bg-secondary-300 dark:bg-secondary-500",
];

// ----------------------------------------------------------------------

/**
 * ManageAnalytics — workspace analytics overview using real API data.
 * Aggregates counts from meetings, tasks, channels, and chats.
 *
 * @component
 * @returns {JSX.Element}
 */
const ManageAnalytics = (): JSX.Element => {
  const { selectedWorkspaceId } = useWorkspace();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const wsId = selectedWorkspaceId ?? undefined;
      const [meetRes, taskRes, chanRes, chatRes] = await Promise.allSettled([
        getAllMeetingsRequest({ workspace_id: wsId, limit: 200 }),
        getAllTasksRequest({ workspace_id: wsId, limit: 200 }),
        wsId ? getAllChannelsRequest(wsId) : Promise.resolve(null),
        getAllChatsRequest({ workspace_id: wsId as number, limit: 200 }),
      ]);
      const safe = <T,>(r: PromiseSettledResult<any>): T[] => {
        if (r.status !== "fulfilled" || !r.value) return [];
        // getAllChannelsRequest returns { publicChannels, privateChannels }
        if (r.value?.publicChannels || r.value?.privateChannels) {
          return [
            ...(r.value.publicChannels ?? []),
            ...(r.value.privateChannels ?? []),
          ] as T[];
        }
        return Array.isArray(r.value?.data) ? r.value.data : [];
      };
      setMeetings(safe(meetRes));
      setTasks(safe(taskRes));
      setChannels(safe(chanRes));
      setChats(safe(chatRes));
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalMeetings = meetings.length;
  const liveMeetings = meetings.filter((m) => m.status === "live").length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalChannels = channels.length;
  const totalChats = chats.length;

  const taskCompletionPct =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statCards = [
    {
      title: "Total Channels",
      value: String(totalChannels),
      change: `${totalChannels} active`,
      changeType: "up" as const,
      sub: "in your workspace",
      icon: Hash,
      iconBg: "bg-primary-100 dark:bg-primary-900/30",
      iconColor: "text-primary-500",
    },
    {
      title: "Direct Messages",
      value: String(totalChats),
      change: `${totalChats} threads`,
      changeType: "up" as const,
      sub: "conversations",
      icon: MessageCircle,
      iconBg: "bg-information-100 dark:bg-information-900/20",
      iconColor: "text-information-500",
    },
    {
      title: "Meetings",
      value: String(totalMeetings),
      change: liveMeetings > 0 ? `${liveMeetings} live` : "none live",
      changeType: liveMeetings > 0 ? ("up" as const) : ("down" as const),
      sub: "scheduled & past",
      icon: Video,
      iconBg: "bg-success-100 dark:bg-success-900/20",
      iconColor: "text-success-600",
    },
    {
      title: "Tasks Done",
      value: String(doneTasks),
      change: `${taskCompletionPct}% done`,
      changeType: taskCompletionPct >= 50 ? ("up" as const) : ("down" as const),
      sub: `of ${totalTasks} total`,
      icon: CheckSquare,
      iconBg: "bg-secondary-100 dark:bg-secondary-700",
      iconColor: "text-secondary-500",
    },
  ];

  // Top channels by member_count (fallback: by order)
  const topChannels = [...channels]
    .sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0))
    .slice(0, 5);
  const maxMembers = topChannels[0]?.member_count ?? 1;

  // Task breakdown bars (status distribution)
  const taskBreakdown = [
    {
      label: "To Do",
      count: tasks.filter((t) => t.status === "todo" || !t.status).length,
      color: "bg-primary-500",
    },
    {
      label: "In Progress",
      count: tasks.filter((t) => t.status === "in-progress").length,
      color: "bg-amber-500",
    },
    {
      label: "Done",
      count: doneTasks,
      color: "bg-success-500",
    },
  ];

  /* Output */
  return (
    <WorkspaceDashboardPage title="Analytics">
      <div className="flex flex-col gap-6 pb-4">
        {/* Header */}
        <SectionHeader
          title="Workspace Analytics"
          subtitle="Insights and activity overview for your workspace"
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))
            : statCards.map((stat) => (
                <Card
                  key={stat.title}
                  className="py-5 gap-3 rounded-2xl border-secondary-100 dark:border-secondary-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="px-5 pb-0 grid-rows-1 gap-0">
                    <div className="flex items-start justify-between">
                      <div
                        className={clsx(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                          stat.iconBg,
                        )}
                      >
                        <stat.icon
                          className={clsx("h-5 w-5", stat.iconColor)}
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className={clsx(
                          "flex items-center gap-1 border-0 px-2 py-1",
                          stat.changeType === "up"
                            ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                        )}
                      >
                        {stat.changeType === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className={typography.semibold12}>
                          {stat.change}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pt-3">
                    <p
                      className={clsx(
                        typography.semibold24,
                        "text-secondary-900 dark:text-secondary-50 tracking-tight",
                      )}
                    >
                      {stat.value}
                    </p>
                    <p
                      className={clsx(
                        typography.medium14,
                        "text-secondary-500 dark:text-secondary-400 mt-1",
                      )}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={clsx(
                        typography.regular12,
                        "text-secondary-300 dark:text-secondary-600 mt-0.5",
                      )}
                    >
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Task Completion */}
          <Card className="xl:col-span-2 rounded-2xl border-secondary-100 dark:border-secondary-700 py-5 gap-0">
            <CardHeader className="px-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle
                    className={clsx(
                      typography.semibold14,
                      "text-secondary-800 dark:text-secondary-100",
                    )}
                  >
                    Task Status Breakdown
                  </CardTitle>
                  <CardDescription
                    className={clsx(typography.regular12, "mt-0.5")}
                  >
                    Distribution of tasks across statuses
                  </CardDescription>
                </div>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-secondary-400" />
                ) : (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-0 bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400 px-2.5 py-1"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className={typography.semibold12}>
                      {taskCompletionPct}% complete
                    </span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <Separator className="mb-5 mx-6 w-auto" />
            <CardContent className="px-6 flex flex-col gap-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : totalTasks === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <CheckSquare className="h-10 w-10 text-secondary-300 dark:text-secondary-600" />
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    No tasks yet
                  </p>
                </div>
              ) : (
                taskBreakdown.map((item) => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "h-2.5 w-2.5 rounded-full shrink-0",
                            item.color,
                          )}
                        />
                        <span
                          className={clsx(
                            typography.medium14,
                            "text-secondary-600 dark:text-secondary-300",
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            typography.regular12,
                            "text-secondary-400",
                          )}
                        >
                          {item.count} tasks
                        </span>
                        <span
                          className={clsx(
                            typography.semibold14,
                            "text-secondary-800 dark:text-secondary-100 w-10 text-right",
                          )}
                        >
                          {totalTasks > 0
                            ? Math.round((item.count / totalTasks) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0
                          ? Math.round((item.count / totalTasks) * 100)
                          : 0
                      }
                      className={clsx(
                        "h-2 bg-secondary-100 dark:bg-secondary-700 [&>div]:",
                        item.color,
                      )}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Channels by Members */}
          <Card className="rounded-2xl border-secondary-100 dark:border-secondary-700 py-5 gap-0">
            <CardHeader className="px-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle
                    className={clsx(
                      typography.semibold14,
                      "text-secondary-800 dark:text-secondary-100",
                    )}
                  >
                    Top Channels
                  </CardTitle>
                  <CardDescription
                    className={clsx(typography.regular12, "mt-0.5")}
                  >
                    By member count
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-secondary-300 dark:text-secondary-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <Separator className="mb-5 mx-6 w-auto" />
            <CardContent className="px-6 flex flex-col gap-4">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))
              ) : topChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <Hash className="h-8 w-8 text-secondary-300 dark:text-secondary-600" />
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    No channels yet
                  </p>
                </div>
              ) : (
                topChannels.map((ch, i) => {
                  const pct = Math.max(
                    5,
                    Math.round(((ch.member_count ?? 0) / maxMembers) * 100),
                  );
                  return (
                    <div key={ch.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "h-2 w-2 rounded-full shrink-0",
                              BAR_COLORS[i % BAR_COLORS.length],
                            )}
                          />
                          <span
                            className={clsx(
                              typography.medium14,
                              "text-secondary-600 dark:text-secondary-300",
                            )}
                          >
                            #{ch.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400",
                            )}
                          >
                            {ch.member_count ?? 0}
                          </span>
                          <Users className="h-3 w-3 text-secondary-300 dark:text-secondary-600" />
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        className={clsx(
                          "h-1.5 bg-secondary-100 dark:bg-secondary-700 [&>div]:",
                          BAR_COLORS[i % BAR_COLORS.length],
                        )}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkspaceDashboardPage>
  );
};

export default ManageAnalytics;
