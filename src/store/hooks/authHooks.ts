import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { RootState } from '../store';
import { logout as logoutAction } from '../slices/authSlice';
import * as authActions from '../slices/authSlice';

/**
 * Hook to access the current authentication state
 */
export const useAuth = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const error = useAppSelector((state: RootState) => state.auth.error);
    const dispatch = useAppDispatch();
  
  const logout = useCallback(() => {
    dispatch(authActions.logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout
  };
};
