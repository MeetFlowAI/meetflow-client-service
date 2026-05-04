/* Imports */
import { useState, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, ShieldCheck, ShieldOff } from "lucide-react";
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
  getAllRolesRequest,
  deleteRoleRequest,
} from "@/services/master-dashboard";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  createdAt: string;
  updatedAt: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "createdAt", label: "Date Created" },
];

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Type",
    options: [
      { value: "system", label: "System" },
      { value: "custom", label: "Custom" },
    ],
  },
];

// ----------------------------------------------------------------------

const ManageRoles = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  const queryParams = {
    search: search || undefined,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["master-roles", queryParams],
    queryFn: () => getAllRolesRequest(queryParams),
  });

  const roles: Role[] = data?.data?.data ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Derived card counts from current page data
  const systemCount = roles.filter((r) => r.is_system).length;
  const customCount = roles.filter((r) => !r.is_system).length;

  const deleteMutation = useMutation({
    mutationFn: (row: Role) => deleteRoleRequest(String(row.id)),
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Role removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["master-roles"] });
    },
    onError: (error: any) =>
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to delete role",
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
  const handleFilterChange = useCallback((v: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const n = new Set(prev);
      if (checked) {
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
      label: "Total Roles",
      value: isLoading ? null : total,
      icon: Activity,
      color: "primary",
      hint: "All roles in system",
    },
    {
      label: "System Roles",
      value: isLoading ? null : systemCount,
      icon: ShieldCheck,
      color: "information",
      hint: "Built-in, non-editable",
    },
    {
      label: "Custom Roles",
      value: isLoading ? null : customCount,
      icon: ShieldOff,
      color: "success",
      hint: "Created by admins",
    },
  ];

  const columns: TableColumn<Role>[] = [
    {
      key: "name",
      label: "Role Name",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-800 dark:text-secondary-100",
            )}
          >
            {row.display_name || row.name}
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
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <Badge
          variant="outline"
          className={clsx(
            "border-0 px-2.5 py-1 rounded-full",
            row.is_system
              ? "bg-information-100 text-information-700 dark:bg-information-900/20 dark:text-information-400"
              : "bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300",
          )}
        >
          {row.is_system ? "System" : "Custom"}
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
    <AdminDashboardPage title="Roles">
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        <SectionHeader
          title="Manage Roles"
          subtitle="View and manage all master roles in the system"
          addButtonLabel="Add Role"
          onAddClick={() =>
            navigate(PAGE_MASTER_DASHBOARD.roles.create.absolutePath)
          }
        />

        <SectionCards cards={statCards} isLoading={isLoading} />

        <SectionActions
          searchValue={search}
          searchPlaceholder="Search roles…"
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
          <PaginatedTable<Role>
            columns={columns}
            rows={roles}
            rowKey="id"
            isLoading={isLoading}
            errorMessage={
              isError ? "Failed to load roles. Please try again." : null
            }
            emptyTitle="No roles found"
            emptySubtitle="Try a different search or add your first role."
            onRowView={(row) => setViewingRole(row)}
            onRowEdit={(row) =>
              navigate(
                PAGE_MASTER_DASHBOARD.roles.edit.absolutePath.replace(
                  ":id",
                  String(row.id),
                ),
              )
            }
            onRowDelete={(row) => deleteMutation.mutate(row)}
            deleteConfirm={{
              title: "Delete role?",
              description: `"${viewingRole?.name ?? "This role"}" will be permanently removed. This cannot be undone.`,
              confirmLabel: "Delete Role",
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

      {/* View Detail Sheet */}
      <Sheet
        open={viewingRole !== null}
        onOpenChange={(o) => {
          if (!o) setViewingRole(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Role Details</SheetTitle>
            <SheetDescription>
              Full information about this role
            </SheetDescription>
          </SheetHeader>
          {viewingRole && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              <div className="flex flex-col gap-1">
                <p
                  className={clsx(
                    typography.semibold12,
                    "text-secondary-400 uppercase tracking-wider",
                  )}
                >
                  Role Name
                </p>
                <p
                  className={clsx(
                    typography.medium16,
                    "text-secondary-900 dark:text-white",
                  )}
                >
                  {viewingRole.name}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p
                  className={clsx(
                    typography.semibold12,
                    "text-secondary-400 uppercase tracking-wider",
                  )}
                >
                  Description
                </p>
                <p
                  className={clsx(
                    typography.regular14,
                    "text-secondary-600 dark:text-secondary-300",
                  )}
                >
                  {viewingRole.description || "No description provided."}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p
                  className={clsx(
                    typography.semibold12,
                    "text-secondary-400 uppercase tracking-wider",
                  )}
                >
                  Type
                </p>
                <Badge
                  variant="outline"
                  className={clsx(
                    "border-0 px-2.5 py-1 w-fit rounded-full",
                    viewingRole.is_system
                      ? "bg-information-100 text-information-700 dark:bg-information-900/20 dark:text-information-400"
                      : "bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300",
                  )}
                >
                  {viewingRole.is_system ? "System" : "Custom"}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <p
                    className={clsx(
                      typography.semibold12,
                      "text-secondary-400 uppercase tracking-wider",
                    )}
                  >
                    Created
                  </p>
                  <p
                    className={clsx(
                      typography.regular14,
                      "text-secondary-600 dark:text-secondary-300",
                    )}
                  >
                    {new Date(viewingRole.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p
                    className={clsx(
                      typography.semibold12,
                      "text-secondary-400 uppercase tracking-wider",
                    )}
                  >
                    Updated
                  </p>
                  <p
                    className={clsx(
                      typography.regular14,
                      "text-secondary-600 dark:text-secondary-300",
                    )}
                  >
                    {new Date(viewingRole.updatedAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminDashboardPage>
  );
};

export default ManageRoles;
