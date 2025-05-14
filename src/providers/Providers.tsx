"use client";

import React from 'react';
import { ReduxProvider } from '@/store/ReduxProvider';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        <ReduxProvider>
            {children}
        </ReduxProvider>
    </Provider>
  );
}