import { setUser, setToken, logout } from '@/store/slices/authSlice';
import apiSlice, { setAccessToken, setDebugRefreshToken } from './api';
import type { AuthResponse } from '@/types/auth';

// Define types
export interface User {
  id: string;
  username: string;
  email?: string;
  familyName?: string;
  givenName?: string;
  role?: {
    id: number | string;
    name: string;
    description?: string;
    active?: boolean;
    permissionIds?: number[];
    permissions?: any[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  } | null;
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  email_verified?: boolean;
  accessToken?: string;
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
  familyName?: string;
  givenName?: string;
  role?: string;
}

// Register account DTO
export interface RegisterAccountDTO {
  username: string;
  password: string;
  email: string;
  familyName?: string;
  givenName?: string;
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
  data: {
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    };
    result: T[];
  };
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: string;
  search?: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({    
    login: builder.mutation<AuthResponse, { username: string; password: string; recaptchaToken?: string | null }>({
      query: (credentials) => ({          
        url: '/login',
        method: 'POST',
        body: credentials,
        credentials: 'include',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;

          setAccessToken(data.accessToken);
          localStorage.setItem('userId', data.id);
          
          if (data.refreshToken) {
            setDebugRefreshToken(data.refreshToken);
          }
          
          dispatch(setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            email_verified: data.email_verified,
            familyName: data.familyName,
            givenName: data.givenName,
            role: data.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          }));

        } catch (error) {
          console.error('Error saving user data:', error);
          setAccessToken(null);
          localStorage.removeItem('userId');
        }
      }
    }),

    logout: builder.mutation<any, void>({
      query: () => ({          
        url: '/logout',
        method: 'POST',
        credentials: 'include',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          setAccessToken(null);
          localStorage.removeItem('userId');
          setDebugRefreshToken(null);
          dispatch(setUser(null));
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),

    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => {
        const refreshToken = localStorage.getItem('refreshTokenForDebug');
        return {
          url: '/refresh-token',
          method: 'POST',
          credentials: 'include',
          body: refreshToken ? { refreshToken } : {},
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          
          if (response.data?.success) {
            const data = response.data.data;

            if (data.accessToken) {
              setAccessToken(data.accessToken);
              dispatch(setToken(data.accessToken));
            }

            if (data.refreshToken) {
              setDebugRefreshToken(data.refreshToken);
            }

            if (data.id) {
              dispatch(setUser({
                id: data.id,
                username: data.username,
                email: data.email,
                email_verified: data.email_verified,
                familyName: data.familyName,
                givenName: data.givenName,
                role: data.role,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
              }));
            }
          } else {
            console.error('Token refresh failed:', response.data?.message);
            setAccessToken(null);
            localStorage.removeItem('userId');
            dispatch(logout());
          }
        } catch (error) {
          console.error('Error during token refresh:', error);
          setAccessToken(null);
          localStorage.removeItem('userId');
          dispatch(logout());
        }
      }
    }),

    getAllAccounts: builder.query<ApiResponse<User>, PaginationParams | void>({
      query: (params: PaginationParams = {}) => {
        if (!params) return '/api/users';

        const { page, size, sort, order, search } = params;
        const queryParams = [];
        
        if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        return `/api/users${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),

    getAccountById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users' as const, id }],
    }),

    createAccount: builder.mutation<ApiResponse<User>, RegisterAccountDTO>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'LIST' }],
    }),

    updateAccount: builder.mutation<ApiResponse<User>, { id: string; body: AccountUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    deleteAccount: builder.mutation<ApiResponse<User>, string>({
      query: (id) => ({
        url: `/users/${id}`,
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
        url: `/users/${accountId}/role`,
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
        url: `/users/${accountId}/role`,
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
        url: `/users/${accountId}/role`,
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
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useAssignRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} = userApiSlice;
