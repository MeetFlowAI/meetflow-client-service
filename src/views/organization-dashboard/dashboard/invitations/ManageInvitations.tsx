/* Imports */
import { useState, useCallback, useEffect, type JSX } from "react";
import { MailOpen, Clock, CheckCircle2 } from "lucide-react";
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
import { typography } from "@/theme/typography";
import {
  getAllOrgInvitationsRequest,
  cancelOrgInvitationRequest,
  resendOrgInvitationRequest,
} from "@/services/organization-dashboard";

// ----------------------------------------------------------------------

interface Invitation {
  id: number;
  email: string;
  role: { id: number; name: string; display_name: string } | string;
  status: "pending" | "accepted" | "declined" | "expired";
  invited_by: string | { first_name: string; last_name: string };
  invited_at: string;
  createdAt?: string;
  expires_at: string;
}

const STATUS_STYLE: Record<Invitation["status"], string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  accepted:
    "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
  declined: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  expired:
    "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400",
};

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "accepted", label: "Accepted" },
      { value: "declined", label: "Declined" },
      { value: "expired", label: "Expired" },
    ],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "email", label: "Email" },
  { value: "invited_at", label: "Date Invited" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const getRoleLabel = (role: Invitation["role"]): string => {
  if (!role) return "—";
  if (typeof role === "string") return role;
  return role.display_name ?? role.name ?? "—";
};

const getInvitedByLabel = (invitedBy: Invitation["invited_by"]): string => {
  if (!invitedBy) return "—";
  if (typeof invitedBy === "string") return invitedBy;
  return `${invitedBy.first_name} ${invitedBy.last_name}`;
};

// ----------------------------------------------------------------------

const ManageInvitations = (): JSX.Element => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Invitation | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrgInvitationsRequest();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.rows ?? []);
      setInvitations(data);
    } catch (err: any) {
      Toast.error({
        message: "Failed to load invitations",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = useCallback(
    async (row: Invitation) => {
      try {
        await resendOrgInvitationRequest(String(row.id));
        Toast.success({
          message: "Invitation resent",
          description: `A new invitation email has been sent to ${row.email}.`,
        });
        fetchInvitations();
      } catch (err: any) {
        Toast.error({
          message: "Resend failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchInvitations],
  );

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(
    async (row: Invitation) => {
      try {
        await cancelOrgInvitationRequest(String(row.id));
        Toast.success({
          message: "Invitation cancelled",
          description: `The invitation to ${row.email} has been revoked.`,
        });
        fetchInvitations();
      } catch (err: any) {
        Toast.error({
          message: "Cancel failed",
          description: err?.message ?? "Please try again.",
        });
      }
    },
    [fetchInvitations],
  );

  // ── Client-side filter / sort / page ──────────────────────────────────────
  const filtered = invitations.filter((i) => {
    const q = search.toLowerCase();
    const invitedByLabel = getInvitedByLabel(i.invited_by).toLowerCase();
    const matchSearch =
      !q || i.email.toLowerCase().includes(q) || invitedByLabel.includes(q);
    const matchStatus = activeFilters.size === 0 || activeFilters.has(i.status);
    return matchSearch && matchStatus;
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

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statCards: SectionCard[] = [
    {
      label: "Total Invitations",
      value: invitations.length,
      icon: MailOpen,
      color: "primary",
      hint: "All time",
    },
    {
      label: "Pending",
      value: invitations.filter((i) => i.status === "pending").length,
      icon: Clock,
      color: "warning",
      hint: "Awaiting response",
    },
    {
      label: "Accepted",
      value: invitations.filter((i) => i.status === "accepted").length,
      icon: CheckCircle2,
      color: "success",
      hint: "Joined the org",
    },
  ];

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: TableColumn<Invitation>[] = [
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={clsx(
              typography.medium14,
              "text-secondary-800 dark:text-secondary-100",
            )}
          >
            {row.email}
          </span>
          <span className={clsx(typography.regular12, "text-secondary-400")}>
            Invited by {getInvitedByLabel(row.invited_by)}
          </span>
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
          {getRoleLabel(row.role)}
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
            "border-0 px-2.5 py-1 capitalize rounded-full",
            STATUS_STYLE[row.status],
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "invited_at",
      label: "Invited",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {new Date(row.invited_at ?? row.createdAt ?? "").toLocaleDateString(
            "en-IN",
            { day: "2-digit", month: "short", year: "numeric" },
          )}
        </span>
      ),
    },
    {
      key: "expires_at",
      label: "Expires",
      render: (row) => (
        <span
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-500",
          )}
        >
          {row.expires_at
            ? new Date(row.expires_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <OrgDashboardPage title="Invitations">
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Invitations"
          subtitle="Track and manage all pending and past member invitations"
          addButtonLabel="Send Invitation"
          onAddClick={() =>
            Toast.info({
              message: "Coming soon",
              description: "Send invitation form will be available shortly.",
            })
          }
        />
        <SectionCards cards={statCards} />
        <SectionActions
          searchValue={search}
          searchPlaceholder="Search by email or inviter…"
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
          onRefresh={fetchInvitations}
        />
        <PaginatedTable<Invitation>
          columns={columns}
          rows={rows}
          rowKey="id"
          isLoading={loading}
          emptyTitle="No invitations found"
          emptySubtitle="Send your first invitation to onboard team members."
          onRowView={(row) => setViewing(row)}
          onRowEdit={(row) => {
            if (row.status === "pending") {
              handleResend(row);
            } else {
              Toast.info({
                message: "Cannot resend",
                description: "Only pending invitations can be resent.",
              });
            }
          }}
          onRowDelete={handleCancel}
          deleteConfirm={{
            title: "Revoke invitation?",
            description: "The invitation link will be invalidated.",
            confirmLabel: "Revoke",
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
            <SheetTitle>Invitation Details</SheetTitle>
            <SheetDescription>Full invitation information</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex flex-col gap-5 mt-6 px-4">
              {[
                { label: "Email", value: viewing.email },
                { label: "Role", value: getRoleLabel(viewing.role) },
                {
                  label: "Status",
                  value: (
                    <Badge
                      variant="outline"
                      className={clsx(
                        "border-0 px-2.5 py-1 capitalize rounded-full",
                        STATUS_STYLE[viewing.status],
                      )}
                    >
                      {viewing.status}
                    </Badge>
                  ),
                },
                {
                  label: "Invited By",
                  value: getInvitedByLabel(viewing.invited_by),
                },
                {
                  label: "Invited On",
                  value: new Date(
                    viewing.invited_at ?? viewing.createdAt ?? "",
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }),
                },
                {
                  label: "Expires On",
                  value: viewing.expires_at
                    ? new Date(viewing.expires_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
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
    </OrgDashboardPage>
  );
};

export default ManageInvitations;
