'use client';

import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, logout } from '@/store/slices/authSlice';
import { setAbility } from '@/store/slices/abilitySlice';
import { useLazyGetAccountByIdQuery, useRefreshTokenMutation, User } from '@/services/user.service';
import { useLazyGetRolePermissionsQuery } from '@/services/role.service';
import { useLogoutMutation } from '@/services/auth.service';
import { Permission } from '@/services/permission.service';
import { getAccessToken, setAccessToken } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

// Interface for decoded JWT token
interface DecodedToken {
  exp: number; // Expiration time (in seconds since Unix epoch)
  sub: string; // Subject (usually user ID)
  // Add other claims as needed
}

// Interface for token refresh timer
interface RefreshTimerInfo {
  timerId: NodeJS.Timeout | null;
  expiresAt: number | null;
  refreshing: boolean;
}

interface PermissionResponse {
  result: Permission[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface AuthContextType {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  token: MutableRefObject<string | null>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  token: { current: null } as MutableRefObject<string | null>,
  isLoading: true,
  isAuthenticated: false,
});

export { AuthContext };

export const useAuthSession = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {  const tokenRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const refreshTimerRef = useRef<RefreshTimerInfo>({ timerId: null, expiresAt: null, refreshing: false });
  const dispatch = useDispatch();
  const router = useRouter();
  const [getUserById] = useLazyGetAccountByIdQuery();
  const [getPermissionByRole] = useLazyGetRolePermissionsQuery();
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutApi] = useLogoutMutation();

