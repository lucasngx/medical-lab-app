"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthHydration() {
  const { isHydrated } = useAuth();

  // No need to do anything here as the AuthContext handles hydration automatically
  useEffect(() => {
    // This hook is kept for compatibility, but it doesn't need to do anything
    // The AuthContext already hydrates on mount
    if (!isHydrated) {
      console.info("Auth context will auto-hydrate on mount");
    }
  }, [isHydrated]);
}
