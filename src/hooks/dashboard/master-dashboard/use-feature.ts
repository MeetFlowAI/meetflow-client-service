/* Local Imports */
import Toast from "@/components/toast";
import {
  createFeatureRequest,
  updateFeatureRequest,
  deleteFeatureRequest,
  getFeatureByIdRequest,
  type CreateFeatureRequest,
  type UpdateFeatureRequest,
} from "@/services/master-dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

export const useFeature = () => {
  const queryClient = useQueryClient();

  const invalidateFeatures = () =>
    queryClient.invalidateQueries({ queryKey: ["master-features"] });

  /* ── Get By ID ── */
  const getFeatureByIdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await getFeatureByIdRequest(id);
      return response;
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to fetch feature",
      });
    },
  });

  /* ── Create ── */
  const createFeatureMutation = useMutation({
    mutationFn: async (reqData: CreateFeatureRequest) => {
      const response = await createFeatureRequest(reqData);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Feature created",
        description: "The feature has been added successfully.",
      });
      invalidateFeatures();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to create feature",
      });
    },
  });

  /* ── Update ── */
  const updateFeatureMutation = useMutation({
    mutationFn: async ({
      id,
      reqData,
    }: {
      id: string;
      reqData: UpdateFeatureRequest;
    }) => {
      const response = await updateFeatureRequest(id, reqData);
      return response;
    },
    onSuccess: (_, { id }) => {
      Toast.success({
        message: "Feature updated",
        description: "The feature has been updated successfully.",
      });
      invalidateFeatures();
      queryClient.invalidateQueries({ queryKey: ["master-feature", id] });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to update feature",
      });
    },
  });

  /* ── Delete ── */
  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteFeatureRequest(id);
      return response;
    },
    onSuccess: () => {
      Toast.success({
        message: "Deleted",
        description: "Feature removed successfully.",
      });
      invalidateFeatures();
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description:
          error?.response?.data?.message ?? "Failed to delete feature",
      });
    },
  });

  return {
    getFeatureByIdMutation,
    createFeatureMutation,
    updateFeatureMutation,
    deleteFeatureMutation,
  };
};
