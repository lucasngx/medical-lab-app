import api from "@/services/api";
import { Role, LoginResponse, Organization, Doctor } from "@/types";
import { jwtDecode } from "jwt-decode";
import { AxiosHeaders } from "axios";

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
      console.log("Setting auth token:", {
        tokenPreview: `${token.substring(0, 10)}...${token.substring(token.length - 10)}`,
        hasToken: !!token,
        tokenLength: token.length
      });

      // Set token in localStorage
      localStorage.setItem(this.TOKEN_KEY, token);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const authHeader = api.defaults.headers.common['Authorization'];
      console.log("API headers after setting token:", {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: typeof authHeader === 'string' ? authHeader.substring(0, 20) + '...' : 'Not a string'
      });
      
      // Set token in cookie
      document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
    }
  }

  private clearAuthToken() {
    if (this.isClient) {
      console.log("Clearing auth token");
      
      // Clear token from localStorage
      localStorage.removeItem(this.TOKEN_KEY);
      
      // Clear token from API headers
      delete api.defaults.headers.common['Authorization'];
      console.log("API headers after clearing token:", {
        hasAuthHeader: !!api.defaults.headers.common['Authorization']
      });
      
      // Clear token from cookie
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log("Starting login process for:", email);
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
      
      console.log("Login response received:", {
        status: response.status,
        hasData: !!response.data,
        hasToken: !!response.data?.token
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
        console.error("Invalid login response - missing token");
        throw new Error("Invalid response: missing token");
      }

      // Set the token in API headers and storage
      this.setAuthToken(data.token);

      // Create user object from response data
      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId: 0, // This should come from your backend
        phone: data.phone,
        department: data.department,
        specialization: data.specialization,
        organizationName: data.organizationName
      };

      console.log("Created user data:", userData);

      // Create a default organization
      const defaultOrg: Organization = {
        id: 0,
        name: data.organizationName || "Default Organization",
        address: "",
        phone: "",
        email: "",
      };

      // Clear any existing data
      window.localStorage.clear();

      // Store user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      console.log("Stored user data in localStorage");

      // Return the expected LoginResponse format
      return {
        token: data.token,
        user: userData,
        organization: defaultOrg
      };
    } catch (error) {
      console.error("Login error:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error instanceof Error ? error : new Error("Login failed");
    }
  }

  logout(): void {
    console.log("Starting logout process");
    if (this.isClient) {
      this.clearAuthToken();
      window.localStorage.removeItem(this.USER_KEY);
      console.log("Cleared all auth data, redirecting to login");
      window.location.href = "/login";
    }
  }

  getToken(): string | null {
    if (!this.isClient) return null;
    const token = window.localStorage.getItem(this.TOKEN_KEY);
    const authHeader = api.defaults.headers.common['Authorization'];
    console.log("Getting auth token:", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : null,
      apiHeaders: {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: typeof authHeader === 'string' ? authHeader.substring(0, 20) + '...' : 'Not a string'
      }
    });
    return token;
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
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired (basic JWT check)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      // Invalid token format
      console.warn("Invalid token format:", error);
      this.logout();
      return false;
    }
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

  // Refresh authentication if needed
  async refreshAuth(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      await this.validateAuth();
    } catch (error) {
      console.error("Failed to refresh authentication:", error);
      this.logout();
      throw error;
    }
  }

  // Debug method to check authentication state
  debugAuthState(): void {
    if (!this.isClient) {
      console.log("Auth Debug: Not in client environment");
      return;
    }

    const token = this.getToken();
    const user = this.getCurrentUser();

    console.log("Auth Debug State:", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null,
      user,
      isAuthenticated: this.isAuthenticated(),
      localStorage: {
        authToken: !!localStorage.getItem(this.TOKEN_KEY),
        userData: !!localStorage.getItem(this.USER_KEY),
      },
      cookies: document.cookie.includes(this.TOKEN_KEY),
    });

    // Check if token is properly formatted JWT
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          console.log("Token Debug:", {
            isValidFormat: true,
            payload: payload,
            isExpired: payload.exp
              ? payload.exp < currentTime
              : "no expiration",
            expiresAt: payload.exp
              ? new Date(payload.exp * 1000).toISOString()
              : "no expiration",
          });
        } else {
          console.log("Token Debug: Invalid JWT format");
        }
      } catch (error) {
        console.log("Token Debug: Failed to parse token", error);
      }
    }
  }
}

export const authService = new AuthService();
export default authService;
