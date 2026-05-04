/* Imports */
import { useContext, type JSX } from "react";
import {
  Users,
  DollarSign,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import OrgDashboardPage from "@/components/page/dashboard/organization";
import { SectionHeader } from "@/components/dashboard";
import SessionContext from "@/context/SessionContext";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

interface OrgRow {
  name: string;
  plan: string;
  members: number;
  status: "Active" | "Trial" | "Suspended" | "Pending";
  revenue: string;
  joined: string;
}

// ----------------------------------------------------------------------

const stats: StatCard[] = [
  {
    title: "Total Organizations",
    value: "148",
    change: "+12%",
    changeType: "up",
    sub: "from last month",
    icon: Building2,
    iconBg: "bg-primary-100 dark:bg-primary-900/30",
    iconColor: "text-primary-500",
  },
  {
    title: "Active Users",
    value: "3,842",
    change: "+8%",
    changeType: "up",
    sub: "from last month",
    icon: Users,
    iconBg: "bg-success-100 dark:bg-success-900/20",
    iconColor: "text-success-600",
  },
  {
    title: "Monthly Revenue",
    value: "$24,560",
    change: "+18%",
    changeType: "up",
    sub: "from last month",
    icon: DollarSign,
    iconBg: "bg-information-100 dark:bg-information-900/20",
    iconColor: "text-information-500",
  },
  {
    title: "Active Plans",
    value: "12",
    change: "-2",
    changeType: "down",
    sub: "from last month",
    icon: CreditCard,
    iconBg: "bg-secondary-100 dark:bg-secondary-700",
    iconColor: "text-secondary-500",
  },
];

const planDistribution = [
  {
    name: "Enterprise",
    count: 38,
    pct: 45,
    barColor: "bg-primary-500",
    progressClass: "text-primary-500",
  },
  {
    name: "Professional",
    count: 25,
    pct: 30,
    barColor: "bg-information-500",
    progressClass: "text-information-500",
  },
  {
    name: "Starter",
    count: 17,
    pct: 20,
    barColor: "bg-success-500",
    progressClass: "text-success-600",
  },
  {
    name: "Free",
    count: 4,
    pct: 5,
    barColor: "bg-secondary-300 dark:bg-secondary-500",
    progressClass: "text-secondary-400",
  },
];

const recentOrgs: OrgRow[] = [
  {
    name: "Acme Corp",
    plan: "Enterprise",
    members: 240,
    status: "Active",
    revenue: "$2,400",
    joined: "Jan 2024",
  },
  {
    name: "TechStart IO",
    plan: "Professional",
    members: 48,
    status: "Trial",
    revenue: "$0",
    joined: "Mar 2024",
  },
  {
    name: "BlueWave Ltd",
    plan: "Starter",
    members: 12,
    status: "Active",
    revenue: "$149",
    joined: "Nov 2023",
  },
  {
    name: "NovaBuild",
    plan: "Enterprise",
    members: 185,
    status: "Active",
    revenue: "$2,400",
    joined: "Sep 2023",
  },
  {
    name: "PixelForge",
    plan: "Professional",
    members: 62,
    status: "Suspended",
    revenue: "$490",
    joined: "Feb 2024",
  },
];

const monthlyData = [40, 55, 48, 70, 62, 85, 78, 95, 88, 105, 98, 120];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const statusStyle: Record<OrgRow["status"], { dot: string; badge: string }> = {
  Active: {
    dot: "bg-success-500",
    badge:
      "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
  },
  Trial: {
    dot: "bg-information-500",
    badge:
      "bg-information-100 text-information-700 dark:bg-information-900/20 dark:text-information-400",
  },
  Suspended: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
  Pending: {
    dot: "bg-yellow-500",
    badge:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
};

// ----------------------------------------------------------------------

const ManageAnalytics = (): JSX.Element => {
  const { user } = useContext(SessionContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.first_name ?? "there";
  const maxVal = Math.max(...monthlyData);

  return (
    <OrgDashboardPage title="Dashboard">
      <div className="flex flex-col gap-6 pb-4">
        {/* Section 1 — Greeting Header */}
        <SectionHeader
          title={`${greeting}, ${firstName} 👋`}
          subtitle="Here is your platform overview for today"
        />
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
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
                    <stat.icon className={clsx("h-5 w-5", stat.iconColor)} />
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
                    <span className={clsx(typography.semibold12)}>
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

        {/* ── Revenue Chart + Plan Distribution ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue bar chart */}
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
                    Revenue Overview
                  </CardTitle>
                  <CardDescription
                    className={clsx(typography.regular12, "mt-0.5")}
                  >
                    Monthly recurring revenue — 2024
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-0 bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400 px-2.5 py-1"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className={clsx(typography.semibold12)}>
                    +18% this year
                  </span>
                </Badge>
              </div>
            </CardHeader>

            <Separator className="mb-5 mx-6 w-auto" />

            <CardContent className="px-6">
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-36">
                {monthlyData.map((val, i) => {
                  const heightPct = Math.round((val / maxVal) * 100);
                  const isCurrent = i === 10;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      <div className="w-full flex flex-col items-center">
                        {isCurrent && (
                          <span
                            className={clsx(
                              typography.semibold12,
                              "text-primary-500 mb-1",
                            )}
                          >
                            ${val}k
                          </span>
                        )}
                        <div
                          className={clsx(
                            "w-full rounded-lg transition-all duration-300",
                            isCurrent
                              ? "bg-primary-500"
                              : "bg-secondary-100 dark:bg-secondary-700 hover:bg-primary-100 dark:hover:bg-primary-900/30",
                          )}
                          style={{
                            height: `${Math.max(heightPct, 8)}px`,
                            maxHeight: "112px",
                          }}
                        />
                      </div>
                      <span
                        className={clsx(
                          typography.regular12,
                          "text-secondary-300 dark:text-secondary-600",
                        )}
                      >
                        {months[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
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
                    Plan Distribution
                  </CardTitle>
                  <CardDescription
                    className={clsx(typography.regular12, "mt-0.5")}
                  >
                    By organization count
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
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full shrink-0",
                          plan.barColor,
                        )}
                      />
                      <span
                        className={clsx(
                          typography.medium14,
                          "text-secondary-600 dark:text-secondary-300",
                        )}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400",
                        )}
                      >
                        {plan.count}
                      </span>
                      <span
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100 w-8 text-right",
                        )}
                      >
                        {plan.pct}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={plan.pct}
                    className={clsx(
                      "h-1.5 bg-secondary-100 dark:bg-secondary-700 [&>div]:",
                      plan.barColor,
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Recent Organizations Table ── */}
        <Card className="rounded-2xl border-secondary-100 dark:border-secondary-700 py-0 gap-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-secondary-100 dark:border-secondary-700 grid-rows-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle
                  className={clsx(
                    typography.semibold14,
                    "text-secondary-800 dark:text-secondary-100",
                  )}
                >
                  Recent Organizations
                </CardTitle>
                <CardDescription
                  className={clsx(typography.regular12, "mt-0.5")}
                >
                  Latest sign-ups and activity
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={clsx(
                  typography.semibold12,
                  "text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 gap-1 px-3",
                )}
                rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
              >
                View all
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-secondary-100 dark:border-b-secondary-700 hover:bg-transparent">
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-6 py-3",
                    )}
                  >
                    Organization
                  </TableHead>
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-4 py-3",
                    )}
                  >
                    Plan
                  </TableHead>
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-4 py-3",
                    )}
                  >
                    Members
                  </TableHead>
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-4 py-3",
                    )}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-4 py-3",
                    )}
                  >
                    Revenue
                  </TableHead>
                  <TableHead
                    className={clsx(
                      typography.medium12,
                      "uppercase tracking-wider text-secondary-400 dark:text-secondary-500 px-4 py-3",
                    )}
                  >
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentOrgs.map((org) => {
                  const s = statusStyle[org.status];
                  return (
                    <TableRow
                      key={org.name}
                      className="border-b-secondary-50 dark:border-b-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30 cursor-pointer"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                            <span
                              className={clsx(
                                typography.semibold12,
                                "text-primary-600 dark:text-primary-400",
                              )}
                            >
                              {org.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span
                            className={clsx(
                              typography.medium14,
                              "text-secondary-800 dark:text-secondary-100",
                            )}
                          >
                            {org.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <span
                          className={clsx(
                            typography.regular14,
                            "text-secondary-600 dark:text-secondary-300",
                          )}
                        >
                          {org.plan}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <span
                          className={clsx(
                            typography.regular14,
                            "text-secondary-600 dark:text-secondary-300",
                          )}
                        >
                          {org.members.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={clsx(
                            "border-0 flex items-center gap-1.5 w-fit px-2.5 py-1",
                            s.badge,
                          )}
                        >
                          <span
                            className={clsx(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              s.dot,
                            )}
                          />
                          <span className={clsx(typography.medium12)}>
                            {org.status}
                          </span>
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <span
                          className={clsx(
                            typography.semibold14,
                            "text-secondary-800 dark:text-secondary-100",
                          )}
                        >
                          {org.revenue}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <span
                          className={clsx(
                            typography.regular14,
                            "text-secondary-400 dark:text-secondary-500",
                          )}
                        >
                          {org.joined}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </OrgDashboardPage>
  );
};

export default ManageAnalytics;
