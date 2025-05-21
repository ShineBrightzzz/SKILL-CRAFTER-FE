import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  updateUser,
  User
} from '@/store/slices/authSlice';

// Custom hook for authentication operations
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  // Login handler
  const handleLogin = useCallback(async (loginResponse: any) => {
    try {
      dispatch(loginStart());
        // Process the login response
      if (loginResponse?.statusCode === 200 && loginResponse?.data) {
        const userData: User = {
          id: loginResponse.data.id,
          username: loginResponse.data.username,
          accessToken: loginResponse.data.accessToken,
          role: loginResponse.data.role || 'user',
          // Add any other user properties you need
        };
        
        dispatch(loginSuccess(userData));
        return { success: true };
      } else {
        const errorMessage = loginResponse?.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as Error)?.message || 'An unexpected error occurred';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Logout handler
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  // Update user information
  const updateUserInfo = useCallback((userInfo: Partial<User>) => {
    dispatch(updateUser(userInfo));
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateUserInfo
  };
};
