'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import Loading from './Loading';

const publicRoutes = ['/login', '/register', '/', '/course', '/api'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Check if the current path or its parent is a public route
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname?.startsWith(`${route}/`)
      );
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return <Loading />;
  }

  return <>{children}</>;
}