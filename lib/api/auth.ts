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
      // invalid token format (not a JWT) - console logging removed
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
      // Error validating token - console logging removed
      this.logout();
      return false;
    }
  },
};
