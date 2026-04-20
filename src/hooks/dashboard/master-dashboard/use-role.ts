/* Local Imports */
import Toast from "@/components/toast";
import {
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest,
  getRoleByIdRequest,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from "@/services/master-dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

export const useRole = () => {
  const queryClient = useQueryClient();

  const invalidateRoles = () =>
    queryClient.invalidateQueries({ queryKey: ["master-roles"] });

  /* ── Get By ID ── */
  const getRoleByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await getRoleByIdRequest(id);
      return response;
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to fetch role",
      });
    },
  });

  /* ── Create ── */
  const createRoleMutation = useMutation({
    mutationFn: async (reqData: CreateRoleRequest) => {
      const response = await createRoleRequest(reqData);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Role created",
        description: "The role has been added successfully.",
      });
      invalidateRoles();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to create role",
      });
    },
  });

  /* ── Update ── */
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      id,
      reqData,
    }: {
      id: string;
      reqData: UpdateRoleRequest;
    }) => {
      const response = await updateRoleRequest(id, reqData);
      return response;
    },
    onSuccess: (_, { id }) => {
      Toast.success({
        message: "Role updated",
        description: "The role has been updated successfully.",
      });
      invalidateRoles();
      queryClient.invalidateQueries({ queryKey: ["master-role", id] });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to update role",
      });
    },
  });

  /* ── Delete ── */
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRoleRequest(id);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Role removed successfully.",
      });
      invalidateRoles();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to delete role",
      });
    },
  });

  return {
    getRoleByIdMutation,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
  };
};
