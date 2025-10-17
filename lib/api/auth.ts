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

    try {
      // Decode the token to check expiration
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      // If token is expired, remove it
      if (isExpired) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      this.logout();
      return false;
    }
  },
};
