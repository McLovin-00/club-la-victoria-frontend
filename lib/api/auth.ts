import apiClient from "./client";
import { jwtDecode } from "jwt-decode";
import { setToken, getToken, clearAuthData } from "@/lib/utils/token-storage";

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await apiClient.post<string>("/auth/login", credentials);
      const token = response.data;
      if (token) {
        setToken(token);
      }
      return token;
    } catch (error) {
      throw error;
    }
  },

  logout(): void {
    clearAuthData();
  },

  getToken(): string | null {
    return getToken();
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Basic validation: a JWT must have three parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid token format: not a JWT");
      this.logout();
      return false;
    }

    try {
      // Decode the token to check expiration (exp is optional)
      const decoded = jwtDecode<{ exp?: number }>(token);
      if (decoded && typeof decoded.exp === "number") {
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          this.logout();
          return false;
        }
      }

      return true;
    } catch (error) {
      // Keep a concise log but avoid noisy stack traces in normal flow
      console.warn("Error validating token:", (error as Error).message ?? error);
      this.logout();
      return false;
    }
  },
};
