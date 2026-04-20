/* Imports */
import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/* Local Imports */
import AdminDashboardPage from "@/components/page/dashboard/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { usePlan } from "@/hooks/dashboard/master-dashboard/use-plan";
import {
  PlanFormSchema,
  type PlanFormValues,
} from "@/models/master-dashboard/plan";

// ----------------------------------------------------------------------

const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "lifetime", label: "Lifetime" },
] as const;

// ----------------------------------------------------------------------

/**
 * Create / Edit page for Master Dashboard Plans.
 *
 * @component
 * @returns {JSX.Element}
 */
const CreatePlan = (): JSX.Element => {
  /* Constants */
  const managePlansPath = PAGE_MASTER_DASHBOARD.plans.absolutePath;

  /* Hooks */
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlanByIdMutation, createPlanMutation, updatePlanMutation } =
    usePlan();

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

  /* Functions */
  /**
   * Fetch plan by id and populate form fields.
   */
  const getPlanById = async (planId: string): Promise<void> => {
    const response = await getPlanByIdMutation.mutateAsync(planId);
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

  /**
   * Submit handler — create or update depending on whether id is present.
   */
  const handleFormSubmit = async (values: PlanFormValues): Promise<void> => {
    if (id) {
      await updatePlanMutation.mutateAsync({
        id,
        reqData: {
          name: values.txtName,
          description: values.txtDescription || undefined,
          price: Number(values.numPrice),
          billing_cycle: values.selBillingCycle,
          is_active: values.chkIsActive,
        },
      });
    } else {
      await createPlanMutation.mutateAsync({
        name: values.txtName,
        description: values.txtDescription || undefined,
        price: Number(values.numPrice),
        billing_cycle: values.selBillingCycle,
        is_active: values.chkIsActive,
      });
    }
    navigate(managePlansPath);
  };

  /* Side-Effects */
  useEffect(() => {
    if (id) getPlanById(id);
  }, [id]);

  /* Derived */
  const isLoading = getPlanByIdMutation.isPending;
  const isPending =
    createPlanMutation.isPending || updatePlanMutation.isPending;

  /* Output */
  return (
    <AdminDashboardPage title={id ? "Edit Plan" : "Create Plan"}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading plan…" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="w-full flex flex-col h-full gap-6"
          >
            <MasterDashboardFormLayout
              title={id ? "Update Plan" : "Create Plan"}
              description={
                id
                  ? "Please update the details below to update the plan"
                  : "Please fill the below details to create new plan"
              }
              footer={
                <>
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
                      <div className="flex items-center justify-between gap-2">
                        <ButtonLoader />
                        {id ? "Updating..." : "Creating..."}
                      </div>
                    ) : id ? (
                      "Update Plan"
                    ) : (
                      "Create Plan"
                    )}
                  </Button>
                </>
              }
            >
              {/* Plan Name */}
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

              {/* Price */}
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
                    <FormDescription>Set to 0 for a free plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billing Cycle */}
              <FormField
                control={form.control}
                name="selBillingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Billing Cycle <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* Description — full width */}
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

              {/* Active Status — full width */}
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
            </MasterDashboardFormLayout>
          </form>
        </Form>
      )}
    </AdminDashboardPage>
  );
};

export default CreatePlan;
