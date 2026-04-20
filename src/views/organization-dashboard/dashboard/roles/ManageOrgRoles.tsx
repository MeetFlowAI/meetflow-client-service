/* Imports */
import { useState, useCallback, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, ShieldOff } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import OrgDashboardPage from "@/components/page/dashboard/organization";
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
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";
import {
  getAllOrgRolesRequest,
  deleteOrgRoleRequest,
} from "@/services/organization-dashboard";

// ----------------------------------------------------------------------

interface OrgRole {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  member_count: number;
  createdAt: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "display_name", label: "Name" },
  { value: "member_count", label: "Members" },
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

const ManageOrgRoles = (): JSX.Element => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<OrgRole | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrgRolesRequest();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setRoles(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load roles",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (row: OrgRole) => {
      try {
        await deleteOrgRoleRequest(String(row.id));
        Toast.success({
          message: "Role deleted",
          description: `"${row.display_name}" has been removed.`,
        });
        fetchRoles();
      } catch (err: any) {
        Toast.error({
          message: "Delete failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchRoles],
  );

  // ── Client-side filter / sort / page ──────────────────────────────────────
  const filtered = roles.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.display_name.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q);
    const matchActive =
      activeFilters.size === 0 ||
      (activeFilters.has("active") && r.is_active) ||
      (activeFilters.has("inactive") && !r.is_active);
    return matchSearch && matchActive;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = (a as any)[sortBy] ?? "";
    const bVal = (b as any)[sortBy] ?? "";
    const cmp =
      typeof aVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);

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
      label: "Total Roles",
      value: roles.length,
      icon: Activity,
      color: "primary",
      hint: "All defined roles",
    },
    {
      label: "Active Roles",
      value: roles.filter((r) => r.is_active).length,
      icon: ShieldCheck,
      color: "success",
      hint: "Currently in use",
    },
    {
      label: "Inactive Roles",
      value: roles.filter((r) => !r.is_active).length,
      icon: ShieldOff,
      color: "destructive",
      hint: "Disabled roles",
    },
  ];

  const columns: TableColumn<OrgRole>[] = [
    {
      key: "name",
      label: "Role",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-800 dark:text-secondary-100",
            )}
          >
            {row.display_name}
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
      key: "members",
      label: "Members",
      align: "center",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-600 dark:text-secondary-300",
          )}
        >
          {row.member_count}
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
    <OrgDashboardPage title="Roles">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Roles"
          subtitle="Define and manage roles within your organization"
          addButtonLabel="Add Role"
          onAddClick={() =>
            navigate(PAGE_ORGANIZATION_DASHBOARD.roles.create.absolutePath)
          }
        />
        <SectionCards cards={statCards} />
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
          onRefresh={fetchRoles}
        />
        <PaginatedTable<OrgRole>
          columns={columns}
          rows={rows}
          rowKey="id"
          isLoading={loading}
          emptyTitle="No roles found"
          emptySubtitle="Try a different search or add a new role."
          onRowView={(row) => setViewing(row)}
          onRowEdit={(row) =>
            navigate(
              PAGE_ORGANIZATION_DASHBOARD.roles.edit.absolutePath.replace(
                ":id",
                String(row.id),
              ),
            )
          }
          onRowDelete={handleDelete}
          deleteConfirm={{
            title: "Delete role?",
            description: "Members with this role will lose their permissions.",
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

      <Sheet
        open={viewing !== null}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Role Details</SheetTitle>
            <SheetDescription>Full role information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              {[
                { label: "Display Name", value: viewing.display_name },
                {
                  label: "System Name",
                  value: (
                    <span className="font-mono text-sm">{viewing.name}</span>
                  ),
                },
                {
                  label: "Description",
                  value: viewing.description || "No description.",
                },
                { label: "Members", value: String(viewing.member_count) },
                {
                  label: "Status",
                  value: (
                    <Badge
                      variant="outline"
                      className={clsx(
                        "border-0 px-2.5 py-1 w-fit rounded-full",
                        viewing.is_active
                          ? "bg-success-100 text-success-700"
                          : "bg-secondary-100 text-secondary-500",
                      )}
                    >
                      {viewing.is_active ? "Active" : "Inactive"}
                    </Badge>
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
    </OrgDashboardPage>
  );
};

export default ManageOrgRoles;
