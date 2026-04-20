/* Imports */
import { useState, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import AdminDashboardPage from "@/components/page/dashboard/admin";
import {
  SectionHeader,
  SectionActions,
  SectionCards,
  PaginatedTable,
  type TableColumn,
  type FilterGroup,
  type SortOption,
  type SectionCard,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Toast from "@/components/toast";
import {
  getAllOrganizationsRequest,
  deleteOrganizationRequest,
  activateOrganizationRequest,
  deactivateOrganizationRequest,
} from "@/services/master-dashboard";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface Plan {
  id: number;
  name: string;
  billing_cycle: string;
  price: number;
}
interface Organization {
  id: number;
  name: string;
  display_name: string;
  domain: string | null;
  official_email: string;
  primary_owner_email: string;
  schema_name: string;
  subscription_status: string;
  is_active: boolean;
  current_users_count: number;
  plan_id: number;
  createdAt: string;
  updatedAt: string;
  plan: Plan | null;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "createdAt", label: "Date Joined" },
];
const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    label: "Subscription",
    options: [
      { value: "trial", label: "Trial" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];
const SUB_STYLE: Record<string, string> = {
  active:
    "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
  trial:
    "bg-information-100 text-information-700 dark:bg-information-900/20 dark:text-information-400",
  suspended: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  expired:
    "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
  inactive:
    "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
  cancelled:
    "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
};

// ----------------------------------------------------------------------

const ManageOrganizations = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Organization | null>(null);

  const isActiveFilter =
    activeFilters.has("active") && !activeFilters.has("inactive")
      ? "true"
      : activeFilters.has("inactive") && !activeFilters.has("active")
        ? "false"
        : undefined;

  const queryParams = {
    search: search || undefined,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    is_active: isActiveFilter,
  };
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["master-organizations", queryParams],
    queryFn: () => getAllOrganizationsRequest(queryParams),
  });

  const orgs: Organization[] = data?.data?.data ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCount = orgs.filter((o) => o.is_active).length;
  const inactiveCount = orgs.filter((o) => !o.is_active).length;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["master-organizations"] });

  const deleteMutation = useMutation({
    mutationFn: (row: Organization) =>
      deleteOrganizationRequest(String(row.id)),
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Organization removed",
      });
      invalidate();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed to delete",
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? deactivateOrganizationRequest(id)
        : activateOrganizationRequest(id),
    onSuccess: (_, v) => {
      Toast.success({
        message: "Updated",
        description: `Organization ${v.isActive ? "deactivated" : "activated"}`,
      });
      invalidate();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Action failed",
      }),
  });

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);
  const handleSortChange = useCallback((v: string) => {
    setSortBy(v);
    setPage(1);
  }, []);
  const handleFilterChange = useCallback((v: string, c: boolean) => {
    setActiveFilters((p) => {
      const n = new Set(p);
      if (c) {
        n.add(v);
      } else {
        n.delete(v);
      }
      return n;
    });
    setPage(1);
  }, []);
  const handleClearFilters = useCallback(() => {
    setActiveFilters(new Set());
    setPage(1);
  }, []);
  const handlePageSizeChange = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  const statCards: SectionCard[] = [
    {
      label: "Total Organizations",
      value: isLoading ? null : total,
      icon: Building2,
      color: "primary",
      hint: "All registered orgs",
    },
    {
      label: "Active",
      value: isLoading ? null : activeCount,
      icon: CheckCircle2,
      color: "success",
      hint: "Currently operational",
    },
    {
      label: "Inactive",
      value: isLoading ? null : inactiveCount,
      icon: XCircle,
      color: "destructive",
      hint: "Suspended or disabled",
    },
  ];

  const columns: TableColumn<Organization>[] = [
    {
      key: "name",
      label: "Organization",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              {row.display_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={clsx(
                typography.medium14,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              {row.display_name}
            </span>
            <span
              className={clsx(
                typography.regular12,
                "text-secondary-400 truncate",
              )}
            >
              {row.domain ?? row.official_email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-600 dark:text-secondary-300",
          )}
        >
          {row.plan?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "subscription",
      label: "Subscription",
      render: (row) => (
        <Badge
          variant="outline"
          className={clsx(
            "border-0 px-2.5 py-1 capitalize rounded-full",
            SUB_STYLE[row.subscription_status] ?? SUB_STYLE.inactive,
          )}
        >
          {row.subscription_status}
        </Badge>
      ),
    },
    {
      key: "users",
      label: "Users",
      align: "center",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-600 dark:text-secondary-300",
          )}
        >
          {row.current_users_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={clsx(
              "border-0 px-2.5 py-1 flex items-center gap-1.5 w-fit rounded-full",
              row.is_active
                ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
            )}
          >
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full shrink-0",
                row.is_active ? "bg-success-500" : "bg-secondary-400",
              )}
            />
            {row.is_active ? "Active" : "Inactive"}
          </Badge>
          {/* Inline toggle — separate from the 3-action cluster */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={clsx(
                  "h-6 w-6 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                  row.is_active
                    ? "text-secondary-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : "text-secondary-400 hover:text-success-500 hover:bg-success-50 dark:hover:bg-success-900/20",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMutation.mutate({
                    id: String(row.id),
                    isActive: row.is_active,
                  });
                }}
                disabled={toggleMutation.isPending}
              >
                {row.is_active ? (
                  <ToggleRight className="h-3.5 w-3.5" />
                ) : (
                  <ToggleLeft className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {row.is_active ? "Deactivate" : "Activate"}
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <AdminDashboardPage title="Organizations">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Manage Organizations"
          subtitle="View, activate and manage all registered organizations"
          addButtonLabel="Add Organization"
          onAddClick={() =>
            navigate(PAGE_MASTER_DASHBOARD.organizations.create.absolutePath)
          }
        />
        <SectionCards cards={statCards} isLoading={isLoading} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search by name or domain…"
          onSearchChange={handleSearch}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={handleSortChange}
          sortDirection={sortDir}
          onSortDirectionToggle={() =>
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
          }
          filterGroups={FILTER_GROUPS}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />
        <PaginatedTable<Organization>
          columns={columns}
          rows={orgs}
          rowKey="id"
          isLoading={isLoading}
          errorMessage={
            isError ? "Failed to load organizations. Please try again." : null
          }
          emptyTitle="No organizations found"
          emptySubtitle="Try a different search or add a new organization."
          onRowView={(row) => setViewing(row)}
          onRowEdit={(row) =>
            navigate(
              PAGE_MASTER_DASHBOARD.organizations.edit.absolutePath.replace(
                ":id",
                String(row.id),
              ),
            )
          }
          onRowDelete={(row) => deleteMutation.mutate(row)}
          deleteConfirm={{
            title: "Delete organization?",
            description:
              "All data, schemas and members for this org will be permanently removed.",
            confirmLabel: "Delete Organization",
          }}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: total,
            pageSize,
          }}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <Sheet
        open={viewing !== null}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Organization Details</SheetTitle>
            <SheetDescription>Full organization profile</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold text-base">
                    {viewing.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={clsx(
                      typography.semibold16,
                      "text-secondary-900 dark:text-white",
                    )}
                  >
                    {viewing.display_name}
                  </p>
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    {viewing.domain ?? "No domain"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Legal Name", value: viewing.name },
                  { label: "Plan", value: viewing.plan?.name ?? "—" },
                  {
                    label: "Subscription",
                    value: (
                      <Badge
                        variant="outline"
                        className={clsx(
                          "border-0 px-2.5 py-1 capitalize rounded-full",
                          SUB_STYLE[viewing.subscription_status] ??
                            SUB_STYLE.inactive,
                        )}
                      >
                        {viewing.subscription_status}
                      </Badge>
                    ),
                  },
                  {
                    label: "Users",
                    value: viewing.current_users_count.toLocaleString(),
                  },
                  { label: "Official Email", value: viewing.official_email },
                  { label: "Owner Email", value: viewing.primary_owner_email },
                  {
                    label: "Schema",
                    value: (
                      <span className="font-mono text-xs">
                        {viewing.schema_name}
                      </span>
                    ),
                  },
                  {
                    label: "Joined",
                    value: new Date(viewing.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    ),
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p
                      className={clsx(
                        typography.semibold12,
                        "text-secondary-400 uppercase tracking-wider",
                      )}
                    >
                      {item.label}
                    </p>
                    <div
                      className={clsx(
                        typography.regular14,
                        "text-secondary-700 dark:text-secondary-300 break-all",
                      )}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminDashboardPage>
  );
};

export default ManageOrganizations;
