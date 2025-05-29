"use client";

import AuthStatusDebug from "@/components/auth/AuthStatusDebug";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { useState } from "react";

export default function AuthDebugPage() {
  const [showRawStorage, setShowRawStorage] = useState(false);
  const [storageData, setStorageData] = useState<Record<string, string>>({});

  // Use the auth hydration hook
  useAuthHydration();

  const fetchStorageData = () => {
    if (typeof window !== "undefined") {
      const data: Record<string, string> = {};

      // Get all localStorage items related to auth
      const token = localStorage.getItem("auth_token") || "";
      const user = localStorage.getItem("user") || "";

      data["auth_token"] = token;
      data["user"] = user;

      setStorageData(data);
      setShowRawStorage(true);
    }
  };

  const clearAuthData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // Refresh the storage display
      fetchStorageData();
      // Force a page reload to clear state
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <p className="mb-4 text-gray-600">
        This page helps to diagnose authentication issues by showing the current
        state of authentication data in Context and localStorage.
      </p>

      <AuthStatusDebug />

      <div className="flex space-x-2 mb-4">
        <button
          onClick={fetchStorageData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Raw Storage Data
        </button>

        <button
          onClick={clearAuthData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Auth Data
        </button>
      </div>

      {showRawStorage && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <h3 className="text-lg font-medium mb-2">Raw Storage Data</h3>
          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps</h2>
        <ul className="list-disc ml-5 space-y-2">
          <li>Check if the token exists in localStorage</li>
          <li>Verify the user data is properly stored and parsable</li>
          <li>Ensure Context state is correctly hydrated from localStorage</li>
          <li>
            If issues persist, try clearing auth data and logging in again
          </li>
        </ul>
      </div>
    </div>
  );
}
