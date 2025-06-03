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
import { useLazyGetAccountByIdQuery, useRefreshTokenMutation } from '@/services/user.service';
import { useLazyGetRolePermissionsQuery } from '@/services/role.service';
import { getAccessToken, setAccessToken } from '@/services/api';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [getUserById] = useLazyGetAccountByIdQuery();
  const [getPermissionByRole] = useLazyGetRolePermissionsQuery();
  const [refreshToken] = useRefreshTokenMutation();

  const handleAuthFailure = useCallback((shouldRedirect = true) => {
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
  }, [dispatch, router]);

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
          const permissions = await getPermissionByRole(
            userData?.data?.role?.id || 'user'
          ).unwrap();
          
          console.log("User permissions:", permissions);
          
          // Store token in ref
          tokenRef.current = token;
          setCurrentUserId(userId);
          
          // Update Redux store
          dispatch(setUser({
            id: userId,
            username: userData?.data?.username || '',
            // Don't store the token in Redux for security
            isAuthenticated: true
          }));
          
          // Dispatch permissions to ability slice
          dispatch(setAbility(permissions?.data || []));
          
          setIsAuthenticated(true);        
        } 
          else if (userId) {
          // If no token in memory but we have userId, try to refresh it using the HTTP-only cookie
          try {
            console.log('Attempting to refresh token in AuthProvider...');
            const result = await refreshToken().unwrap();
            console.log("Token refresh result:", result);
            
            if (result.data?.accessToken) {
              const newAccessToken = result.data.accessToken;
              console.log('Got new access token:', newAccessToken.substring(0, 10) + '...');
              
              // If refresh successful, update in-memory token
              setAccessToken(newAccessToken);
              tokenRef.current = newAccessToken;
              
              // Fetch user data with new token
              const userData = await getUserById(userId).unwrap();
              const permissions = await getPermissionByRole(
                userData?.data?.role?.id || 'user'
              ).unwrap();
              
              // Update Redux store
              dispatch(setUser({
                id: userId,
                username: userData?.data?.username || '',
                isAuthenticated: true
              }));
              
              // Dispatch permissions
              dispatch(setAbility(permissions?.data || []));
              setIsAuthenticated(true);
            } else {
              console.log("Token refresh failed");
              handleAuthFailure(false);
            }
          } catch (refreshError) {
            console.log("Error refreshing token:", refreshError);
            handleAuthFailure(false);
          }
        } else {
          console.log("No userId found");
          handleAuthFailure(false);
        }
      } catch (error) {
        console.log("Error during initialization:", error);
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch, getUserById, getPermissionByRole, refreshToken, handleAuthFailure]);
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
      
    } catch (error) {
      console.error('Error during sign in:', error);
      handleAuthFailure();
    }
  }, [handleAuthFailure]);

  const signOut = useCallback(async () => {
    handleAuthFailure(true);
  }, [handleAuthFailure]);

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