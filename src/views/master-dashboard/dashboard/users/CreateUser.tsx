/* Imports */
import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

/* Local Imports */
import AdminDashboardPage from "@/components/page/dashboard/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { useUser } from "@/hooks/dashboard/master-dashboard/use-user";
import { getAllRolesRequest } from "@/services/master-dashboard";
import {
  UserFormSchema,
  type UserFormValues,
} from "@/models/master-dashboard/user";

// ----------------------------------------------------------------------

/**
 * Create / Edit page for Master Dashboard Users.
 *
 * @component
 * @returns {JSX.Element}
 */
const CreateUser = (): JSX.Element => {
  /* Constants */
  const manageUsersPath = PAGE_MASTER_DASHBOARD.users.absolutePath;

  /* Hooks */
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserByIdMutation, createUserMutation, updateUserMutation } =
    useUser();

  /* Fetch roles for dropdown */
  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ["master-roles", { limit: 100 }],
    queryFn: () => getAllRolesRequest({ limit: 100 }),
  });
  const roles: { id: number; name: string; display_name: string }[] =
    rolesData?.data?.data ?? [];

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      txtFirstName: "",
      txtLastName: "",
      txtEmail: "",
      txtPassword: "",
      numRoleId: undefined as unknown as number,
      chkIsActive: true,
    },
  });

  /* Functions */
  /**
   * Fetch user by id and populate form fields.
   */
  const getUserById = async (userId: string): Promise<void> => {
    const response = await getUserByIdMutation.mutateAsync(userId);
    const user = response?.data;
    if (!user) return;
    form.reset({
      txtFirstName: user.first_name ?? "",
      txtLastName: user.last_name ?? "",
      txtEmail: user.email ?? "",
      txtPassword: "",
      numRoleId: user.role_id ?? undefined,
      chkIsActive: user.is_active ?? true,
    });
  };

  /**
   * Submit handler — create or update depending on whether id is present.
   */
  const handleFormSubmit = async (values: UserFormValues): Promise<void> => {
    if (id) {
      await updateUserMutation.mutateAsync({
        id,
        reqData: {
          first_name: values.txtFirstName,
          last_name: values.txtLastName,
          email: values.txtEmail,
          role_id: values.numRoleId,
          is_active: values.chkIsActive,
        },
      });
    } else {
      await createUserMutation.mutateAsync({
        first_name: values.txtFirstName,
        last_name: values.txtLastName,
        email: values.txtEmail,
        password: values.txtPassword!,
        role_id: values.numRoleId,
        is_active: values.chkIsActive,
      });
    }
    navigate(manageUsersPath);
  };

  /* Side-Effects */
  useEffect(() => {
    if (id) getUserById(id);
  }, [id]);

  /* Derived */
  const isLoading = getUserByIdMutation.isPending;
  const isPending =
    createUserMutation.isPending || updateUserMutation.isPending;

  /* Output */
  return (
    <AdminDashboardPage title={id ? "Edit User" : "Create User"}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ButtonLoader text="Loading user…" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="w-full flex flex-col h-full gap-6"
          >
            <MasterDashboardFormLayout
              title={id ? "Update User" : "Create User"}
              description={
                id
                  ? "Please update the details below to update the user"
                  : "Please fill the below details to create new user"
              }
              footer={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(manageUsersPath)}
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
                      "Update User"
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </>
              }
            >
              {/* First Name */}
              <FormField
                control={form.control}
                name="txtFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="txtLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="txtEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. john@example.com"
                        {...field}
                        disabled={!!id}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password — create only */}
              {!id && (
                <FormField
                  control={form.control}
                  name="txtPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min. 8 characters"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Role */}
              <FormField
                control={form.control}
                name="numRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Role <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                      disabled={isRolesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-[38px] rounded-[10px] border-2 border-secondary-100 dark:border-secondary-400">
                          <SelectValue
                            placeholder={
                              isRolesLoading
                                ? "Loading roles…"
                                : "Select a role"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.display_name || role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          ? "User is active and can log into the system."
                          : "User is inactive and cannot log in."}
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

export default CreateUser;
