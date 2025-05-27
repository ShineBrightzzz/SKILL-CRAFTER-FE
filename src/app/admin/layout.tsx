'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <>
      {children}
    </>
  );
}
