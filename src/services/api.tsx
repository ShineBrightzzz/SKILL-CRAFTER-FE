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
    console.log('Debug refresh token set:', token.substring(0, 8) + '...');
  } else {
    localStorage.removeItem('refreshTokenForDebug');
    console.log('Debug refresh token removed');
  }
};

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
        console.log('Attempting to refresh token...');
        
        // Get the debug refresh token from localStorage if available
        const manualRefreshToken = localStorage.getItem('refreshTokenForDebug');
        
        if (manualRefreshToken) {
          console.log('Using debug refresh token:', manualRefreshToken.substring(0, 8) + '...');
        }
        
        const refreshResult = await fetch('/api/refresh-token', {
          method: 'POST',
          credentials: 'include', // Important to include cookies
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: manualRefreshToken ? JSON.stringify({ refreshToken: manualRefreshToken }) : JSON.stringify({}), // Send empty object if no token in body
        }).then(async res => {
          // Log the raw response status
          console.log('Refresh token response status:', res.status);
          
          // If response is not successful, throw an error to be caught below
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Refresh token request failed:', res.status, errorText);
            throw new Error(`Refresh token request failed: ${res.status} - ${errorText}`);
          }
          
          // If it's not JSON, try to get the text
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const jsonData = await res.json();
            console.log('Refresh token JSON response:', JSON.stringify(jsonData, null, 2));
            return jsonData;
          } else {
            const text = await res.text();
            console.log('Refresh token response text:', text);
            try {
              const parsed = JSON.parse(text);
              console.log('Parsed JSON from text response:', JSON.stringify(parsed, null, 2));
              return parsed;
            } catch (e) {
              console.error('Error parsing JSON:', e);
              return { success: false, error: 'Invalid JSON response' };
            }
          }
        }).catch(error => {
          console.error('Error during refresh token fetch:', error);
          return { success: false, error: error.message || 'Unknown error during token refresh' };
        });
        
        console.log('Refresh token result:', refreshResult);
        
        // Try to extract the access token and refresh token from various possible response structures
        let newAccessToken = null;
        let newRefreshToken = null;
        let userData = null;
        
        if (refreshResult) {
          console.log('Refresh result structure:', JSON.stringify(refreshResult, null, 2));
          
          // Case 1: { success: true, data: { accessToken: "...", refreshToken: "..." } }
          if (refreshResult.success && refreshResult.data) {
            userData = refreshResult.data;
            if (refreshResult.data.accessToken) {
              newAccessToken = refreshResult.data.accessToken;
            }
            if (refreshResult.data.refreshToken) {
              newRefreshToken = refreshResult.data.refreshToken;
            }
          } 
          // Case 2: Direct data object { accessToken: "...", refreshToken: "..." }
          else if (refreshResult.accessToken) {
            userData = refreshResult;
            newAccessToken = refreshResult.accessToken;
            if (refreshResult.refreshToken) {
              newRefreshToken = refreshResult.refreshToken;
            }
          }
          // Case 3: { data: { data: { accessToken: "...", refreshToken: "..." } } }
          else if (refreshResult.data && refreshResult.data.data) {
            userData = refreshResult.data.data;
            const dataObject = refreshResult.data.data;
            if (dataObject.accessToken) {
              newAccessToken = dataObject.accessToken;
            }
            if (dataObject.refreshToken) {
              newRefreshToken = dataObject.refreshToken;
            }
          }
          
          // Store the new refresh token if available
          if (newRefreshToken) {
            console.log('Got new refresh token:', newRefreshToken.substring(0, 8) + '...');
            
            // Store for development/debugging
            localStorage.setItem('refreshTokenForDebug', newRefreshToken);
            
            // Update the HTTP-only cookie with the new refresh token
            try {
              const cookieResponse = await fetch('/api/set-refresh-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: newRefreshToken }),
                credentials: 'include',
              });
              
              if (!cookieResponse.ok) {
                console.error('Error updating refresh token cookie. Status:', cookieResponse.status);
                const errorText = await cookieResponse.text();
                console.error('Error details:', errorText);
              } else {
                console.log('Successfully updated refresh token cookie');
              }
            } catch (err) {
              console.error('Exception while updating refresh token cookie:', err);
            }
          } else {
            console.log('No new refresh token received from server');
          }
        }
        
        if (newAccessToken) {
          console.log('Got new access token:', newAccessToken.substring(0, 10) + '...');
          
          // Store the new token in memory
          setAccessToken(newAccessToken);
          
          // Update Redux state with token
          api.dispatch(setToken(newAccessToken));
          
          // Update Redux state with user data if available
          if (userData) {
            api.dispatch(setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email,
              email_verified: userData.email_verified,
              family_name: userData.family_name,
              given_name: userData.given_name,
            }));
            // Store user ID in localStorage
            localStorage.setItem('userId', userData.id);
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
