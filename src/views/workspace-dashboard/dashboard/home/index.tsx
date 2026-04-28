/* Imports */
import { useState, useEffect, useCallback, useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Hash, MessageCircle, Users, Mic, X, Bot } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import { SectionHeader } from "@/components/dashboard";
import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllChannelsRequest } from "@/services/workspace-dashboard/channels";
import { getWorkspaceMembersRequest } from "@/services/workspace-dashboard/members";
import { typography } from "@/theme/typography";
import { PAGE_WORKSPACE_DASHBOARD } from "@/routes/paths";
import axiosConfig from "@/lib/axios";

// ----------------------------------------------------------------------

/**
 * WorkspaceHome — landing page of workspace dashboard.
 * Shows enrollment banner (if not voice-enrolled), stat cards, and quick links.
 */
const WorkspaceHome = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();

  const [channels, setChannels] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceEnrolled, setVoiceEnrolled] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  /* Greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.first_name ?? "there";

  const fetchAll = useCallback(async () => {
    if (!selectedWorkspaceId) return;
    setLoading(true);
    try {
      const [chRes, memRes] = await Promise.allSettled([
        getAllChannelsRequest(selectedWorkspaceId),
        getWorkspaceMembersRequest(selectedWorkspaceId),
      ]);
      if (chRes.status === "fulfilled") {
        setChannels([
          ...(chRes.value?.publicChannels ?? []),
          ...(chRes.value?.privateChannels ?? []),
        ]);
      }
      if (memRes.status === "fulfilled") {
        setMembers(memRes.value?.data ?? []);
      }

      // Check if current user is voice-enrolled in this workspace
      try {
        const meRes = await axiosConfig.get(
          `/workspace/${selectedWorkspaceId}/members/me`,
        );
        setVoiceEnrolled(meRes.data?.data?.voice_enrolled ?? false);
      } catch {
        setVoiceEnrolled(false);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const statCards = [
    {
      title: "Channels",
      value: channels.length,
      icon: Hash,
      iconBg: "bg-primary-100 dark:bg-primary-900/30",
      iconColor: "text-primary-500",
      onClick: () => navigate(PAGE_WORKSPACE_DASHBOARD.channels.absolutePath),
    },
    {
      title: "Team Members",
      value: members.length,
      icon: Users,
      iconBg: "bg-success-100 dark:bg-success-900/20",
      iconColor: "text-success-600",
      onClick: () => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath),
    },
    {
      title: "Direct Messages",
      value: members.length,
      icon: MessageCircle,
      iconBg: "bg-information-100 dark:bg-information-900/20",
      iconColor: "text-information-500",
      onClick: () => navigate(PAGE_WORKSPACE_DASHBOARD.chats.absolutePath),
    },
  ];

  const showEnrollmentBanner =
    !loading && voiceEnrolled === false && !bannerDismissed;

  return (
    <WorkspaceDashboardPage title="Home">
      <div className="flex flex-col gap-6 pb-4">
        <SectionHeader
          title={`${greeting}, ${firstName} 👋`}
          subtitle={
            selectedWorkspace
              ? `Welcome to ${selectedWorkspace.name}`
              : "Here is your workspace overview"
          }
        />

        {/* ── Voice Enrollment Banner ─────────────────────────────────────── */}
        {showEnrollmentBanner && (
          <div
            className={clsx(
              "flex items-start gap-4 p-4 rounded-xl",
              "border border-primary-200 dark:border-primary-800/60",
              "bg-primary-50 dark:bg-primary-900/10",
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={clsx(
                  typography.semibold14,
                  "text-primary-700 dark:text-primary-300 mb-0.5",
                )}
              >
                Set up voice recognition
              </p>
              <p
                className={clsx(
                  typography.regular14,
                  "text-primary-600 dark:text-primary-400",
                )}
              >
                Enroll your voice so the AI can identify you in meetings and
                assign action items accurately.
              </p>
              <button
                onClick={() =>
                  navigate(
                    PAGE_WORKSPACE_DASHBOARD.voiceEnrollment.absolutePath,
                  )
                }
                className={clsx(
                  "mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold",
                  "px-3 py-1.5 rounded-lg",
                  "bg-primary-500 hover:bg-primary-600 text-white transition-colors",
                )}
              >
                <Mic className="h-3 w-3" />
                Enroll Now — Takes 2 minutes
              </button>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-primary-400 hover:text-primary-600 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            : statCards.map((stat) => (
                <Card
                  key={stat.title}
                  onClick={stat.onClick}
                  className="py-5 gap-3 rounded-2xl border-secondary-100 dark:border-secondary-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <CardHeader className="px-5 pb-0 grid-rows-1 gap-0">
                    <div
                      className={clsx(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                        stat.iconBg,
                      )}
                    >
                      <stat.icon className={clsx("h-5 w-5", stat.iconColor)} />
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
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Recent Channels */}
        <Card className="rounded-2xl border-secondary-100 dark:border-secondary-700 py-5 gap-0">
          <CardHeader className="px-6 pb-4">
            <CardTitle
              className={clsx(
                typography.semibold14,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              Channels
            </CardTitle>
            <CardDescription className={clsx(typography.regular12, "mt-0.5")}>
              Recent channels in your workspace
            </CardDescription>
          </CardHeader>
          <Separator className="mb-4 mx-6 w-auto" />
          <CardContent className="px-6 flex flex-col gap-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))
            ) : channels.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-center">
                <Hash className="h-8 w-8 text-secondary-300 dark:text-secondary-600" />
                <p className={clsx(typography.regular14, "text-secondary-400")}>
                  No channels yet
                </p>
              </div>
            ) : (
              channels.slice(0, 5).map((ch) => (
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
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all w-full text-left",
                    "border-secondary-100 dark:border-secondary-700",
                    "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm",
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <Hash className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        typography.medium14,
                        "text-secondary-800 dark:text-secondary-100 truncate",
                      )}
                    >
                      #{ch.name}
                    </p>
                    {ch.description && (
                      <p
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400 truncate mt-0.5",
                        )}
                      >
                        {ch.description}
                      </p>
                    )}
                  </div>
                  {ch.member_count !== undefined && (
                    <div className="flex items-center gap-1 shrink-0 text-secondary-400">
                      <Users className="h-3.5 w-3.5" />
                      <span className={typography.regular12}>
                        {ch.member_count}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspaceDashboardPage>
  );
};

export default WorkspaceHome;
