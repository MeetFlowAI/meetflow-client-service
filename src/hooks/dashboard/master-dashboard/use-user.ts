/* Local Imports */
import Toast from "@/components/toast";
import {
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
  getUserByIdRequest,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/services/master-dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

export const useUser = () => {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["master-users"] });

  /* ── Get By ID ── */
  const getUserByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await getUserByIdRequest(id);
      return response;
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to fetch user",
      });
    },
  });

  /* ── Create ── */
  const createUserMutation = useMutation({
    mutationFn: async (reqData: CreateUserRequest) => {
      const response = await createUserRequest(reqData);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "User created",
        description: "The user has been added successfully.",
      });
      invalidateUsers();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to create user",
      });
    },
  });

  /* ── Update ── */
  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      reqData,
    }: {
      id: string;
      reqData: UpdateUserRequest;
    }) => {
      const response = await updateUserRequest(id, reqData);
      return response;
    },
    onSuccess: (_, { id }) => {
      Toast.success({
        message: "User updated",
        description: "The user has been updated successfully.",
      });
      invalidateUsers();
      queryClient.invalidateQueries({ queryKey: ["master-user", id] });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to update user",
      });
    },
  });

  /* ── Delete ── */
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUserRequest(id);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "User removed successfully.",
      });
      invalidateUsers();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to delete user",
      });
    },
  });

  return {
    getUserByIdMutation,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
};
