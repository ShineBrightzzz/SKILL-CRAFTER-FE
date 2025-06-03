import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout, setToken } from '@/store/slices/authSlice';

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

// Determine if we should use the proxy based on environment
const useProxy = process.env.NODE_ENV === 'development';

// Setup the base URL - in development, use our proxy to avoid CORS issues
const baseUrl = useProxy ? '/api/proxy' : process.env.NEXT_PUBLIC_API_URL;

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
  
  responseHandler: async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/plain')) {
      const text = await response.text();
      return { message: text };
    }
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  },
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
        // Try to refresh the token
        const refreshResult = await baseQuery(
          { url: '/refresh-token', method: 'POST' },
          api,
          extraOptions
        );
        
        if (refreshResult.data && typeof refreshResult.data === 'object') {
          // If token refresh was successful
          const data = refreshResult.data as any;
          if (data.success && data.data && data.data.accessToken) {
            const newAccessToken = data.data.accessToken;
            
            // Store the new token in memory
            setAccessToken(newAccessToken);
            
            // Update Redux state
            api.dispatch(setToken(newAccessToken));
            
            // Retry the original request with new token
            result = await baseQuery(args, api, extraOptions);
          } else {
            // If no token in response, log out
            api.dispatch(logout());
            setAccessToken(null);
          }
        } else {
          // If refresh token request fails, log the user out
          api.dispatch(logout());
          setAccessToken(null);
        }
      } finally {
        // Release the mutex
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
  tagTypes: ['Permission', 'Roles', 'Chapters', 'Courses', 'Lessons', 'Categories', 'Users', 'CodeSubmits', 'TestCases', 'Cart', 'Payment', 'BlogComments', 'Blogs'],
  endpoints: builder => ({}),
});

export default apiSlice;
