"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RouteGuard from "@/components/auth/RouteGuard";
import { authService } from "@/services/authService";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      const user = authService.getCurrentUser();
      console.log("Protected Layout - Current User:", user);
    };

    checkAuth();
  }, [router]);

  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  );
}
