/* Imports */
import { useState, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, ToggleLeft } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Toast from "@/components/toast";
import {
  getAllPlansRequest,
  deletePlanRequest,
} from "@/services/master-dashboard";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: "monthly" | "yearly" | "lifetime";
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "createdAt", label: "Date Created" },
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
    label: "Billing",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" },
      { value: "lifetime", label: "Lifetime" },
    ],
  },
];
const BILLING_STYLE: Record<string, string> = {
  monthly:
    "bg-information-100 text-information-700 dark:bg-information-900/20 dark:text-information-400",
  yearly:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
  lifetime:
    "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
};

// ----------------------------------------------------------------------

const ManagePlans = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Plan | null>(null);

  const isActiveFilter =
    activeFilters.has("active") && !activeFilters.has("inactive")
      ? "true"
      : activeFilters.has("inactive") && !activeFilters.has("active")
        ? "false"
        : undefined;
  const billingFilter = ["monthly", "yearly", "lifetime"].find((v) =>
    activeFilters.has(v),
  );

  const queryParams = {
    search: search || undefined,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    is_active: isActiveFilter,
    billing_cycle: billingFilter,
  };
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["master-plans", queryParams],
    queryFn: () => getAllPlansRequest(queryParams),
  });

  const plans: Plan[] = data?.data?.data ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCount = plans.filter((p) => p.is_active).length;
  const avgPrice = plans.length
    ? plans.reduce((s, p) => s + Number(p.price), 0) / plans.length
    : 0;

  const deleteMutation = useMutation({
    mutationFn: (row: Plan) => deletePlanRequest(String(row.id)),
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Plan removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["master-plans"] });
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed to delete",
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
      label: "Total Plans",
      value: isLoading ? null : total,
      icon: CreditCard,
      color: "primary",
      hint: "All subscription tiers",
    },
    {
      label: "Active Plans",
      value: isLoading ? null : activeCount,
      icon: ToggleLeft,
      color: "success",
      hint: "Currently available",
    },
    {
      label: "Avg. Price",
      value: isLoading
        ? null
        : avgPrice === 0
          ? "Free"
          : `$${avgPrice.toFixed(2)}`,
      icon: DollarSign,
      color: "information",
      hint: "Across all plans",
    },
  ];

  const columns: TableColumn<Plan>[] = [
    {
      key: "name",
      label: "Plan",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-800 dark:text-secondary-100",
            )}
          >
            {row.name}
          </span>
          {row.description && (
            <span
              className={clsx(
                typography.regular12,
                "text-secondary-400 truncate max-w-xs",
              )}
            >
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => (
        <span
          className={clsx(
            typography.semibold14,
            "text-secondary-800 dark:text-secondary-100",
          )}
        >
          {Number(row.price) === 0
            ? "Free"
            : `₹${Number(row.price).toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "billing",
      label: "Billing",
      render: (row) => (
        <Badge
          variant="outline"
          className={clsx(
            "border-0 px-2.5 py-1 capitalize rounded-full",
            BILLING_STYLE[row.billing_cycle],
          )}
        >
          {row.billing_cycle}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
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
      ),
    },
    {
      key: "createdAt",
      label: "Created",
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
    <AdminDashboardPage title="Plans">
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        <SectionHeader
          title="Manage Plans"
          subtitle="Configure subscription plans and their pricing tiers"
          addButtonLabel="Add Plan"
          onAddClick={() =>
            navigate(PAGE_MASTER_DASHBOARD.plans.create.absolutePath)
          }
        />
        <SectionCards cards={statCards} isLoading={isLoading} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search for a plan…"
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
        <div className="flex flex-col gap-4 min-h-0 flex-1 overflow-hidden">
          <PaginatedTable<Plan>
            columns={columns}
            rows={plans}
            rowKey="id"
            isLoading={isLoading}
            errorMessage={
              isError ? "Failed to load plans. Please try again." : null
            }
            emptyTitle="No plans found"
            emptySubtitle="Try a different search or add a new plan."
            onRowView={(row) => setViewing(row)}
            onRowEdit={(row) =>
              navigate(
                PAGE_MASTER_DASHBOARD.plans.edit.absolutePath.replace(
                  ":id",
                  String(row.id),
                ),
              )
            }
            onRowDelete={(row) => deleteMutation.mutate(row)}
            deleteConfirm={{
              title: "Delete plan?",
              description: "Organizations on this plan will lose access.",
              confirmLabel: "Delete Plan",
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
      </div>

      <Sheet
        open={viewing !== null}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Plan Details</SheetTitle>
            <SheetDescription>Full plan information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              {[
                { label: "Plan Name", value: viewing.name },
                {
                  label: "Price",
                  value:
                    Number(viewing.price) === 0
                      ? "Free"
                      : `$${Number(viewing.price).toFixed(2)}`,
                },
                {
                  label: "Billing Cycle",
                  value: (
                    <Badge
                      variant="outline"
                      className={clsx(
                        "border-0 px-2.5 py-1 capitalize rounded-full",
                        BILLING_STYLE[viewing.billing_cycle],
                      )}
                    >
                      {viewing.billing_cycle}
                    </Badge>
                  ),
                },
                {
                  label: "Description",
                  value: viewing.description || "No description.",
                },
                {
                  label: "Status",
                  value: (
                    <Badge
                      variant="outline"
                      className={clsx(
                        "border-0 px-2.5 py-1 w-fit rounded-full",
                        viewing.is_active
                          ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                          : "bg-secondary-100 text-secondary-500",
                      )}
                    >
                      {viewing.is_active ? "Active" : "Inactive"}
                    </Badge>
                  ),
                },
                {
                  label: "Created",
                  value: new Date(viewing.createdAt).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "long", year: "numeric" },
                  ),
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex flex-col gap-1">
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
                        "text-secondary-700 dark:text-secondary-300",
                      )}
                    >
                      {item.value}
                    </div>
                  </div>
                  {i < 5 && <Separator className="mt-5" />}
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminDashboardPage>
  );
};

export default ManagePlans;
