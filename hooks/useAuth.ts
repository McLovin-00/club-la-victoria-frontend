import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, LoginCredentials } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { ROUTES } from "@/lib/routes";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: () => {
      // Invalidate any auth-related queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      toast.success("Sesión iniciada correctamente");

      // Redirect to dashboard or home after successful login
      router.replace(ROUTES.MEMBERS.LIST);
    },
    onError: (error) => {
      logError(error, "useCreateSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries and reset the cache
      queryClient.clear();
      // Redirect to login page after logout
      router.replace(ROUTES.LOGIN);
    },
  });
};
