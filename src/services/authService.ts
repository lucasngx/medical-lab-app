import api from "./api";
import { Role } from "@/types";

interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user";
  private readonly isClient = typeof window !== "undefined";

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

      if (!this.isClient) {
        return response.data;
      }

      const { data } = response;

      if (!data || !data.token) {
        throw new Error("Invalid response: missing token");
      }

      // Clear any existing data
      window.localStorage.clear();

      // Store token
      localStorage.setItem(this.TOKEN_KEY, data.token);

      // Store user data
      const userData = {
        email: data.email,
        role: data.role,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

      // Set cookie
      document.cookie = `${this.TOKEN_KEY}=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure`;

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error instanceof Error ? error : new Error("Login failed");
    }
  }

  logout(): void {
    if (this.isClient) {
      window.localStorage.removeItem(this.TOKEN_KEY);
      window.localStorage.removeItem(this.USER_KEY);
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
      window.location.href = "/login";
    }
  }

  getToken(): string | null {
    if (!this.isClient) return null;
    return window.localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): { email: string; role: Role } | null {
    if (!this.isClient) return null;
    try {
      const userData = window.localStorage.getItem(this.USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error reading user data:", error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Add method for organization data (if needed by components)
  getOrganization(): unknown {
    if (!this.isClient) return null;
    try {
      const orgData = window.localStorage.getItem("organization");
      if (!orgData) return null;
      return JSON.parse(orgData);
    } catch (error) {
      console.error("Error reading organization data:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
