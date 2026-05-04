/* Imports */
import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Puzzle,
  Gauge,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
  Hash,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import AdminDashboardPage from "@/components/page/dashboard/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ButtonLoader from "@/components/loader/InlineLoader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Toast from "@/components/toast";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { usePlan } from "@/hooks/dashboard/master-dashboard/use-plan";
import {
  getAllFeaturesRequest,
  getPlanFeaturesRequest,
  assignFeatureToPlanRequest,
  togglePlanFeatureRequest,
  removeFeatureFromPlanRequest,
  getPlanLimitsRequest,
  addLimitToPlanRequest,
  updatePlanLimitRequest,
  deletePlanLimitRequest,
} from "@/services/master-dashboard";
import {
  PlanFormSchema,
  type PlanFormValues,
} from "@/models/master-dashboard/plan";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

type TabId = "details" | "features" | "limits";

const TABS: {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
  activeBg: string;
  activeText: string;
}[] = [
  {
    id: "details",
    label: "Details",
    icon: LayoutDashboard,
    color: "information",
    activeBg: "bg-information-500",
    activeText: "text-information-600 dark:text-information-400",
  },
  {
    id: "features",
    label: "Features",
    icon: Puzzle,
    color: "violet",
    activeBg: "bg-violet-500",
    activeText: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "limits",
    label: "Limits",
    icon: Gauge,
    color: "amber",
    activeBg: "bg-amber-500",
    activeText: "text-amber-600 dark:text-amber-400",
  },
];

const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "lifetime", label: "Lifetime" },
] as const;

interface PlanFeature {
  id: number;
  feature_id: number;
  feature_key: string;
  name: string;
  is_active: boolean;
}

