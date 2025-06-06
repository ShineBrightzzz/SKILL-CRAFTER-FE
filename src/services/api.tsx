import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout, setToken, setUser } from '@/store/slices/authSlice';

// Create a mutex for preventing multiple refresh token calls
const mutex = new Mutex();

// Access token stored in memory
let accessToken: string | null = null;

// Function to set the access token in memory
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Function to get the access token from memory
export const getAccessToken = () => accessToken;

// Function for development only - to store the refresh token for debugging
export const setDebugRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('refreshTokenForDebug', token);
  } else {
    localStorage.removeItem('refreshTokenForDebug');
  }
};

// Setup the base URL directly to the backend API
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: async (headers) => {
    try {
      // Use in-memory token instead of localStorage
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    } catch (error) {
      console.error('Error preparing headers:', error);
      return headers;
    }
  },
  credentials: 'include', // This ensures cookies are sent with requests
});

// Custom query with token refresh functionality
const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  // If the request failed with a 401 Unauthorized error
  if (result.error && result.error.status === 401) {
    // Check if the mutex is locked (refresh token request in progress)
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      
      try {
        
        // Make the refresh token call directly to the backend
        const refreshResult = await fetch(`${baseUrl}/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const refreshData = await refreshResult.json();

        if (refreshData.success && refreshData.data) {
          const { accessToken: newAccessToken, ...userData } = refreshData.data;

          if (newAccessToken) {
            
            // Store the new token in memory
            setAccessToken(newAccessToken);
            
            // Update Redux state with token
            api.dispatch(setToken(newAccessToken));
            
            // Update Redux state with user data if available
            if (userData) {
              api.dispatch(setUser(userData));
              // Store user ID in localStorage
              if (userData.id) {
                localStorage.setItem('userId', userData.id);
              }
            }
            
            // Retry the original request with new token
            result = await baseQuery(args, api, extraOptions);
          } else {
            console.error('Token refresh response did not contain a valid token');
            // If no token in response, log out
            api.dispatch(logout());
            setAccessToken(null);
            localStorage.removeItem('userId');
          }
        } else {
          console.error('Token refresh failed');
          api.dispatch(logout());
          setAccessToken(null);
          localStorage.removeItem('userId');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        api.dispatch(logout());
        setAccessToken(null);
        localStorage.removeItem('userId');
      } finally {
        release();
      }
    } else {
      // Wait for the mutex to be available again
      await mutex.waitForUnlock();
      // Retry the request
      result = await baseQuery(args, api, extraOptions);
    }
  }
  
  return result;
};

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['Permission', 'Roles', 'Chapters', 'Courses', 'Lessons', 'Categories', 'Users', 'CodeSubmits', 'TestCases', 'Cart', 'Payment', 'BlogComments', 'Blogs', 'Notifications'],
  endpoints: builder => ({}),
});

export default apiSlice;
