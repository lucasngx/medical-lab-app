"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({
  children,
}: RouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}
