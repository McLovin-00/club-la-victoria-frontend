import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, LoginCredentials } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
      router.push("/socios");
    },
    onError: (error) => {
      if (error instanceof AxiosError && !error.response?.data) {
        toast.error("Error de red");
      }
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
      router.push("/login");
    },
  });
};
