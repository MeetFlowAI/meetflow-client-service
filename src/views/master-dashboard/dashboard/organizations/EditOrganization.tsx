/* Imports */
import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CreditCard,
  Save,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Zap,
  Calendar,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import AdminDashboardPage from "@/components/page/dashboard/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Toast from "@/components/toast";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { useOrganization } from "@/hooks/dashboard/master-dashboard/use-organization";
import {
  getAllPlansRequest,
  assignPlanToOrganizationRequest,
} from "@/services/master-dashboard";
import {
  OrganizationFormSchema,
  type OrganizationFormValues,
} from "@/models/master-dashboard/organization";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

type TabId = "details" | "plan";

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "details", label: "Details", icon: Building2 },
  { id: "plan", label: "Plan", icon: CreditCard },
];

// ----------------------------------------------------------------------

const EditOrganization = (): JSX.Element => {
  const manageOrgsPath = PAGE_MASTER_DASHBOARD.organizations.absolutePath;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [currentPlan, setCurrentPlan] = useState<{
    id: number;
    name: string;
    price: number;
    billing_cycle: string;
  } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const { getOrganizationByIdMutation, updateOrganizationMutation } =
    useOrganization();

  const { data: plansData, isLoading: isPlansLoading } = useQuery({
    queryKey: ["master-plans", { limit: 100 }],
    queryFn: () => getAllPlansRequest({ limit: 100 }),
  });
  const plans: {
    id: number;
    name: string;
    billing_cycle: string;
    price: number;
  }[] = plansData?.data?.data ?? [];

  const assignPlanMutation = useMutation({
    mutationFn: (planId: number) =>
      assignPlanToOrganizationRequest(id!, { plan_id: planId }),
    onSuccess: () => {
      Toast.success({
        message: "Plan Updated",
        description: "Plan assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["master-organizations"] });
      // update local current plan display
      const found = plans.find((p) => p.id === selectedPlanId);
      if (found) setCurrentPlan(found);
    },
    onError: (e: any) =>
      Toast.error({
        message: "Error",
        description: e?.response?.data?.message ?? "Failed to assign plan",
      }),
  });

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      txtName: "",
      txtDisplayName: "",
      txtDomain: "",
      txtOfficialEmail: "",
      txtOwnerFirstName: "",
      txtOwnerLastName: "",
      txtPrimaryOwnerEmail: "",
      numPlanId: undefined as unknown as number,
    },
    mode: "onTouched",
  });

  const loadOrganization = async (): Promise<void> => {
    if (!id) return;
    const response = await getOrganizationByIdMutation.mutateAsync(id);
    const org = response?.data;
    if (!org) return;
    form.reset({
      txtName: org.name ?? "",
      txtDisplayName: org.display_name ?? "",
      txtDomain: org.domain ?? "",
      txtOfficialEmail: org.official_email ?? "",
      txtOwnerFirstName: "",
      txtOwnerLastName: "",
      txtPrimaryOwnerEmail: org.primary_owner_email ?? "",
      numPlanId: org.plan_id ?? undefined,
    });
    if (org.plan_id) {
      setSelectedPlanId(org.plan_id);
      // find plan info from plans list if loaded
      const found = plans.find((p) => p.id === org.plan_id);
      if (found) setCurrentPlan(found);
    }
  };

  const handleDetailsSubmit = async (
    values: OrganizationFormValues,
  ): Promise<void> => {
    await updateOrganizationMutation.mutateAsync({
      id: id!,
      reqData: {
        name: values.txtName,
        display_name: values.txtDisplayName,
        domain: values.txtDomain || undefined,
        official_email: values.txtOfficialEmail,
      },
    });
    navigate(manageOrgsPath);
  };

  const handleAssignPlan = (): void => {
    if (selectedPlanId) assignPlanMutation.mutate(selectedPlanId);
  };

  useEffect(() => {
    if (id) loadOrganization();
  }, [id]);

  // sync current plan once plans load
  useEffect(() => {
    const planId = form.getValues("numPlanId");
    if (planId && plans.length) {
      const found = plans.find((p) => p.id === planId);
      if (found) setCurrentPlan(found);
    }
  }, [plans]);

  const isLoading = getOrganizationByIdMutation.isPending;
  const isPending = updateOrganizationMutation.isPending;

  if (!id) return <></>;

  return (
    <AdminDashboardPage title="Edit Organization">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading organization…" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ── Page Header ── */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(manageOrgsPath)}
              className={clsx(
                "flex items-center gap-2",
                typography.medium14,
                "text-secondary-400 dark:text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors",
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Organizations
            </button>
          </div>

          {/* ── Beautiful Tab Bar ── */}
          <div className="relative flex gap-1 p-1 rounded-2xl bg-secondary-100 dark:bg-secondary-700/50 w-fit">
            {/* sliding pill */}
            <div
              className={clsx(
                "absolute top-1 bottom-1 rounded-xl bg-white dark:bg-secondary-800 shadow-sm transition-all duration-300 ease-out",
              )}
              style={{
                width: `calc(50% - 2px)`,
                left: activeTab === "details" ? "4px" : "calc(50% + 2px)",
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
                    "relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200",
                    typography.medium14,
                    isActive
                      ? "text-secondary-900 dark:text-white"
                      : "text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab: Details ── */}
          {activeTab === "details" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleDetailsSubmit)}
                className="w-full flex flex-col gap-6"
              >
                <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                    <div className="h-10 w-10 rounded-xl bg-information-100 dark:bg-information-900/30 flex items-center justify-center text-information-600 dark:text-information-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={clsx(
                          typography.semibold16,
                          "text-secondary-900 dark:text-white",
                        )}
                      >
                        Organization Details
                      </p>
                      <p
                        className={clsx(
                          typography.regular14,
                          "text-secondary-400 dark:text-secondary-500",
                        )}
                      >
                        Update name, email and domain information
                      </p>
                    </div>
                  </div>

                  {/* Fields grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 py-6">
                    <FormField
                      control={form.control}
                      name="txtName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Legal Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="txtDisplayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Display Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="txtOfficialEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Official Email{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="e.g. contact@acme.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="txtDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. acme.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional. Used to identify the org.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-700/20">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => navigate(manageOrgsPath)}
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

          {/* ── Tab: Plan ── */}
          {activeTab === "plan" && (
            <div className="flex flex-col gap-4">
              {/* Current plan card */}
              {currentPlan && (
                <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={clsx(
                          typography.semibold16,
                          "text-secondary-900 dark:text-white",
                        )}
                      >
                        Current Plan
                      </p>
                      <p
                        className={clsx(
                          typography.regular14,
                          "text-secondary-400 dark:text-secondary-500",
                        )}
                      >
                        Active subscription for this organization
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-information-500 to-information-600 flex items-center justify-center shadow-lg shadow-information-500/20">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p
                          className={clsx(
                            typography.semibold18,
                            "text-secondary-900 dark:text-white",
                          )}
                        >
                          {currentPlan.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-secondary-400 dark:text-secondary-500 text-sm">
                            <DollarSign className="h-3.5 w-3.5" />
                            {Number(currentPlan.price) === 0
                              ? "Free"
                              : `₹${Number(currentPlan.price).toFixed(2)}`}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-secondary-300 dark:bg-secondary-600" />
                          <span className="flex items-center gap-1 text-secondary-400 dark:text-secondary-500 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            {currentPlan.billing_cycle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-0 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </Badge>
                  </div>
                </div>
              )}

              {/* Change plan card */}
              <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-5 border-b border-secondary-100 dark:border-secondary-700">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={clsx(
                        typography.semibold16,
                        "text-secondary-900 dark:text-white",
                      )}
                    >
                      Change Plan
                    </p>
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-secondary-400 dark:text-secondary-500",
                      )}
                    >
                      Assign a different subscription plan
                    </p>
                  </div>
                </div>

                <div className="px-6 py-6 flex flex-col gap-5">
                  {/* Plan select */}
                  <div className="flex flex-col gap-2">
                    <label
                      className={clsx(
                        typography.medium14,
                        "text-secondary-700 dark:text-secondary-300",
                      )}
                    >
                      Select New Plan
                    </label>
                    <Select
                      value={selectedPlanId ? String(selectedPlanId) : ""}
                      onValueChange={(v) => setSelectedPlanId(Number(v))}
                      disabled={isPlansLoading}
                    >
                      <SelectTrigger className="w-full h-[38px] rounded-[10px] border-2 border-secondary-100 dark:border-secondary-400">
                        <SelectValue
                          placeholder={
                            isPlansLoading ? "Loading plans…" : "Select a plan"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.name} —{" "}
                            {Number(plan.price) === 0
                              ? "Free"
                              : `₹${Number(plan.price).toFixed(2)}`}{" "}
                            / {plan.billing_cycle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Warning note */}
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 px-4 py-3.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p
                      className={clsx(
                        typography.regular14,
                        "text-amber-700 dark:text-amber-400",
                      )}
                    >
                      Changing the plan will immediately affect this
                      organization's feature access and limits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-700/20">
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleAssignPlan}
                    disabled={
                      assignPlanMutation.isPending ||
                      !selectedPlanId ||
                      selectedPlanId === currentPlan?.id
                    }
                  >
                    {assignPlanMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <ButtonLoader />
                        Assigning…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Assign Plan
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminDashboardPage>
  );
};

export default EditOrganization;
