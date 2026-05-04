/* Imports */
import { useState, useCallback, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, CheckCircle2, Users } from "lucide-react";
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
  getAllOrgWorkspacesRequest,
  deleteOrgWorkspaceRequest,
} from "@/services/organization-dashboard";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";

// ----------------------------------------------------------------------

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  channel_count: number;
  is_active: boolean;
  created_by: string | { first_name: string; last_name: string };
  createdAt: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "member_count", label: "Members" },
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

// ── Helpers ────────────────────────────────────────────────────────────────────
const getCreatedByLabel = (createdBy: Workspace["created_by"]): string => {
  if (!createdBy) return "—";
  if (typeof createdBy === "string") return createdBy;
  return `${createdBy.first_name} ${createdBy.last_name}`;
};

// ----------------------------------------------------------------------

const ManageWorkspaces = (): JSX.Element => {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Workspace | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrgWorkspacesRequest();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setWorkspaces(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load workspaces",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (row: Workspace) => {
      try {
        await deleteOrgWorkspaceRequest(String(row.id));
        Toast.success({
          message: "Workspace deleted",
          description: `"${row.name}" and all its data have been permanently removed.`,
        });
        fetchWorkspaces();
      } catch (err: any) {
        Toast.error({
          message: "Delete failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchWorkspaces],
  );

  // ── Client-side filter / sort / page ──────────────────────────────────────
  const filtered = workspaces.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.name.toLowerCase().includes(q);
    const matchActive =
      activeFilters.size === 0 ||
      (activeFilters.has("active") && w.is_active) ||
      (activeFilters.has("inactive") && !w.is_active);
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

  // ── Handlers ───────────────────────────────────────────────────────────────
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
      if (c) n.add(v);
      else n.delete(v);
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

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const totalMembers = workspaces.reduce(
    (a, w) => a + (w.member_count ?? 0),
    0,
  );

  const statCards: SectionCard[] = [
    {
      label: "Total Workspaces",
      value: workspaces.length,
      icon: LayoutGrid,
      color: "primary",
      hint: "All workspaces",
    },
    {
      label: "Active",
      value: workspaces.filter((w) => w.is_active).length,
      icon: CheckCircle2,
      color: "success",
      hint: "Currently operational",
    },
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "information",
      hint: "Across all workspaces",
    },
  ];

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: TableColumn<Workspace>[] = [
    {
      key: "name",
      label: "Workspace",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <span
              className={clsx(
                typography.semibold12,
                "text-primary-600 dark:text-primary-400",
              )}
            >
              {row.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
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
          {row.member_count ?? 0}
        </span>
      ),
    },
    {
      key: "channels",
      label: "Channels",
      align: "center",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-600 dark:text-secondary-300",
          )}
        >
          {row.channel_count ?? 0}
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <OrgDashboardPage title="Workspaces">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Workspaces"
          subtitle="Create and manage all workspaces within your organization"
          addButtonLabel="New Workspace"
          onAddClick={() => setCreateOpen(true)}
        />
        <SectionCards cards={statCards} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search workspaces…"
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
          onRefresh={fetchWorkspaces}
        />
        <PaginatedTable<Workspace>
          columns={columns}
          rows={rows}
          rowKey="id"
          isLoading={loading}
          emptyTitle="No workspaces found"
          emptySubtitle="Create your first workspace to collaborate."
          onRowView={(row) => setViewing(row)}
          onRowEdit={(row) =>
            navigate(
              PAGE_ORGANIZATION_DASHBOARD.workspaces.edit.absolutePath.replace(
                ":id",
                String(row.id),
              ),
            )
          }
          onRowDelete={handleDelete}
          deleteConfirm={{
            title: "Delete workspace?",
            description:
              "All channels, messages and data inside will be permanently removed.",
            confirmLabel: "Delete Workspace",
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

      {/* Detail sheet */}
      <Sheet
        open={viewing !== null}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Workspace Details</SheetTitle>
            <SheetDescription>Full workspace information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <span
                    className={clsx(
                      typography.semibold16,
                      "text-primary-600 dark:text-primary-400",
                    )}
                  >
                    {viewing.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p
                    className={clsx(
                      typography.semibold16,
                      "text-secondary-900 dark:text-white",
                    )}
                  >
                    {viewing.name}
                  </p>
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    {viewing.description ?? "No description."}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Members",
                    value: String(viewing.member_count ?? 0),
                  },
                  {
                    label: "Channels",
                    value: String(viewing.channel_count ?? 0),
                  },
                  {
                    label: "Created By",
                    value: getCreatedByLabel(viewing.created_by),
                  },
                  {
                    label: "Created",
                    value: new Date(viewing.createdAt).toLocaleDateString(
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

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchWorkspaces}
      />
    </OrgDashboardPage>
  );
};

export default ManageWorkspaces;
