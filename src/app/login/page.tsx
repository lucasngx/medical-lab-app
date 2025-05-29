"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/config/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      console.log("Already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Log the state before login attempt
      console.log("Attempting login with:", { email });
      
      // Get the raw response from the API
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      console.log("Raw login response:", response.data);

      // Now call the login function with the credentials
      await login(email, password);

      // Get redirect path
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/dashboard";
      const cleanRedirectPath = decodeURIComponent(redirectTo).replace(
        /^\/+|\/+$/g,
        ""
      );

      console.log("Login successful, redirecting to:", cleanRedirectPath);
      
      // Use Next.js router for client-side navigation
      router.push("/" + cleanRedirectPath);
      
      // Fallback to window.location if router.push doesn't work
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          console.log("Router navigation failed, using window.location");
          window.location.href = "/" + cleanRedirectPath;
        }
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Invalid email or password"
      );
      setIsLoading(false);
    }
  };

  // Don't render the login form if not hydrated yet
  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  // Don't render the login form if already authenticated
  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Medical Lab System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your organization account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
