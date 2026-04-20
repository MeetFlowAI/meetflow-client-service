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
import { useRole } from "@/hooks/dashboard/master-dashboard/use-role";
import {
  RoleFormSchema,
  type RoleFormValues,
} from "@/models/master-dashboard/role";

// ----------------------------------------------------------------------

/**
 * Create / Edit page for Master Dashboard Roles.
 *
 * @component
 * @returns {JSX.Element}
 */
const CreateRole = (): JSX.Element => {
  /* Constants */
  const manageRolesPath = PAGE_MASTER_DASHBOARD.roles.absolutePath;

  /* Hooks */
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRoleByIdMutation, createRoleMutation, updateRoleMutation } =
    useRole();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      txtName: "",
      txtDisplayName: "",
      txtDescription: "",
      chkIsSystem: false,
    },
  });

  /* Functions */
  /**
   * Fetch role by id and populate form fields.
   */
  const getRoleById = async (roleId: string): Promise<void> => {
    const response = await getRoleByIdMutation.mutateAsync(roleId);
    const role = response?.data;
    if (!role) return;
    form.reset({
      txtName: role.name ?? "",
      txtDisplayName: role.display_name ?? "",
      txtDescription: role.description ?? "",
      chkIsSystem: role.is_system ?? false,
    });
  };

  /**
   * Submit handler — create or update depending on whether id is present.
   */
  const handleFormSubmit = async (values: RoleFormValues): Promise<void> => {
    if (id) {
      await updateRoleMutation.mutateAsync({
        id,
        reqData: {
          name: values.txtName,
          description: values.txtDescription || undefined,
          is_system: values.chkIsSystem,
        },
      });
    } else {
      await createRoleMutation.mutateAsync({
        name: values.txtName,
        description: values.txtDescription || undefined,
        is_system: values.chkIsSystem,
      });
    }
    navigate(manageRolesPath);
  };

  /* Side-Effects */
  useEffect(() => {
    if (id) getRoleById(id);
  }, [id]);

  /* Derived */
  const isLoading = getRoleByIdMutation.isPending;
  const isPending =
    createRoleMutation.isPending || updateRoleMutation.isPending;

  /* Output */
  return (
    <AdminDashboardPage title={"Roles"}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading role…" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="w-full flex flex-col h-full gap-6"
          >
            <MasterDashboardFormLayout
              title={id ? "Update Role" : "Create Role"}
              description={
                id
                  ? "Please update the details below to update the role"
                  : "Please fill the below details to create new role"
              }
              footer={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(manageRolesPath)}
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
                      "Update Role"
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </>
              }
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="txtDisplayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Super Administrator"
                        {...field}
                      />
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
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe what this role can do…"
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is System Toggle — full width */}
              <FormField
                control={form.control}
                name="chkIsSystem"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-xl border-2 border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 px-5 py-4 cursor-pointer">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">
                        System Role
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? "Built-in — cannot be deleted by organisation admins."
                          : "Custom role — organisation admins can manage this."}
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

export default CreateRole;
