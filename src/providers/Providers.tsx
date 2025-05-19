"use client";

import React from 'react';
import { ReduxProvider } from '@/store/ReduxProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ToastContainer position="top-right" autoClose={5000} />
      {children}
    </ReduxProvider>
  );
}