interface AllFeature {
  id: number;
  feature_key: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface PlanLimit {
  id: number;
  limit_key: string;
  limit_value: number;
}

// ----------------------------------------------------------------------

const EditPlan = (): JSX.Element => {
  const managePlansPath = PAGE_MASTER_DASHBOARD.plans.absolutePath;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("details");

  // Limits local state for inline editing
  const [editingLimitId, setEditingLimitId] = useState<number | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<string>("");
  const [newLimitKey, setNewLimitKey] = useState("");
  const [newLimitValue, setNewLimitValue] = useState("");
  const [showAddLimit, setShowAddLimit] = useState(false);

  const { getPlanByIdMutation, updatePlanMutation } = usePlan();

  // ── Features queries ──
  const { data: allFeaturesData, isLoading: isAllFeaturesLoading } = useQuery({
    queryKey: ["master-features-all"],
    queryFn: () => getAllFeaturesRequest({ limit: 200 }),
    enabled: activeTab === "features",
  });
  const allFeatures: AllFeature[] = allFeaturesData?.data?.data ?? [];

  const {
    data: planFeaturesData,
    isLoading: isPlanFeaturesLoading,
    refetch: refetchPlanFeatures,
  } = useQuery({
    queryKey: ["plan-features", id],
    queryFn: () => getPlanFeaturesRequest(id!),
    enabled: !!id && activeTab === "features",
  });
  const planFeatures: PlanFeature[] = planFeaturesData?.data?.data ?? [];
  console.log("planFeatures", planFeatures);
  const assignedFeatureIds = new Set(planFeatures.map((pf) => pf.feature_id));

  // ── Limits query ──
  const {
    data: planLimitsData,
    isLoading: isPlanLimitsLoading,
    refetch: refetchPlanLimits,
  } = useQuery({
    queryKey: ["plan-limits", id],
    queryFn: () => getPlanLimitsRequest(id!),
    enabled: !!id && activeTab === "limits",
  });
  const planLimits: PlanLimit[] = planLimitsData?.data?.data ?? [];

  // ── Mutations: Features ──
  const assignFeatureMutation = useMutation({
    mutationFn: (featureId: number) =>
      assignFeatureToPlanRequest(id!, {
        feature_id: featureId,
        is_active: true,
      }),
    onSuccess: () => {
      Toast.success({
        message: "Feature Assigned",
        description: "Feature added to plan",
      });
      refetchPlanFeatures();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  const removeFeatureMutation = useMutation({
    mutationFn: (featureId: string) =>
      removeFeatureFromPlanRequest(id!, featureId),
    onSuccess: () => {
      Toast.success({
        message: "Feature Removed",
        description: "Feature removed from plan",
      });
      refetchPlanFeatures();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({
      planFeatureId,
      isActive,
    }: {
      planFeatureId: string;
      isActive: boolean;
    }) => togglePlanFeatureRequest(id!, planFeatureId, { is_active: isActive }),
    onSuccess: () => refetchPlanFeatures(),
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  // ── Mutations: Limits ──
  const addLimitMutation = useMutation({
    mutationFn: () =>
      addLimitToPlanRequest(id!, {
        limit_key: newLimitKey.trim(),
        limit_value: Number(newLimitValue),
      }),
    onSuccess: () => {
      Toast.success({
        message: "Limit Added",
        description: `${newLimitKey} limit set`,
      });
      setNewLimitKey("");
      setNewLimitValue("");
      setShowAddLimit(false);
      refetchPlanLimits();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  const updateLimitMutation = useMutation({
    mutationFn: ({ limitId }: { limitId: number }) =>
      updatePlanLimitRequest(id!, String(limitId), {
        limit_value: Number(editingLimitValue),
      }),
    onSuccess: () => {
      Toast.success({
        message: "Limit Updated",
        description: "Limit value saved",
      });
      setEditingLimitId(null);
      refetchPlanLimits();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  const deleteLimitMutation = useMutation({
    mutationFn: (limitId: number) =>
      deletePlanLimitRequest(id!, String(limitId)),
    onSuccess: () => {
      Toast.success({
        message: "Limit Removed",
        description: "Limit deleted from plan",
      });
      refetchPlanLimits();
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed",
      }),
  });

  // ── Form ──
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(PlanFormSchema),
    defaultValues: {
      txtName: "",
      txtDescription: "",
      numPrice: "",
      selBillingCycle: "monthly",
      chkIsActive: true,
    },
  });

  const getPlanById = async (): Promise<void> => {
    if (!id) return;
    const response = await getPlanByIdMutation.mutateAsync(id);
    const plan = response?.data;
    if (!plan) return;
    form.reset({
      txtName: plan.name ?? "",
      txtDescription: plan.description ?? "",
      numPrice: String(plan.price),
      selBillingCycle: plan.billing_cycle ?? "monthly",
      chkIsActive: plan.is_active ?? true,
    });
  };

  const handleDetailsSubmit = async (values: PlanFormValues): Promise<void> => {
    await updatePlanMutation.mutateAsync({
      id: id!,
      reqData: {
        name: values.txtName,
        description: values.txtDescription || undefined,
        price: Number(values.numPrice),
        billing_cycle: values.selBillingCycle,
        is_active: values.chkIsActive,
      },
    });
    navigate(managePlansPath);
  };

  const handleToggleFeature = (feature: AllFeature): void => {
    if (assignedFeatureIds.has(feature.id)) {
      const pf = planFeatures.find((p) => p.feature_id === feature.id);
      if (pf) removeFeatureMutation.mutate(String(pf.id));
    } else {
      assignFeatureMutation.mutate(feature.id);
    }
  };

  const handleToggleFeatureActive = (pf: PlanFeature): void => {
    toggleFeatureMutation.mutate({
      planFeatureId: String(pf.id),
      isActive: !pf.is_active,
    });
  };

  useEffect(() => {
    if (id) getPlanById();
  }, [id]);

  const isLoading = getPlanByIdMutation.isPending;
  const isPending = updatePlanMutation.isPending;

  if (!id) return <></>;

  return (
    <AdminDashboardPage title="Edit Plan">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading plan…" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ── Back ── */}
          <button
            type="button"
            onClick={() => navigate(managePlansPath)}
            className={clsx(
              "flex items-center gap-2 w-fit",
              typography.medium14,
              "text-secondary-400 dark:text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </button>

          {/* ── Beautiful 3-tab pill bar ── */}
          <div className="relative flex gap-1 p-1 rounded-2xl bg-secondary-100 dark:bg-secondary-700/50 w-fit">
            {/* sliding pill */}
            <div
              className={clsx(
                "absolute top-1 bottom-1 rounded-xl shadow-sm transition-all duration-300 ease-out",
                activeTab === "details"
                  ? "bg-white dark:bg-secondary-800"
                  : activeTab === "features"
                    ? "bg-white dark:bg-secondary-800"
                    : "bg-white dark:bg-secondary-800",
              )}
              style={{
                width: `calc(33.333% - 3px)`,
                left:
                  activeTab === "details"
                    ? "4px"
                    : activeTab === "features"
                      ? "calc(33.333% + 2px)"
                      : "calc(66.666% + 0px)",
              }}
            />
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200 min-w-[110px] justify-center",
                    typography.medium14,
                    isActive
                      ? "text-secondary-900 dark:text-white"
                      : "text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300",
                  )}
                >
                  <Icon
                    className={clsx("h-4 w-4", isActive && tab.activeText)}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════
              TAB: DETAILS
          ══════════════════════════════════════════ */}
          {activeTab === "details" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleDetailsSubmit)}
                className="w-full flex flex-col gap-6"
              >
                <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                    <div className="h-10 w-10 rounded-xl bg-information-100 dark:bg-information-900/30 flex items-center justify-center text-information-600 dark:text-information-400">
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={clsx(
                          typography.semibold16,
                          "text-secondary-900 dark:text-white",
                        )}
                      >
                        Plan Details
                      </p>
                      <p
                        className={clsx(
                          typography.regular14,
                          "text-secondary-400 dark:text-secondary-500",
                        )}
                      >
                        Update pricing, billing cycle and status
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 py-6">
                    <FormField
                      control={form.control}
                      name="txtName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Plan Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Professional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Price (₹) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Set to 0 for a free plan.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="selBillingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Billing Cycle{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[38px] rounded-[10px] border-2 border-secondary-100 dark:border-secondary-400">
                                <SelectValue placeholder="Select billing cycle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BILLING_CYCLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="txtDescription"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Briefly describe what this plan includes…"
                              rows={3}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chkIsActive"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-xl border-2 border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 px-5 py-4 cursor-pointer">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base cursor-pointer">
                              Active Status
                            </FormLabel>
                            <FormDescription>
                              {field.value
                                ? "Plan is active and available for organisations to subscribe."
                                : "Plan is inactive and hidden from subscription selection."}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="cursor-pointer"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-700/20">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => navigate(managePlansPath)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <ButtonLoader />
                          Saving…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}

          {/* ══════════════════════════════════════════
              TAB: FEATURES
          ══════════════════════════════════════════ */}
          {activeTab === "features" && (
            <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Puzzle className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={clsx(
                        typography.semibold16,
                        "text-secondary-900 dark:text-white",
                      )}
                    >
                      Plan Features
                    </p>
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-secondary-400 dark:text-secondary-500",
                      )}
                    >
                      Toggle features on or off for this plan
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-0 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"
                >
                  {planFeatures.length} assigned
                </Badge>
              </div>

              {/* Feature grid */}
              {isAllFeaturesLoading || isPlanFeaturesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <ButtonLoader text="Loading features…" />
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allFeatures.map((feature) => {
                    const isAssigned = assignedFeatureIds.has(feature.id);
                    const planFeature = planFeatures.find(
                      (pf) => pf.feature_id === feature.id,
                    );
                    const isMutating =
                      assignFeatureMutation.isPending ||
                      removeFeatureMutation.isPending;

                    return (
                      <div
                        key={feature.id}
                        className={clsx(
                          "group relative flex flex-col gap-3 rounded-xl border-2 px-4 py-4 transition-all duration-200 cursor-pointer select-none",
                          isAssigned
                            ? "border-violet-200 dark:border-violet-800/60 bg-violet-50/60 dark:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
                            : "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-secondary-200 dark:hover:border-secondary-600",
                        )}
                        onClick={() =>
                          !isMutating && handleToggleFeature(feature)
                        }
                      >
                        {/* Top row: icon + toggle */}
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={clsx(
                              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                              isAssigned
                                ? "bg-violet-500 text-white shadow-sm shadow-violet-500/20"
                                : "bg-secondary-100 dark:bg-secondary-700 text-secondary-400",
                            )}
                          >
                            {isAssigned ? (
                              <Check className="h-4 w-4" strokeWidth={2.5} />
                            ) : (
                              <Puzzle className="h-4 w-4" />
                            )}
                          </div>
                          {/* Active/inactive toggle — only shown when assigned */}
                          {isAssigned && planFeature && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFeatureActive(planFeature);
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <span
                                className={clsx(
                                  typography.regular12,
                                  planFeature.is_active
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-secondary-400 dark:text-secondary-500",
                                )}
                              >
                                {planFeature.is_active ? "On" : "Off"}
                              </span>
                              <Switch
                                checked={planFeature.is_active}
                                onCheckedChange={() =>
                                  handleToggleFeatureActive(planFeature)
                                }
                                className="h-4 w-7 [&>span]:h-3 [&>span]:w-3"
                              />
                            </div>
                          )}
                        </div>

                        {/* Name + key */}
                        <div className="flex flex-col gap-0.5">
                          <p
                            className={clsx(
                              typography.semibold14,
                              isAssigned
                                ? "text-violet-900 dark:text-violet-100"
                                : "text-secondary-700 dark:text-secondary-300",
                            )}
                          >
                            {feature.name}
                          </p>
                          <p
                            className={clsx(
                              typography.regular12,
                              "font-mono",
                              isAssigned
                                ? "text-violet-500 dark:text-violet-400"
                                : "text-secondary-400 dark:text-secondary-500",
                            )}
                          >
                            {feature.feature_key}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {allFeatures.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center h-40 gap-3">
                      <Puzzle className="h-8 w-8 text-secondary-300 dark:text-secondary-600" />
                      <p
                        className={clsx(
                          typography.regular14,
                          "text-secondary-400 dark:text-secondary-500",
                        )}
                      >
                        No features found. Create some features first.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: LIMITS
          ══════════════════════════════════════════ */}
          {activeTab === "limits" && (
            <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={clsx(
                        typography.semibold16,
                        "text-secondary-900 dark:text-white",
                      )}
                    >
                      Plan Limits
                    </p>
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-secondary-400 dark:text-secondary-500",
                      )}
                    >
                      Define usage caps and resource limits
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowAddLimit(true)}
                  className="flex items-center gap-1.5 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Limit
                </Button>
              </div>

              <div className="p-6 flex flex-col gap-3">
                {/* Add limit inline form */}
                {showAddLimit && (
                  <div className="flex items-center gap-3 rounded-xl border-2 border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3.5">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <Input
                      placeholder="limit_key (e.g. max_members)"
                      value={newLimitKey}
                      onChange={(e) => setNewLimitKey(e.target.value)}
                      className="h-9 font-mono text-sm flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Value"
                      value={newLimitValue}
                      onChange={(e) => setNewLimitValue(e.target.value)}
                      className="h-9 w-28 text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addLimitMutation.mutate()}
                      disabled={
                        addLimitMutation.isPending ||
                        !newLimitKey.trim() ||
                        !newLimitValue
                      }
                      className="rounded-lg h-9 px-3"
                    >
                      {addLimitMutation.isPending ? (
                        <ButtonLoader />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddLimit(false);
                        setNewLimitKey("");
                        setNewLimitValue("");
                      }}
                      className="rounded-lg h-9 px-3 text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Limits list */}
                {isPlanLimitsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <ButtonLoader text="Loading limits…" />
                  </div>
                ) : planLimits.length === 0 && !showAddLimit ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Gauge className="h-8 w-8 text-secondary-300 dark:text-secondary-600" />
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-secondary-400 dark:text-secondary-500",
                      )}
                    >
                      No limits defined yet.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddLimit(true)}
                      className="rounded-xl"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add First Limit
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {planLimits.map((limit) => {
                      const isEditing = editingLimitId === limit.id;
                      return (
                        <div
                          key={limit.id}
                          className={clsx(
                            "group flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 transition-all duration-150",
                            isEditing
                              ? "border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20"
                              : "border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-secondary-200 dark:hover:border-secondary-600",
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={clsx(
                              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              isEditing
                                ? "bg-amber-500 text-white"
                                : "bg-secondary-100 dark:bg-secondary-700 text-amber-500",
                            )}
                          >
                            <Hash className="h-4 w-4" />
                          </div>

                          {/* Key */}
                          <p
                            className={clsx(
                              typography.medium14,
                              "font-mono flex-1 text-secondary-700 dark:text-secondary-300 truncate",
                            )}
                          >
                            {limit.limit_key}
                          </p>

                          {/* Value — inline edit */}
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editingLimitValue}
                              onChange={(e) =>
                                setEditingLimitValue(e.target.value)
                              }
                              className="h-8 w-28 text-sm rounded-lg"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <span
                                className={clsx(
                                  typography.semibold14,
                                  "text-amber-700 dark:text-amber-400 tabular-nums",
                                )}
                              >
                                {limit.limit_value.toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Actions */}
                          <div
                            className={clsx(
                              "flex items-center gap-1 transition-opacity duration-150",
                              isEditing
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100",
                            )}
                          >
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    updateLimitMutation.mutate({
                                      limitId: limit.id,
                                    })
                                  }
                                  disabled={updateLimitMutation.isPending}
                                  className="h-7 w-7 p-0 rounded-lg"
                                >
                                  {updateLimitMutation.isPending ? (
                                    <ButtonLoader />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingLimitId(null)}
                                  className="h-7 w-7 p-0 rounded-lg text-secondary-400"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLimitId(limit.id);
                                    setEditingLimitValue(
                                      String(limit.limit_value),
                                    );
                                  }}
                                  className="h-7 w-7 p-0 rounded-lg text-secondary-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteLimitMutation.mutate(limit.id)
                                  }
                                  disabled={deleteLimitMutation.isPending}
                                  className="h-7 w-7 p-0 rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminDashboardPage>
  );
};

export default EditPlan;
