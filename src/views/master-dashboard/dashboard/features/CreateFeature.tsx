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
import MasterDashboardFormLayout from "@/layout/dashboard/admin/components/MasterDashboardFormLayout";
import { PAGE_MASTER_DASHBOARD } from "@/routes/paths";
import { useFeature } from "@/hooks/dashboard/master-dashboard/use-feature";
import {
  FeatureFormSchema,
  type FeatureFormValues,
} from "@/models/master-dashboard/feature";

// ----------------------------------------------------------------------

/**
 * Create / Edit page for Master Dashboard Features.
 *
 * @component
 * @returns {JSX.Element}
 */
const CreateFeature = (): JSX.Element => {
  /* Constants */
  const manageFeaturesPath = PAGE_MASTER_DASHBOARD.features.absolutePath;

  /* Hooks */
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getFeatureByIdMutation,
    createFeatureMutation,
    updateFeatureMutation,
  } = useFeature();

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(FeatureFormSchema),
    defaultValues: {
      txtFeatureKey: "",
      txtName: "",
      txtDescription: "",
      chkIsActive: true,
    },
  });

  /* Functions */
  /**
   * Fetch feature by id and populate form fields.
   */
  const getFeatureById = async (featureId: string): Promise<void> => {
    const response = await getFeatureByIdMutation.mutateAsync(featureId);
    const feature = response?.data;
    if (!feature) return;
    form.reset({
      txtFeatureKey: feature.feature_key ?? "",
      txtName: feature.name ?? "",
      txtDescription: feature.description ?? "",
      chkIsActive: feature.is_active ?? true,
    });
  };

  /**
   * Submit handler — create or update depending on whether id is present.
   */
  const handleFormSubmit = async (values: FeatureFormValues): Promise<void> => {
    if (id) {
      await updateFeatureMutation.mutateAsync({
        id,
        reqData: {
          name: values.txtName,
          feature_key: values.txtFeatureKey,
          description: values.txtDescription || undefined,
          is_active: values.chkIsActive,
        },
      });
    } else {
      await createFeatureMutation.mutateAsync({
        feature_key: values.txtFeatureKey,
        name: values.txtName,
        description: values.txtDescription || undefined,
        is_active: values.chkIsActive,
      });
    }
    navigate(manageFeaturesPath);
  };

  /* Side-Effects */
  useEffect(() => {
    if (id) getFeatureById(id);
  }, [id]);

  /* Derived */
  const isLoading = getFeatureByIdMutation.isPending;
  const isPending =
    createFeatureMutation.isPending || updateFeatureMutation.isPending;

  /* Output */
  return (
    <AdminDashboardPage title={id ? "Edit Feature" : "Create Feature"}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading feature…" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="w-full flex flex-col h-full gap-6"
          >
            <MasterDashboardFormLayout
              title={id ? "Update Feature" : "Create Feature"}
              description={
                id
                  ? "Please update the details below to update the feature"
                  : "Please fill the below details to create new feature"
              }
              footer={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(manageFeaturesPath)}
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
                      "Update Feature"
                    ) : (
                      "Create Feature"
                    )}
                  </Button>
                </>
              }
            >
              {/* Feature Key */}
              <FormField
                control={form.control}
                name="txtFeatureKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Feature Key <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. video_analytics"
                        {...field}
                        disabled={!!id}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Lowercase letters, digits, underscores only. Immutable
                      after creation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feature Name */}
              <FormField
                control={form.control}
                name="txtName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Feature Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Video Analytics" {...field} />
                    </FormControl>
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
                        placeholder="Describe what this feature enables…"
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
                          ? "Feature is active and can be assigned to plans."
                          : "Feature is inactive and hidden from plan assignment."}
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

export default CreateFeature;
