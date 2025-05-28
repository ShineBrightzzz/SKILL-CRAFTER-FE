'use client';

import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleOAuthWrapperProps {
  clientId: string;
  children: ReactNode;
}

export default function GoogleOAuthWrapper({ clientId, children }: GoogleOAuthWrapperProps) {
  return (
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
    >
      {children}
    </GoogleOAuthProvider>
  );
}
