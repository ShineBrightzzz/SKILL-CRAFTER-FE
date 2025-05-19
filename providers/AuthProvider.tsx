// This file is deprecated and has been replaced by Redux auth implementation.
// Please use the useAuth hook from @/store/hooks instead

import { useAuth } from '@/store/hooks';

export { useAuth };

// Keeping this export for backward compatibility
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Just pass through children since auth is now handled by Redux
  return <>{children}</>;
};
