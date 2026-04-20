/* Local Imports */
import Toast from "@/components/toast";
import {
  createOrganizationRequest,
  updateOrganizationRequest,
  deleteOrganizationRequest,
  getOrganizationByIdRequest,
  activateOrganizationRequest,
  deactivateOrganizationRequest,
  type CreateOrganizationRequest,
  type UpdateOrganizationRequest,
} from "@/services/master-dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

export const useOrganization = () => {
  const queryClient = useQueryClient();

  const invalidateOrgs = () =>
    queryClient.invalidateQueries({ queryKey: ["master-organizations"] });

  /* ── Get By ID ── */
  const getOrganizationByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await getOrganizationByIdRequest(id);
      return response;
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to fetch organization",
      });
    },
  });

  /* ── Create ── */
  const createOrganizationMutation = useMutation({
    mutationFn: async (reqData: CreateOrganizationRequest) => {
      const response = await createOrganizationRequest(reqData);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Organization created",
        description: "The organization has been added successfully.",
      });
      invalidateOrgs();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to create organization",
      });
    },
  });

  /* ── Update ── */
  const updateOrganizationMutation = useMutation({
    mutationFn: async ({
      id,
      reqData,
    }: {
      id: string;
      reqData: UpdateOrganizationRequest;
    }) => {
      const response = await updateOrganizationRequest(id, reqData);
      return response;
    },
    onSuccess: (_, { id }) => {
      Toast.success({
        message: "Organization updated",
        description: "The organization has been updated successfully.",
      });
      invalidateOrgs();
      queryClient.invalidateQueries({ queryKey: ["master-organization", id] });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to update organization",
      });
    },
  });

  /* ── Delete ── */
  const deleteOrganizationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteOrganizationRequest(id);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Organization removed successfully.",
      });
      invalidateOrgs();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to delete organization",
      });
    },
  });

  /* ── Activate / Deactivate ── */
  const toggleOrganizationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = isActive
        ? await deactivateOrganizationRequest(id)
        : await activateOrganizationRequest(id);
      return response;
    },
    onSuccess: (_, { isActive }) => {
      Toast.success({
        message: "Updated",
        description: `Organization ${isActive ? "deactivated" : "activated"} successfully.`,
      });
      invalidateOrgs();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Action failed",
      });
    },
  });

  return {
    getOrganizationByIdMutation,
    createOrganizationMutation,
    updateOrganizationMutation,
    deleteOrganizationMutation,
    toggleOrganizationMutation,
  };
};
