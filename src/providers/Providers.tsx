"use client";

import React from 'react';
import AuthProvider from '@/providers/AuthProvider';
import { ReduxProvider } from '@/store/ReduxProvider';
import { AbilityProvider } from '@/providers/AbilityProvider';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        <ReduxProvider>
        <AuthProvider>
            <AbilityProvider>
            {children}
            </AbilityProvider>
        </AuthProvider>
        </ReduxProvider>
    </Provider>
  );
}