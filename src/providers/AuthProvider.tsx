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

import { setUser, clearUser } from '@/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { setAbility } from '@/store/slices/abilitySlice';
import { useGetUserPermissionsQuery, useLazyGetUserInfoQuery, useLazyGetUserPermissionsQuery } from '@/services/user.service';
const AuthContext = createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  token: MutableRefObject<string | null> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}>( {
  signIn: () => null,
  signOut: () => null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
});

// Hook sử dụng context
export function useAuthSession() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const tokenRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [fetchUserInfo, { isError }] = useLazyGetUserInfoQuery();
  const [getUserPermissions] = useLazyGetUserPermissionsQuery();

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        // Use localStorage for browser instead of AsyncStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        tokenRef.current = token || '';
        
        if (token) {
          // Fetch user data to validate token
          const userId = localStorage.getItem('userId');
          console.log("User ID:", userId);
          const user = await fetchUserInfo({ userId }).unwrap();
          const data  = await getUserPermissions({studentId : userId}).unwrap();

          if (user && !isError) {
            dispatch(setUser({
              ...user.data,
              isAuthenticated: true
            }));
            setIsAuthenticated(true);
            dispatch(setAbility(data?.data?.data || []));
          } else {
            // Token is invalid or expired
            console.log("Token invalid or expired");
            if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
            tokenRef.current = null;
            dispatch(clearUser());
            router.push('/login');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.log("Error validating token:", error);
        // Handle error - token validation failed
        if (typeof window !== 'undefined'){
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
        }

        tokenRef.current = null;
        dispatch(clearUser());
        router.push('/login');
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
    tokenRef.current = token;
    setIsAuthenticated(true);
    router.push('/');
  }, [router]);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
    tokenRef.current = null;
    setIsAuthenticated(false);
    dispatch(clearUser());
    router.push('/login');
  }, [dispatch, router]);

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