  // Helper function to decode JWT token and extract expiration time
  const getTokenExpirationTime = useCallback((token: string): number | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000; // Convert from seconds to milliseconds
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);
  // Function to handle authentication failures
  const handleAuthFailure = useCallback((shouldRedirect = true) => {
    // Clear token refresh timer
    if (refreshTimerRef.current.timerId) {
      clearTimeout(refreshTimerRef.current.timerId);
      refreshTimerRef.current = { timerId: null, expiresAt: null, refreshing: false };
    }
    
    // Clear in-memory token
    setAccessToken(null);
    // Clear localStorage
    localStorage.removeItem('userId');
    // Clear tokenRef
    tokenRef.current = null;
    setCurrentUserId(null);
    // Clear Redux state
    dispatch(logout());
    dispatch(setAbility([])); // Clear permissions when logged out
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        router.push('/login');
      }
    }
  }, [dispatch, router]);  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    if (!currentUserId) {
      return null;
    }
    
    // Check if we already have a pending refresh request
    if (refreshTimerRef.current.refreshing) {
      return null;
    }
    
    try {
      // Mark that we're in the process of refreshing
      refreshTimerRef.current.refreshing = true;
      
      const result = await refreshToken().unwrap();
      
      if (result.data?.accessToken) {
        const newAccessToken = result.data.accessToken;
        
        // Update in-memory token
        setAccessToken(newAccessToken);
        tokenRef.current = newAccessToken;
        
        // Clear any existing timer before scheduling a new one
        if (refreshTimerRef.current.timerId) {
          clearTimeout(refreshTimerRef.current.timerId);
          refreshTimerRef.current.timerId = null;
        }
        
        // Schedule the next refresh
        const expirationTime = getTokenExpirationTime(newAccessToken);
        if (expirationTime) {
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;
          const refreshDelay = Math.max(timeUntilExpiry - 60000, 1000); // At least 1 second delay
          
          
          refreshTimerRef.current = {
            timerId: setTimeout(() => refreshAccessToken(), refreshDelay),
            expiresAt: expirationTime,
            refreshing: false
          };
        } else {
          console.error(`[${new Date().toLocaleString()}] Could not determine expiration time for new token`);
          refreshTimerRef.current.refreshing = false;
        }
        
        
        return newAccessToken;
      } else {
        console.error('Token refresh failed: No access token in response');
        handleAuthFailure(false);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleAuthFailure(false);
    } finally {
      // Clear the refreshing flag if it hasn't been done already
      if (refreshTimerRef.current) {
        refreshTimerRef.current.refreshing = false;
      }
    }
    
    return null;
  }, [currentUserId, refreshToken, handleAuthFailure, getTokenExpirationTime]);
  // Function to schedule token refresh 1 minute before expiration
  const scheduleTokenRefresh = useCallback((token: string) => {
    // Clear any existing timer
    if (refreshTimerRef.current.timerId) {
      clearTimeout(refreshTimerRef.current.timerId);
      refreshTimerRef.current.timerId = null;
    }

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
      console.error('Could not determine token expiration time');
      return;
    }

    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // If token is already expired or will expire in less than 1 minute, refresh immediately
    if (timeUntilExpiry <= 60000) {
      refreshAccessToken();
      return;
    }
    
    // Schedule refresh 1 minute before expiration
    const refreshDelay = timeUntilExpiry - 60000; // 1 minute before expiry
    
    
    refreshTimerRef.current = {
      timerId: setTimeout(() => refreshAccessToken(), refreshDelay),
      expiresAt: expirationTime,
      refreshing: refreshTimerRef.current.refreshing
    };  }, [getTokenExpirationTime, refreshAccessToken]);
  // Handle browser visibility changes to manage token refresh
  useEffect(() => {
    // Function to check and possibly refresh token when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = tokenRef.current;
        if (token) {
          const expirationTime = getTokenExpirationTime(token);
          if (expirationTime) {
            const now = Date.now();
            // If token expires in less than 10 minutes, refresh it proactively
            if (expirationTime - now < 600000) {
              refreshAccessToken().then(newToken => {
                if (newToken) {
                } else {
                }
              });
            } else {
              // Ensure the refresh timer is properly scheduled
              if (!refreshTimerRef.current.timerId) {
                scheduleTokenRefresh(token);
              }
            }
          }
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getTokenExpirationTime, refreshAccessToken, scheduleTokenRefresh]);
  // Effect to automatically refresh token periodically even when app is active
  useEffect(() => {
    // Auto check token status every 5 minutes when app is running
    const intervalId = setInterval(() => {
      const token = tokenRef.current;
      if (token) {
        const expirationTime = getTokenExpirationTime(token);
        if (expirationTime) {
          const now = Date.now();
          const timeUntilExpiry = expirationTime - now;
          
          // If token will expire in the next 5 minutes, refresh it
          if (timeUntilExpiry <= 300000) { // 5 minutes in milliseconds
            refreshAccessToken();
          } else {
            // Ensure the refresh timer is properly scheduled for future refresh
            if (!refreshTimerRef.current.timerId) {
              scheduleTokenRefresh(token);
            }
          }
        }
      }
    }, 300000); // Check every 5 minutes
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [getTokenExpirationTime, refreshAccessToken]);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Check for userId in localStorage
        const userId = localStorage.getItem('userId');
        
        // Check for access token in memory
        const token = getAccessToken();
        
        if (token && userId) {
          // If we have both access token and userId, fetch user data          
          const userData = await getUserById(userId).unwrap();
          // Type assertion to match the actual API response structure
          const userInfo = userData?.data as unknown as User;
          
          // Update user in Redux store with complete data
          dispatch(setUser({
            id: userInfo.id,
            username: userInfo.username,
            email: userInfo.email,
            familyName: userInfo.familyName,            
            givenName: userInfo.givenName,
            pictureUrl: userInfo.pictureUrl,
            roleId: userInfo.roleId,
            isAdmin: userInfo.isAdmin
          }));

          // Handle permissions
          if (userInfo.roleId) {
            const permissions = await getPermissionByRole(String(userInfo.roleId)).unwrap();
            dispatch(setAbility(permissions?.data || []));
          }

          // Store token in ref
          tokenRef.current = token;
          setCurrentUserId(userId);
          setIsAuthenticated(true);
          
          // Schedule token refresh based on expiration time
          scheduleTokenRefresh(token);
        } else if (userId) {
          // If no token in memory but we have userId, try to refresh it using the HTTP-only cookie
          try {
            const result = await refreshToken().unwrap();
            
            if (result.data?.accessToken) {
              const newAccessToken = result.data.accessToken;
              
              // If refresh successful, update in-memory token
              setAccessToken(newAccessToken);
              tokenRef.current = newAccessToken;
              
              // Fetch user data with new token
              const userData = await getUserById(userId).unwrap();
              // Type assertion to match the actual API response structure
              const userInfo = userData?.data as unknown as User;

              // Update Redux store
              dispatch(setUser({
                id: userId,
                username: userInfo?.username || '',
                email: userInfo?.email,
                familyName: userInfo?.familyName,
                givenName: userInfo?.givenName,
                pictureUrl: userInfo?.pictureUrl,
                roleId: userInfo.roleId,
                isAdmin: userInfo.isAdmin
              }));

              // Get and dispatch permissions if roleId exists
              if (userInfo.roleId) {
                const permissions = await getPermissionByRole(String(userInfo.roleId)).unwrap();
                dispatch(setAbility(permissions?.data || []));
              }

              setIsAuthenticated(true);
              
              // Schedule token refresh based on expiration time
              scheduleTokenRefresh(newAccessToken);
            } else {
              handleAuthFailure(false);
            }
          } catch (refreshError) {
            handleAuthFailure(false);
          }
        } else {
          handleAuthFailure(false);
        }
      } catch (error) {
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch, getUserById, getPermissionByRole, refreshToken, handleAuthFailure, scheduleTokenRefresh]);

  const signIn = useCallback(async (token: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No userId found');
      }

      // Store token in memory instead of localStorage
      setAccessToken(token);
      tokenRef.current = token;
      setCurrentUserId(userId);
      
      // Schedule token refresh based on expiration time
      scheduleTokenRefresh(token);
    } catch (error) {
      console.error('Error during sign in:', error);
      handleAuthFailure();
    }
  }, [handleAuthFailure, scheduleTokenRefresh]);

  const signOut = useCallback(async () => {
    try {
      // Call the logout API endpoint
      await logoutApi().unwrap();
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      // Always clear local state even if API call fails
      handleAuthFailure(true);
    }
  }, [logoutApi, handleAuthFailure]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        token: tokenRef,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
