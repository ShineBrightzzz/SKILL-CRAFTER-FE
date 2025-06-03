import { setUser, setToken } from '@/store/slices/authSlice';
import apiSlice, { setAccessToken, setDebugRefreshToken } from './api';
import type { AuthResponse } from '@/types/auth';

// Define types
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  active?: boolean;
}

// Role assignment DTO
export interface RoleAssignmentDTO {
  roleId?: string;
  roleName?: string;
}

// Account update DTO
export interface AccountUpdateDTO {
  username?: string;
  password?: string;
  email?: string;
  fullName?: string;
  role?: string;
}

// Register account DTO
export interface RegisterAccountDTO {
  username: string;
  password: string;
  email: string;
  fullName?: string;
}

export interface UserPermission {
  id: string;
  name: string;
  description?: string;
}

// Response type for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({    login: builder.mutation<AuthResponse, { username: string; password: string; recaptchaToken?: string | null }>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
        credentials: 'include', // Ensure cookies are sent and received
      }),      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;

          // Store access token in memory instead of localStorage
          setAccessToken(data.accessToken);
          
          // Store user ID in localStorage (this doesn't need to be secure)
          localStorage.setItem('userId', data.id);
            // Remove any old tokens from localStorage if they exist
          localStorage.removeItem('accessToken');
            // Store the refresh token in a cookie (this will be done via document.cookie)
          // Using HttpOnly cookie would be best but can only be set by the server
          if (data.refreshToken) {
            // Store for development/debugging only
            localStorage.setItem('refreshTokenForDebug', data.refreshToken);
            console.log('Debug refresh token set:', data.refreshToken.substring(0, 8) + '...');
            
            // Call our proxy endpoint to set the cookie
            fetch('/api/set-refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken: data.refreshToken }),
              credentials: 'include',
            }).catch(err => {
              console.error('Error setting refresh token cookie:', err);
            });
          }
          
          // Update Redux store with user data (but not the tokens)
          dispatch(setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            // Don't store accessToken in Redux state for security
          }));

        } catch (error) {
          console.error('Error saving user data:', error);
          // Clean up any partial data
          setAccessToken(null);
          localStorage.removeItem('userId');
        }
      },
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),    logout: builder.mutation<any, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear in-memory token
          setAccessToken(null);
          // Remove any localStorage items
          localStorage.removeItem('userId');
          // Update Redux store
          dispatch(setUser(null));
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),    // New endpoint for refreshing tokens
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        // Use the dedicated refresh token endpoint
        url: '/refresh-token',
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
        // We don't need to include the body here because our proxy will extract the refresh token from cookies
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          console.log('Refresh token response:', response);
          
          // Extract access token and refresh token
          let accessToken = null;
          let refreshToken = null;
          
          if (response.data && response.data.data) {
            const data = response.data.data;
            if (data.accessToken) {
              accessToken = data.accessToken;
            }
            if (data.refreshToken) {
              refreshToken = data.refreshToken;
            }
          }
          
          if (accessToken) {
            console.log('Got new access token from refresh endpoint:', accessToken.substring(0, 10) + '...');
            
            // Store new access token in memory
            setAccessToken(accessToken);
            
            // Update Redux store with the new token
            dispatch(setToken(accessToken));
            
            // Handle the refresh token if it's returned
            if (refreshToken) {
              console.log('Got new refresh token from refresh endpoint:', refreshToken.substring(0, 8) + '...');
              
              // Store for development/debugging
              setDebugRefreshToken(refreshToken);
              
              // Update the HTTP-only cookie
              fetch('/api/set-refresh-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include',
              }).catch(err => {
                console.error('Error updating refresh token cookie:', err);
              });
            }
            
            console.log('Successfully refreshed token');
            return { success: true };
          } else {
            console.error('No access token in response data', response);
            dispatch(setUser(null));
            setAccessToken(null);
            localStorage.removeItem('userId');
            return { success: false };
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If refresh fails, log the user out
          dispatch(setUser(null));
          setAccessToken(null);
          localStorage.removeItem('userId');
          return { success: false };
        }
      },
    }),


    // Account management endpoints
    getAllAccounts: builder.query<ApiResponse<User[]>, void>({
      query: () => '/accounts',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),

    getAccountById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users' as const, id }],
    }),

    createAccount: builder.mutation<ApiResponse<User>, { body: RegisterAccountDTO }>({
      query: ({ body }) => ({
        url: '/accounts/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'LIST' }],
    }),

    updateAccount: builder.mutation<ApiResponse<User>, { id: string; body: AccountUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    deleteAccount: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Users' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    // Role management endpoints
    assignRole: builder.mutation<ApiResponse<User>, { accountId: string; body: RoleAssignmentDTO }>({
      query: ({ accountId, body }) => ({
        url: `/accounts/${accountId}/role`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Users' as const, id: accountId },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    updateRole: builder.mutation<ApiResponse<User>, { accountId: string; body: RoleAssignmentDTO }>({
      query: ({ accountId, body }) => ({
        url: `/accounts/${accountId}/role`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Users' as const, id: accountId },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    removeRole: builder.mutation<ApiResponse<User>, string>({
      query: (accountId) => ({
        url: `/accounts/${accountId}/role`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, accountId) => [
        { type: 'Users' as const, id: accountId },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

// Export the hooks
export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,

  // New account management hooks
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useLazyGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,

  // Role management hooks
  useAssignRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} = userApiSlice;
