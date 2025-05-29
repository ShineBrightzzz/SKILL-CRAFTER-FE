'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import Loading from './Loading';

const publicRoutes = ['/login', '/register', '/', '/course', '/api', '/instructor'];

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Check if the current path or its parent is a public route
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname?.startsWith(`${route}/`)
      );
        if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
        return;
      }
        // For testing purposes, we're allowing all authenticated users to access all routes
      // regardless of their role
      
      /* Original role check code (commented out for testing)
      if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
        // Show an error message when a user tries to access a page they don't have permission for
        alert('Bạn không có quyền truy cập trang này');
        router.push('/'); // Redirect to home if user doesn't have required role
        return;
      }
      */
    }
  }, [isAuthenticated, isLoading, pathname, router, requiredRole, user]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}