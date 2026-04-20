/* Imports */
import { useState, type JSX } from "react";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import OrgDashboardPage from "@/components/page/dashboard/organization";
import {
  SectionHeader,
  SectionCards,
  type SectionCard,
} from "@/components/dashboard";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Toast from "@/components/toast";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
  roles: Record<string, boolean>;
}

const ROLES = ["Super Admin", "Admin", "Member", "Viewer"];

const PERMISSIONS: Permission[] = [
  {
    key: "invite_members",
    label: "Invite Members",
    description: "Send invitations to new org members",
    category: "Members",
    roles: { "Super Admin": true, Admin: true, Member: false, Viewer: false },
  },
  {
    key: "remove_members",
    label: "Remove Members",
    description: "Remove members from the organization",
    category: "Members",
    roles: { "Super Admin": true, Admin: true, Member: false, Viewer: false },
  },
  {
    key: "manage_roles",
    label: "Manage Roles",
    description: "Create, edit and delete org roles",
    category: "Access Control",
    roles: { "Super Admin": true, Admin: false, Member: false, Viewer: false },
  },
  {
    key: "create_workspace",
    label: "Create Workspaces",
    description: "Spin up new workspaces inside the org",
    category: "Workspaces",
    roles: { "Super Admin": true, Admin: true, Member: false, Viewer: false },
  },
  {
    key: "delete_workspace",
    label: "Delete Workspaces",
    description: "Permanently delete workspaces and their data",
    category: "Workspaces",
    roles: { "Super Admin": true, Admin: false, Member: false, Viewer: false },
  },
  {
    key: "view_billing",
    label: "View Billing",
    description: "Access subscription and invoice information",
    category: "Billing",
    roles: { "Super Admin": true, Admin: true, Member: false, Viewer: false },
  },
  {
    key: "manage_billing",
    label: "Manage Billing",
    description: "Upgrade, downgrade or cancel subscription",
    category: "Billing",
    roles: { "Super Admin": true, Admin: false, Member: false, Viewer: false },
  },
  {
    key: "view_analytics",
    label: "View Analytics",
    description: "See org-level usage and activity reports",
    category: "Analytics",
    roles: { "Super Admin": true, Admin: true, Member: true, Viewer: true },
  },
];

const CATEGORIES = [...new Set(PERMISSIONS.map((p) => p.category))];

// ----------------------------------------------------------------------

const ManagePermissions = (): JSX.Element => {
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);

  const toggle = (key: string, role: string, value: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, roles: { ...p.roles, [role]: value } } : p,
      ),
    );
    Toast.success({
      message: "Updated",
      description: `${key} → ${role}: ${value ? "Enabled" : "Disabled"}`,
    });
  };

  const totalEnabled = permissions.reduce(
    (acc, p) => acc + Object.values(p.roles).filter(Boolean).length,
    0,
  );
  const totalDisabled = permissions.reduce(
    (acc, p) => acc + Object.values(p.roles).filter((v) => !v).length,
    0,
  );

  const statCards: SectionCard[] = [
    {
      label: "Total Permissions",
      value: PERMISSIONS.length,
      icon: KeyRound,
      color: "primary",
      hint: "Across all categories",
    },
    {
      label: "Enabled",
      value: totalEnabled,
      icon: CheckCircle2,
      color: "success",
      hint: "Role-permission grants",
    },
    {
      label: "Restricted",
      value: totalDisabled,
      icon: AlertCircle,
      color: "destructive",
      hint: "Access denied",
    },
  ];

  return (
    <OrgDashboardPage title="Permissions">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Permissions"
          subtitle="Control what each role can do across your organization"
        />

        <SectionCards cards={statCards} />

        {/* Permission matrix by category */}
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((category) => {
            const catPerms = permissions.filter((p) => p.category === category);
            return (
              <Card
                key={category}
                className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm"
              >
                <CardHeader className="px-6 py-4 border-b border-secondary-100 dark:border-secondary-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle
                        className={clsx(
                          typography.semibold14,
                          "text-secondary-800 dark:text-secondary-100",
                        )}
                      >
                        {category}
                      </CardTitle>
                      <CardDescription
                        className={clsx(typography.regular12, "mt-0.5")}
                      >
                        {catPerms.length} permission
                        {catPerms.length !== 1 ? "s" : ""} in this category
                      </CardDescription>
                    </div>
                    {/* Role headers */}
                    <div className="hidden md:flex items-center gap-6 mr-1">
                      {ROLES.map((role) => (
                        <span
                          key={role}
                          className={clsx(
                            typography.semibold12,
                            "text-secondary-400 dark:text-secondary-500 uppercase tracking-wider w-16 text-center",
                          )}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {catPerms.map((perm, idx) => (
                    <div key={perm.key}>
                      <div className="flex items-center justify-between px-6 py-4">
                        {/* Left — name + description */}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-6">
                          <span
                            className={clsx(
                              typography.medium14,
                              "text-secondary-800 dark:text-secondary-100",
                            )}
                          >
                            {perm.label}
                          </span>
                          <span
                            className={clsx(
                              typography.regular12,
                              "text-secondary-400 dark:text-secondary-500 truncate max-w-xs",
                            )}
                          >
                            {perm.description}
                          </span>
                        </div>

                        {/* Right — toggle per role */}
                        <div className="flex items-center gap-6">
                          {ROLES.map((role) => (
                            <div
                              key={role}
                              className="w-16 flex flex-col items-center gap-1"
                            >
                              {/* Mobile label */}
                              <span
                                className={clsx(
                                  typography.regular12,
                                  "text-secondary-400 md:hidden",
                                )}
                              >
                                {role}
                              </span>
                              <Switch
                                checked={perm.roles[role] ?? false}
                                onCheckedChange={(v) =>
                                  toggle(perm.key, role, v)
                                }
                                aria-label={`${perm.label} for ${role}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      {idx < catPerms.length - 1 && (
                        <Separator className="mx-6" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </OrgDashboardPage>
  );
};

export default ManagePermissions;
