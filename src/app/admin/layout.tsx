'use client';

import React from 'react';
import { AuthProvider } from '../../../providers/AuthProvider';
import AuthGuard from '@/components/AuthGuard';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AuthGuard requiredRole="admin">
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
