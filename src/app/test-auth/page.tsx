// Test page to debug authentication issues
// Place this at /home/monochromatic/medical-lab-app/src/app/test-auth/page.tsx

"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { api } from "@/config/api";

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Get current auth state
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();

    setAuthState({
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token
        ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
        : null,
      user,
      isAuthenticated: isAuth,
    });

    // Run debug
    authService.debugAuthState();
  }, []);

  const testApiCall = async (endpoint: string) => {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await api.get(endpoint);
      const result = {
        endpoint,
        status: response.status,
        success: true,
        data: response.data,
        headers: response.headers,
      };
      setTestResults((prev) => [...prev, result]);
      console.log(`Success for ${endpoint}:`, result);
    } catch (error: any) {
      const result = {
        endpoint,
        status: error.response?.status || "Network Error",
        success: false,
        error: error.response?.data || error.message,
        headers: error.response?.headers,
      };
      setTestResults((prev) => [...prev, result]);
      console.log(`Error for ${endpoint}:`, result);
    }
  };

  const runTests = async () => {
    setTestResults([]);

    // Test various endpoints
    await testApiCall("/api/patients?page=0&size=10");
    await testApiCall("/api/patients");
    await testApiCall("/api/examinations?page=0&size=1");
    await testApiCall("/api/auth/me");
    await testApiCall("/api/doctors?page=0&size=1");
    await testApiCall("/api/technicians?page=0&size=1");
    await testApiCall("/api/medications?page=0&size=1");
  };

  const clearAuth = () => {
    authService.logout();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Authentication Debug Page</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <h2>Current Auth State</h2>
        <pre>{JSON.stringify(authState, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={runTests}
          style={{ marginRight: "10px", padding: "10px" }}
        >
          Run API Tests
        </button>
        <button
          onClick={clearAuth}
          style={{ marginRight: "10px", padding: "10px" }}
        >
          Clear Auth & Logout
        </button>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{ padding: "10px" }}
        >
          Go to Login
        </button>
      </div>

      <div>
        <h2>Test Results</h2>
        {testResults.map((result, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              backgroundColor: result.success ? "#e8f5e8" : "#f5e8e8",
            }}
          >
            <h3>{result.endpoint}</h3>
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            <p>
              <strong>Success:</strong> {result.success ? "Yes" : "No"}
            </p>
            {result.success ? (
              <details>
                <summary>Response Data</summary>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </details>
            ) : (
              <details>
                <summary>Error Details</summary>
                <pre>{JSON.stringify(result.error, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
