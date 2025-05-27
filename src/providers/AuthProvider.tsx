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
import { useLazyGetAccountByIdQuery } from '@/services/user.service';

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

  const handleAuthFailure = useCallback((shouldRedirect = true) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    tokenRef.current = null;
    setCurrentUserId(null);
    dispatch(logout());
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
        
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
          const userData = await getUserById(userId).unwrap();
          
          tokenRef.current = token;
          setCurrentUserId(userId);
          dispatch(setUser({
            id: userId,
            username: userData?.data?.username || '',
            accessToken: token,
            isAuthenticated: true
          }));
          setIsAuthenticated(true);
        } else {
          console.log("No token or userId found");
          handleAuthFailure(false);
        }
      } catch (error) {
        console.log("Error during initialization:", error);
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (token: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No userId found');
      }

      localStorage.setItem('accessToken', token);
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