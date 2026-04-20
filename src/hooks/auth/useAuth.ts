/* Relative Imports */
import { useMutation } from "@tanstack/react-query";

/* Local Imports */
import Toast from "@/components/toast";
import { type SignInRequest, signInRequest } from "@/services/auth";

// ----------------------------------------------------------------------

export const useAuth = (): any => {
  const signInMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }: SignInRequest) => {
      const response = await signInRequest({ email, password, rememberMe });
      if (response.status.response_code === 200) {
        return response;
      }
    },
    onSuccess: (response: any) => {
      Toast.success({ message: "Success", description: response.message });
    },
    onError: (error: any) => {
      Toast.error({
        message: "Error",
        description: error?.response?.data?.message,
      });
    },
  });

  return {
    signInMutation,
  };
};
