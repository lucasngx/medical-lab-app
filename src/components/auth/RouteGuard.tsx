"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types';
import { authService } from '@/services/authService';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function RouteGuard({ children, allowedRoles = [] }: RouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
          router.push('/unauthorized');
        }
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  return <>{children}</>;
}
