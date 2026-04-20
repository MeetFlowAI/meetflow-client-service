/* Imports */
import { useState, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserX } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Toast from "@/components/toast";
import {
  getAllUsersRequest,
  deleteUserRequest,
} from "@/services/master-dashboard";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
  updatedAt: string;
  role: { id: number; name: string } | null;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "first_name", label: "Name" },
  { value: "email", label: "Email" },
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
];

// ----------------------------------------------------------------------

const ManageUsers = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewingUser, setViewingUser] = useState<User | null>(null);

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
    queryKey: ["master-users", queryParams],
    queryFn: () => getAllUsersRequest(queryParams),
  });

  const users: User[] = data?.data?.data ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;

  const deleteMutation = useMutation({
    mutationFn: (row: User) => deleteUserRequest(String(row.id)),
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "User removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["master-users"] });
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
      label: "Total Users",
      value: isLoading ? null : total,
      icon: Users,
      color: "primary",
      hint: "All master users",
    },
    {
      label: "Active",
      value: isLoading ? null : activeCount,
      icon: UserCheck,
      color: "success",
      hint: "Currently enabled",
    },
    {
      label: "Inactive",
      value: isLoading ? null : inactiveCount,
      icon: UserX,
      color: "destructive",
      hint: "Disabled accounts",
    },
  ];

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-information-100 dark:bg-information-900/30 text-information-600 dark:text-information-400 text-xs font-semibold">
              {row.first_name?.[0]?.toUpperCase()}
              {row.last_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={clsx(
                typography.medium14,
                "text-secondary-800 dark:text-secondary-100",
              )}
            >
              {row.first_name} {row.last_name}
            </span>
            <span
              className={clsx(
                typography.regular12,
                "text-secondary-400 truncate",
              )}
            >
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-600 dark:text-secondary-300",
          )}
        >
          {row.role?.name ?? "—"}
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
      key: "lastLogin",
      label: "Last Login",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {row.last_login
            ? new Date(row.last_login).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Never"}
        </span>
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
    <AdminDashboardPage title="Users">
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        <SectionHeader
          title="Manage Users"
          subtitle="View and manage all master users in the system"
          addButtonLabel="Add User"
          onAddClick={() =>
            navigate(PAGE_MASTER_DASHBOARD.users.create.absolutePath)
          }
        />
        <SectionCards cards={statCards} isLoading={isLoading} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search by name or email…"
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
          <PaginatedTable<User>
            columns={columns}
            rows={users}
            rowKey="id"
            isLoading={isLoading}
            errorMessage={
              isError ? "Failed to load users. Please try again." : null
            }
            emptyTitle="No users found"
            emptySubtitle="Try a different search or add a new user."
            onRowView={(row) => setViewingUser(row)}
            onRowEdit={(row) =>
              navigate(
                PAGE_MASTER_DASHBOARD.users.edit.absolutePath.replace(
                  ":id",
                  String(row.id),
                ),
              )
            }
            onRowDelete={(row) => deleteMutation.mutate(row)}
            deleteConfirm={{
              title: "Delete user?",
              description: "This user will be permanently removed.",
              confirmLabel: "Delete User",
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
        open={viewingUser !== null}
        onOpenChange={(o) => {
          if (!o) setViewingUser(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>Full profile information</SheetDescription>
          </SheetHeader>
          {viewingUser && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback className="bg-information-100 dark:bg-information-900/30 text-information-600 dark:text-information-400 font-semibold text-base">
                    {viewingUser.first_name?.[0]?.toUpperCase()}
                    {viewingUser.last_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={clsx(
                      typography.semibold16,
                      "text-secondary-900 dark:text-white",
                    )}
                  >
                    {viewingUser.first_name} {viewingUser.last_name}
                  </p>
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    {viewingUser.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Role", value: viewingUser.role?.name ?? "—" },
                  {
                    label: "Status",
                    value: viewingUser.is_active ? "Active" : "Inactive",
                  },
                  {
                    label: "Last Login",
                    value: viewingUser.last_login
                      ? new Date(viewingUser.last_login).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )
                      : "Never",
                  },
                  {
                    label: "Joined",
                    value: new Date(viewingUser.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <p
                      className={clsx(
                        typography.semibold12,
                        "text-secondary-400 uppercase tracking-wider",
                      )}
                    >
                      {item.label}
                    </p>
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-secondary-700 dark:text-secondary-300",
                      )}
                    >
                      {item.value}
                    </p>
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

export default ManageUsers;
