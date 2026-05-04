/* Imports */
import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  UserCircle2,
  CreditCard,
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
import MasterDashboardFormLayout from "@/layout/dashboard/admin/components/MasterDashboardFormLayout";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { useOrganization } from "@/hooks/dashboard/master-dashboard/use-organization";
import { getAllPlansRequest } from "@/services/master-dashboard";
import {
  OrganizationFormSchema,
  type OrganizationFormValues,
} from "@/models/master-dashboard/organization";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

const STEPS = [
  {
    label: "Org Identity",
    description: "Name, domain & email",
    icon: Building2,
    color: "from-violet-500 to-indigo-500",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
    lightText: "text-violet-600 dark:text-violet-400",
    lightBorder: "border-violet-200 dark:border-violet-800",
    activeBg: "bg-gradient-to-br from-violet-500 to-indigo-500",
  },
  {
    label: "Owner Account",
    description: "Primary owner details",
    icon: UserCircle2,
    color: "from-sky-500 to-cyan-500",
    lightBg: "bg-sky-50 dark:bg-sky-950/30",
    lightText: "text-sky-600 dark:text-sky-400",
    lightBorder: "border-sky-200 dark:border-sky-800",
    activeBg: "bg-gradient-to-br from-sky-500 to-cyan-500",
  },
  {
    label: "Plan",
    description: "Assign a subscription",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    lightText: "text-emerald-600 dark:text-emerald-400",
    lightBorder: "border-emerald-200 dark:border-emerald-800",
    activeBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
] as const;

const STEP_FIELDS: Record<number, (keyof OrganizationFormValues)[]> = {
  0: ["txtName", "txtDisplayName", "txtDomain", "txtOfficialEmail"],
  1: ["txtOwnerFirstName", "txtOwnerLastName", "txtPrimaryOwnerEmail"],
  2: ["numPlanId"],
};

// ----------------------------------------------------------------------

const CreateOrganization = (): JSX.Element => {
  const manageOrgsPath = PAGE_MASTER_DASHBOARD.organizations.absolutePath;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getOrganizationByIdMutation,
    createOrganizationMutation,
    updateOrganizationMutation,
  } = useOrganization();

  const [currentStep, setCurrentStep] = useState(0);

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

  const getOrganizationById = async (orgId: string): Promise<void> => {
    const response = await getOrganizationByIdMutation.mutateAsync(orgId);
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
  };

  const handleNextStep = async (): Promise<void> => {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await form.trigger(fields);
    if (isValid) setCurrentStep((s) => s + 1);
  };

  const handleFormSubmit = async (
    values: OrganizationFormValues,
  ): Promise<void> => {
    if (id) {
      await updateOrganizationMutation.mutateAsync({
        id,
        reqData: {
          name: values.txtName,
          display_name: values.txtDisplayName,
          domain: values.txtDomain || undefined,
          official_email: values.txtOfficialEmail,
        },
      });
    } else {
      await createOrganizationMutation.mutateAsync({
        name: values.txtName,
        display_name: values.txtDisplayName,
        domain: values.txtDomain || "",
        official_email: values.txtOfficialEmail,
        owner_first_name: values.txtOwnerFirstName,
        owner_last_name: values.txtOwnerLastName,
        primary_owner_email: values.txtPrimaryOwnerEmail,
        plan_id: values.numPlanId,
      });
    }
    navigate(manageOrgsPath);
  };

  useEffect(() => {
    if (id) getOrganizationById(id);
  }, [id]);

  const isLoading = getOrganizationByIdMutation.isPending;
  const isPending =
    createOrganizationMutation.isPending ||
    updateOrganizationMutation.isPending;

  // ── Edit mode — flat layout, same as CreatePlan / CreateFeature ──
  if (id) {
    return (
      <AdminDashboardPage title="Edit Organization">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ButtonLoader text="Loading organization…" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="w-full flex flex-col h-full gap-6"
            >
              <MasterDashboardFormLayout
                title="Update Organization"
                description="Please update the details below to update the organization"
                footer={
                  <>
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
                        <div className="flex items-center gap-2">
                          <ButtonLoader />
                          Updating...
                        </div>
                      ) : (
                        "Update Organization"
                      )}
                    </Button>
                  </>
                }
              >
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
                        Official Email <span className="text-red-500">*</span>
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
              </MasterDashboardFormLayout>
            </form>
          </Form>
        )}
      </AdminDashboardPage>
    );
  }

  // ── Create mode — modern stepper above MasterDashboardFormLayout ──
  const activeStep = STEPS[currentStep];
  const StepIcon = activeStep.icon;

  return (
    <AdminDashboardPage title="Create Organization">
      <div className="flex flex-col gap-5">
        {/* ── Modern Stepper ── */}
        <div className="rounded-2xl border border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between relative">
              {/* Progress track behind everything */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-secondary-100 dark:bg-secondary-700 mx-[2.5rem]" />
              {/* Filled progress track */}
              <div
                className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{
                  marginLeft: "2.5rem",
                  width: `calc((100% - 5rem) * ${currentStep / (STEPS.length - 1)})`,
                }}
              />

              {STEPS.map((step, idx) => {
                const isDone = idx < currentStep;
                const isActive = idx === currentStep;
                const Icon = step.icon;

                return (
                  <div
                    key={step.label}
                    className="flex flex-col items-center gap-2.5 z-10"
                  >
                    {/* Icon circle */}
                    <div
                      className={clsx(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        isDone
                          ? `${step.activeBg} shadow-lg shadow-${step.color}/20`
                          : isActive
                            ? `${step.activeBg} shadow-lg`
                            : "bg-secondary-100 dark:bg-secondary-700 border-2 border-secondary-200 dark:border-secondary-600",
                      )}
                    >
                      {isDone ? (
                        <Check
                          className="h-4 w-4 text-white"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Icon
                          className={clsx(
                            "h-4 w-4",
                            isActive
                              ? "text-white"
                              : "text-secondary-400 dark:text-secondary-500",
                          )}
                        />
                      )}
                    </div>

                    {/* Label + description */}
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <p
                        className={clsx(
                          typography.semibold12,
                          isActive
                            ? step.lightText
                            : isDone
                              ? "text-secondary-700 dark:text-secondary-200"
                              : "text-secondary-400 dark:text-secondary-500",
                          "transition-colors duration-200",
                        )}
                      >
                        {step.label}
                      </p>
                      <p
                        className={clsx(
                          typography.regular12,
                          "text-secondary-400 dark:text-secondary-500 hidden sm:block",
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active step hint bar */}
          <div
            className={clsx(
              "px-6 py-3 border-t border-secondary-100 dark:border-secondary-700 flex items-center gap-3",
              activeStep.lightBg,
            )}
          >
            <div
              className={clsx(
                "h-6 w-6 rounded-lg flex items-center justify-center shrink-0",
                activeStep.activeBg,
              )}
            >
              <StepIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={clsx(typography.semibold14, activeStep.lightText)}
              >
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-secondary-300 dark:text-secondary-600">
                ·
              </span>
              <span
                className={clsx(
                  typography.regular14,
                  "text-secondary-500 dark:text-secondary-400 truncate",
                )}
              >
                {activeStep.description}
              </span>
            </div>
            {/* Step dots */}
            <div className="ml-auto flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    idx < currentStep
                      ? "h-1.5 w-4 bg-gradient-to-r from-violet-500 to-emerald-500"
                      : idx === currentStep
                        ? "h-1.5 w-4 " + activeStep.activeBg
                        : "h-1.5 w-1.5 bg-secondary-200 dark:bg-secondary-600",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Form — MasterDashboardFormLayout exactly like CreatePlan ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="w-full flex flex-col h-full gap-6"
          >
            <MasterDashboardFormLayout
              title={activeStep.label}
              description={activeStep.description}
              footer={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      currentStep === 0
                        ? navigate(manageOrgsPath)
                        : setCurrentStep((s) => s - 1)
                    }
                    disabled={isPending}
                  >
                    {currentStep === 0 ? (
                      "Cancel"
                    ) : (
                      <span className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </span>
                    )}
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" size="lg" onClick={handleNextStep}>
                      <span className="flex items-center gap-2">
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Button>
                  ) : (
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <ButtonLoader />
                          Creating...
                        </div>
                      ) : (
                        "Create Organization"
                      )}
                    </Button>
                  )}
                </>
              }
            >
              {/* ── Step 0: Org Identity ── */}
              {currentStep === 0 && (
                <>
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
                          Official Email <span className="text-red-500">*</span>
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
                </>
              )}

              {/* ── Step 1: Owner Account ── */}
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="txtOwnerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Owner First Name{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Jane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="txtOwnerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Owner Last Name{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="txtPrimaryOwnerEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>
                          Owner Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="e.g. jane@acme.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A temporary password will be auto-generated and
                          emailed to this address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* ── Step 2: Plan ── */}
              {currentStep === 2 && (
                <FormField
                  control={form.control}
                  name="numPlanId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Subscription Plan{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isPlansLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-[38px] rounded-[10px] border-2 border-secondary-100 dark:border-secondary-400">
                            <SelectValue
                              placeholder={
                                isPlansLoading
                                  ? "Loading plans…"
                                  : "Select a plan"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </MasterDashboardFormLayout>
          </form>
        </Form>
      </div>
    </AdminDashboardPage>
  );
};

export default CreateOrganization;
