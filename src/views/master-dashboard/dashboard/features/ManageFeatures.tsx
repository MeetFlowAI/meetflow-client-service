/* Imports */
import { useState, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, CheckCircle2, XCircle } from "lucide-react";
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
  getAllFeaturesRequest,
  deleteFeatureRequest,
} from "@/services/master-dashboard";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface Feature {
  id: number;
  feature_key: string;
  name: string;
  description: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "feature_key", label: "Key" },
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
];

// ----------------------------------------------------------------------

const ManageFeatures = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Feature | null>(null);

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
    queryKey: ["master-features", queryParams],
    queryFn: () => getAllFeaturesRequest(queryParams),
  });

  const features: Feature[] = data?.data?.data ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCount = features.filter((f) => f.is_active).length;
  const inactiveCount = features.filter((f) => !f.is_active).length;

  const deleteMutation = useMutation({
    mutationFn: (row: Feature) => deleteFeatureRequest(String(row.id)),
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Feature removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["master-features"] });
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
      label: "Total Features",
      value: isLoading ? null : total,
      icon: Layers,
      color: "primary",
      hint: "All defined features",
    },
    {
      label: "Active",
      value: isLoading ? null : activeCount,
      icon: CheckCircle2,
      color: "success",
      hint: "Available to assign",
    },
    {
      label: "Inactive",
      value: isLoading ? null : inactiveCount,
      icon: XCircle,
      color: "destructive",
      hint: "Disabled features",
    },
  ];

  const columns: TableColumn<Feature>[] = [
    {
      key: "name",
      label: "Feature",
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
          <span
            className={clsx(
              typography.regular12,
              "text-secondary-400 dark:text-secondary-500 font-mono",
            )}
          >
            {row.feature_key}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-500 dark:text-secondary-400 truncate max-w-xs block",
          )}
        >
          {row.description || "—"}
        </span>
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
    <AdminDashboardPage title="Features">
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        <SectionHeader
          title="Manage Features"
          subtitle="Define and control feature flags available across plans"
          addButtonLabel="Add Feature"
          onAddClick={() =>
            navigate(PAGE_MASTER_DASHBOARD.features.create.absolutePath)
          }
        />
        <SectionCards cards={statCards} isLoading={isLoading} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search by name or key…"
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
          <PaginatedTable<Feature>
            columns={columns}
            rows={features}
            rowKey="id"
            isLoading={isLoading}
            errorMessage={
              isError ? "Failed to load features. Please try again." : null
            }
            emptyTitle="No features found"
            emptySubtitle="Try a different search or add a new feature."
            onRowView={(row) => setViewing(row)}
            onRowEdit={(row) =>
              navigate(
                PAGE_MASTER_DASHBOARD.features.edit.absolutePath.replace(
                  ":id",
                  String(row.id),
                ),
              )
            }
            onRowDelete={(row) => deleteMutation.mutate(row)}
            deleteConfirm={{
              title: "Delete feature?",
              description: "This feature will be removed from all plans.",
              confirmLabel: "Delete Feature",
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
            <SheetTitle>Feature Details</SheetTitle>
            <SheetDescription>Full feature information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              {[
                { label: "Name", value: viewing.name },
                {
                  label: "Feature Key",
                  value: (
                    <span className="font-mono text-sm">
                      {viewing.feature_key}
                    </span>
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
                          : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
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
                  {i < 4 && <Separator className="mt-5" />}
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminDashboardPage>
  );
};

export default ManageFeatures;
