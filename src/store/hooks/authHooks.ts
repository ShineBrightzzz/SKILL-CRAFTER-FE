import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { RootState } from '../store';
import { logout as logoutAction } from '../slices/authSlice';
import * as authActions from '../slices/authSlice';
import { setAccessToken } from '@/services/api';
import { useLogoutMutation } from '@/services/user.service';
import { Modal } from 'antd';

/**
 * Hook to access the current authentication state
 */
export const useAuth = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const error = useAppSelector((state: RootState) => state.auth.error);
  const dispatch = useAppDispatch();
  
  // Use the API-based logout
  const [logoutApi] = useLogoutMutation();
  
  const logout = useCallback(async () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất không?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Call the logout API which will clear the HTTP-only cookie
          await logoutApi().unwrap();
        } catch (error) {
          console.error('Error during logout API call:', error);
        } finally {
          // Always clear local state even if API call fails
          dispatch(authActions.logout());
          setAccessToken(null);
          localStorage.removeItem('userId');
          // Reload the page after logout
          window.location.reload();
        }
      }
    });
  }, [dispatch, logoutApi]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout
  };
};
