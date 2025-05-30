import api from "@/services/api";
import { Role, LoginResponse, Organization, Doctor } from "@/types";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  iat: number;
  exp: number;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user";
  private readonly isClient = typeof window !== "undefined";

  private setAuthToken(token: string) {
    if (this.isClient) {
      // Set token in localStorage
      localStorage.setItem(this.TOKEN_KEY, token);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  private clearAuthToken() {
    if (this.isClient) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<{
        token: string;
        email: string;
        name: string;
        role: Role;
        id: number;
        phone?: string;
        department?: string;
        specialization?: string;
        organizationName?: string;
      }>("/api/auth/login", {
        email,
        password,
      });

      if (!this.isClient) {
        const { data } = response;
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          organizationId: 0,
          phone: data.phone,
          department: data.department,
          specialization: data.specialization,
          organizationName: data.organizationName
        };
        const defaultOrg: Organization = {
          id: 0,
          name: data.organizationName || "Default Organization",
          address: "",
          phone: "",
          email: "",
        };
        return {
          token: data.token,
          user: userData,
          organization: defaultOrg
        };
      }

      const { data } = response;

      if (!data || !data.token) {
        throw new Error("Invalid response: missing token");
      }

      // Set the token in API headers and storage
      this.setAuthToken(data.token);

      // Store user data
      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId: 0,
        phone: data.phone,
        department: data.department,
        specialization: data.specialization,
        organizationName: data.organizationName
      };

      if (this.isClient) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      }

      const defaultOrg: Organization = {
        id: 0,
        name: data.organizationName || "Default Organization",
        address: "",
        phone: "",
        email: "",
      };

      return {
        token: data.token,
        user: userData,
        organization: defaultOrg
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  logout() {
    this.clearAuthToken();
    if (this.isClient) {
      window.location.href = "/login";
    }
  }

  isAuthenticated(): boolean {
    if (!this.isClient) return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser() {
    if (!this.isClient) return null;
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Validate current authentication status with the server
  async validateAuth(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await api.get("/api/auth/me");
      return !!response.data;
    } catch (error) {
      console.warn("Authentication validation failed:", error);
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
