/* Imports */
import { useContext, type JSX } from "react";
import { User, Mail, Shield, Calendar } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import WorkspaceDashboardPage from "@/components/page/dashboard/workspace";
import { SectionHeader } from "@/components/dashboard";
import SessionContext from "@/context/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

/**
 * My Profile page for the Workspace Dashboard.
 * Displays authenticated user's profile information.
 *
 * @component
 * @returns {JSX.Element}
 */
const MyProfile = (): JSX.Element => {
  /* Hooks */
  const { user } = useContext(SessionContext);

  /* Constants */
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";

  /* Output */
  return (
    <WorkspaceDashboardPage title="My Profile">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="My Profile"
          subtitle="View and manage your account details"
        />

        {/* Profile Card */}
        <Card className="rounded-2xl border-secondary-100 dark:border-secondary-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className={clsx(typography.semibold20, "text-secondary-900 dark:text-white")}>
                  {fullName}
                </h2>
                <p className={clsx(typography.regular14, "text-secondary-400 mt-1")}>
                  {user?.email}
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 border-0 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                >
                  {user?.role?.display_name ?? "Member"}
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: fullName, icon: User },
                { label: "Email Address", value: user?.email ?? "—", icon: Mail },
                { label: "Role", value: user?.role?.display_name ?? "—", icon: Shield },
                { label: "Account Status", value: user?.is_active ? "Active" : "Inactive", icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-secondary-500" />
                  </div>
                  <div>
                    <p className={clsx(typography.medium12, "text-secondary-400 uppercase tracking-wider")}>
                      {label}
                    </p>
                    <p className={clsx(typography.medium14, "text-secondary-800 dark:text-secondary-100 mt-0.5")}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceDashboardPage>
  );
};

export default MyProfile;
