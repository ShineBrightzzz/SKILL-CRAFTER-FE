'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import Loading from './Loading';

const publicRoutes = ['/login', '/register', '/', '/course', '/api', '/blog', '/learning', '/verification-pending','/verify-email'];

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
      
      // If not authenticated and not on a public route, redirect to login
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
        return;
      }

      console.log(user?.isAdmin, 'user.isAdmin');
      
      // Check for admin access to admin pages
      const isAdminRoute = pathname?.startsWith('/admin');
      if (isAuthenticated && isAdminRoute && !user?.isAdmin) {
        // Show an error message when a user tries to access admin page without admin rights
        router.push('/'); // Redirect to home if user doesn't have admin access
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, requiredRole, user]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}