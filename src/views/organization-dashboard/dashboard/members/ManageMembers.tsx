/* Imports */
import { useState, useCallback, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Toast from "@/components/toast";
import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";
import { typography } from "@/theme/typography";
import {
  getAllOrgUsersRequest,
  deleteOrgUserRequest,
  activateOrgUserRequest,
  deactivateOrgUserRequest,
} from "@/services/organization-dashboard";

// ----------------------------------------------------------------------

interface OrgMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: { id: number; name: string; display_name: string } | null;
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
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
  {
    label: "Role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "member", label: "Member" },
    ],
  },
];

// ----------------------------------------------------------------------

const ManageMembers = (): JSX.Element => {
  const navigate = useNavigate();

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<OrgMember | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrgUsersRequest();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setMembers(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load members",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── Toggle active / inactive ───────────────────────────────────────────────
  const handleToggleActive = useCallback(
    async (row: OrgMember) => {
      try {
        if (row.is_active) {
          await deactivateOrgUserRequest(String(row.id));
          Toast.success({
            message: "Member deactivated",
            description: `${row.first_name} ${row.last_name} has been suspended.`,
          });
        } else {
          await activateOrgUserRequest(String(row.id));
          Toast.success({
            message: "Member activated",
            description: `${row.first_name} ${row.last_name} has been re-enabled.`,
          });
        }
        fetchMembers();
      } catch (err: any) {
        Toast.error({
          message: "Action failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchMembers],
  );

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (row: OrgMember) => {
      try {
        await deleteOrgUserRequest(String(row.id));
        Toast.success({
          message: "Member removed",
          description: `${row.first_name} ${row.last_name} has been removed from the organization.`,
        });
        fetchMembers();
      } catch (err: any) {
        Toast.error({
          message: "Delete failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchMembers],
  );

  // ── Client-side filter / sort / page ──────────────────────────────────────
  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);

    const matchActive =
      (!activeFilters.has("active") && !activeFilters.has("inactive")) ||
      (activeFilters.has("active") && m.is_active) ||
      (activeFilters.has("inactive") && !m.is_active);

    const matchRole =
      (!activeFilters.has("admin") && !activeFilters.has("member")) ||
      (activeFilters.has("admin") && m.role?.name.includes("admin")) ||
      (activeFilters.has("member") && m.role?.name.includes("member"));

    return matchSearch && matchActive && matchRole;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = (a as any)[sortBy] ?? "";
    const bVal = (b as any)[sortBy] ?? "";
    const cmp = String(aVal).localeCompare(String(bVal));
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
  const activeCount = members.filter((m) => m.is_active).length;
  const inactiveCount = members.filter((m) => !m.is_active).length;

  const statCards: SectionCard[] = [
    {
      label: "Total Members",
      value: members.length,
      icon: Users,
      color: "primary",
      hint: "All org members",
    },
    {
      label: "Active",
      value: activeCount,
      icon: UserCheck,
      color: "success",
      hint: "Currently enabled",
    },
    {
      label: "Inactive",
      value: inactiveCount,
      icon: UserX,
      color: "destructive",
      hint: "Suspended accounts",
    },
  ];

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: TableColumn<OrgMember>[] = [
    {
      key: "name",
      label: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-information-100 dark:bg-information-900/30 text-information-600 dark:text-information-400 text-xs font-semibold">
              {row.first_name[0]?.toUpperCase()}
              {row.last_name[0]?.toUpperCase()}
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
          {row.role?.display_name ?? "—"}
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
            "border-0 px-2.5 py-1 flex items-center gap-1.5 w-fit rounded-full cursor-pointer",
            row.is_active
              ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
              : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
          )}
          onClick={() => handleToggleActive(row)}
          title={row.is_active ? "Click to deactivate" : "Click to activate"}
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
      key: "joined",
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <OrgDashboardPage title="Members">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Members"
          subtitle="View and manage all members of your organization"
          addButtonLabel="Invite Member"
          onAddClick={() =>
            navigate(PAGE_ORGANIZATION_DASHBOARD.members.create.absolutePath)
          }
        />

        <SectionCards cards={statCards} />

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
          onRefresh={fetchMembers}
        />

        <PaginatedTable<OrgMember>
          columns={columns}
          rows={rows}
          rowKey="id"
          isLoading={loading}
          emptyTitle="No members found"
          emptySubtitle="Invite members to your organization to get started."
          onRowView={(row) => setViewing(row)}
          onRowEdit={(row) =>
            navigate(
              PAGE_ORGANIZATION_DASHBOARD.members.edit.absolutePath.replace(
                ":id",
                String(row.id),
              ),
            )
          }
          onRowDelete={handleDelete}
          deleteConfirm={{
            title: "Remove member?",
            description: "This member will lose access to the organization.",
            confirmLabel: "Remove",
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
            <SheetTitle>Member Details</SheetTitle>
            <SheetDescription>Full profile information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback className="bg-information-100 dark:bg-information-900/30 text-information-600 dark:text-information-400 font-semibold text-base">
                    {viewing.first_name[0]?.toUpperCase()}
                    {viewing.last_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={clsx(
                      typography.semibold16,
                      "text-secondary-900 dark:text-white",
                    )}
                  >
                    {viewing.first_name} {viewing.last_name}
                  </p>
                  <p
                    className={clsx(typography.regular14, "text-secondary-400")}
                  >
                    {viewing.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Role", value: viewing.role?.display_name ?? "—" },
                  {
                    label: "Status",
                    value: viewing.is_active ? "Active" : "Inactive",
                  },
                  {
                    label: "Last Login",
                    value: viewing.last_login
                      ? new Date(viewing.last_login).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )
                      : "Never",
                  },
                  {
                    label: "Joined",
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
    </OrgDashboardPage>
  );
};

export default ManageMembers;
