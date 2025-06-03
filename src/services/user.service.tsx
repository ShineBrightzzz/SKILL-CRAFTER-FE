import { setUser } from '@/store/slices/authSlice';
import apiSlice, { setAccessToken } from './api';
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
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;

          // Store access token in memory instead of localStorage
          setAccessToken(data.accessToken);
          
          // Store user ID in localStorage (this doesn't need to be secure)
          localStorage.setItem('userId', data.id);
          
          // Remove any old tokens from localStorage if they exist
          localStorage.removeItem('accessToken');
          
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
    }),
    
    // New endpoint for refreshing tokens
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/refresh-token',
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;
          
          // Store new access token in memory
          setAccessToken(data.accessToken);
          
          // Update Redux store if needed
          // Note: We don't need to update the user here, just the token
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If refresh fails, log the user out
          dispatch(setUser(null));
          setAccessToken(null);
          localStorage.removeItem('userId');
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
