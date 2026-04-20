/* Local Imports */
import Toast from "@/components/toast";
import {
  createPlanRequest,
  updatePlanRequest,
  deletePlanRequest,
  getPlanByIdRequest,
  type CreatePlanRequest,
  type UpdatePlanRequest,
} from "@/services/master-dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

export const usePlan = () => {
  const queryClient = useQueryClient();

  const invalidatePlans = () =>
    queryClient.invalidateQueries({ queryKey: ["master-plans"] });

  /* ── Get By ID ── */
  const getPlanByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await getPlanByIdRequest(id);
      return response;
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to fetch plan",
      });
    },
  });

  /* ── Create ── */
  const createPlanMutation = useMutation({
    mutationFn: async (reqData: CreatePlanRequest) => {
      const response = await createPlanRequest(reqData);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Plan created",
        description: "The plan has been added successfully.",
      });
      invalidatePlans();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to create plan",
      });
    },
  });

  /* ── Update ── */
  const updatePlanMutation = useMutation({
    mutationFn: async ({
      id,
      reqData,
    }: {
      id: string;
      reqData: UpdatePlanRequest;
    }) => {
      const response = await updatePlanRequest(id, reqData);
      return response;
    },
    onSuccess: (_, { id }) => {
      Toast.success({
        message: "Plan updated",
        description: "The plan has been updated successfully.",
      });
      invalidatePlans();
      queryClient.invalidateQueries({ queryKey: ["master-plan", id] });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to update plan",
      });
    },
  });

  /* ── Delete ── */
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePlanRequest(id);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Plan removed successfully.",
      });
      invalidatePlans();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message ?? "Failed to delete plan",
      });
    },
  });

  return {
    getPlanByIdMutation,
    createPlanMutation,
    updatePlanMutation,
    deletePlanMutation,
  };
};
