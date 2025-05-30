"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Role } from "@/types";
import { jwtDecode } from "jwt-decode";
import { api } from "@/config/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  isHydrated: boolean;
  hasRole: (roles: Role | Role[]) => boolean;
}

interface DecodedToken {
  sub: string;
  iat: number;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load auth data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedToken = localStorage.getItem("auth_token");
        const savedUserStr = localStorage.getItem("user");

        if (savedToken && savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          
          // Validate token expiration
          try {
            const decodedToken = jwtDecode<DecodedToken>(savedToken);
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              throw new Error("Token expired");
            }
            
            setUser(savedUser);
            setToken(savedToken);
            setIsAuthenticated(true);
            
            // Set the token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          } catch (error) {
            console.error("Token validation failed:", error);
            // Clear invalid token
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error("Error loading auth from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common['Authorization'];
      }

      setIsHydrated(true);
    }
  }, []);

  // Role-based permission check
  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const data = response.data;
      console.log("Login response:", data);

      // Extract data from the response
      const { 
        token,
        email: userEmail,
        name,
        role,
        id,
        phone,
        department,
        specialization,
        organizationName
      } = data;

      if (!id) {
        throw new Error("Invalid user data received from server");
      }

      // Create user object from response data
      const userData: User = {
        id: Number(id),
        email: userEmail,
        name,
        role: role as Role,
        organizationId: 0,
        phone: phone || undefined,
        department: department || undefined,
        specialization: specialization || undefined,
        organizationName: organizationName || undefined
      };

      console.log("Created user data:", userData);

      // Set the token in API headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("Set API authorization header:", {
          hasToken: !!token,
          tokenPreview: `${token.substring(0, 10)}...${token.substring(token.length - 10)}`,
          headers: api.defaults.headers
        });
      }

      // Save to state
      setUser(userData);
      setToken(token);
      setIsAuthenticated(true);

      // Save to localStorage and cookies
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;

      if (rememberMe) {
        localStorage.setItem("saved_email", email);
        localStorage.setItem("saved_password", password);
      } else {
        localStorage.removeItem("saved_email");
        localStorage.removeItem("saved_password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      setIsAuthenticated(false);
      
      // Clear any partial state
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Clear from localStorage and cookies
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";

    // Clear API headers
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    isHydrated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
