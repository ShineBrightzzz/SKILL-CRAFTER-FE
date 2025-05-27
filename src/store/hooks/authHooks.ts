import { useAppSelector } from '../hooks';
import { RootState } from '../store';

/**
 * Hook to access the current authentication state
 */
export const useAuth = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const error = useAppSelector((state: RootState) => state.auth.error);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error
  };
};
