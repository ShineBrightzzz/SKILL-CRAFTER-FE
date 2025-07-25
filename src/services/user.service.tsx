import { setUser, setToken, logout } from '@/store/slices/authSlice';
import { setAbility } from '@/store/slices/abilitySlice';
import apiSlice, { setAccessToken, setDebugRefreshToken } from './api';
import type { AuthResponse } from '@/types/auth';
import { roleApiSlice } from './role.service';

// Define types
export interface User {  
  id: string;
  username: string;
  email?: string;
  familyName?: string;
  givenName?: string;
  isAdmin?: boolean;
  roleId?: number | null;
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;  
  createdBy?: string;
  updatedBy?: string;  
  pictureUrl?: string;
  phone?: string;
  email_verified?: boolean;
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

// Profile update DTO
export interface ProfileUpdateDTO {
  password?: string;
  givenName?: string;
  familyName?: string;
  pictureFile?: File;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({      login: builder.mutation<AuthResponse, { username: string; password: string; recaptchaToken?: string | null }>({
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

          // Store access token in memory
          setAccessToken(data.accessToken);
          
          // Store user ID in localStorage
          localStorage.setItem('userId', data.id);
            // Store refresh token for development/debugging only
          if (data.refreshToken) {
            setDebugRefreshToken(data.refreshToken);
          }
            // Update Redux store with user data
          dispatch(setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            familyName: data.familyName,
            givenName: data.givenName,
            pictureUrl: data.pictureUrl,
            roleId: data.roleId,
            isAdmin: data.isAdmin
          }));

          // Fetch and dispatch permissions if roleId exists
          if (data.roleId) {
            try {
              const permissionsResult = await dispatch(
                roleApiSlice.endpoints.getRolePermissions.initiate(data.roleId)
              );
              
              if ('data' in permissionsResult) {
                const permissionsResponse = permissionsResult.data;
                if (permissionsResponse?.data) {
                  dispatch(setAbility(permissionsResponse.data));
                }
              }
            } catch (error) {
              console.error('Error fetching permissions:', error);
            }
          }

          // Fetch and dispatch permissions if roleId exists
          if (data.roleId) {
            try {
              const permissionsResult = await dispatch(
                roleApiSlice.endpoints.getRolePermissions.initiate(data.roleId)
              );
              
              if ('data' in permissionsResult) {
                const permissionsResponse = permissionsResult.data;
                if (permissionsResponse?.data) {
                  dispatch(setAbility(permissionsResponse.data));
                }
              }
            } catch (error) {
              console.error('Error fetching permissions:', error);
            }
          }
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
          // Get the response and extract data
          const response = await queryFulfilled;
          
          // Check if the response is successful
          if (response.data?.success) {
            const data = response.data.data;

            // Store access token in memory and Redux
            if (data.accessToken) {
              setAccessToken(data.accessToken);
              dispatch(setToken(data.accessToken));
            }

            // Store new refresh token for development/debugging
            if (data.refreshToken) {
              setDebugRefreshToken(data.refreshToken);
            }            // Update user data in Redux store
            if (data.id) {              
              const userData = {
                id: data.id,
                username: data.username,
                email: data.email,
                email_verified: data.email_verified,
                familyName: data.familyName,
                givenName: data.givenName,
                pictureUrl: data.pictureUrl || undefined,
                roleId: data.roleId || null,
                isAdmin: data.isAdmin
              };
              dispatch(setUser(userData));
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


    // Account management endpoints
    getAllAccounts: builder.query<ApiResponse<User[]>, PaginationParams | void>({
      query: (params: PaginationParams = {}) => {
        if (!params) return '/accounts';

        const { page, size, sort, order, search } = params;
        const queryParams = [];
        
        if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        return `/accounts${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
      },
      providesTags: (result) => {
        if (!result?.data) return [{ type: 'Users' as const, id: 'LIST' }];
        
        const users = Array.isArray(result.data) ? result.data : result.data.result;
        return [
          ...users.map((user) => ({ type: 'Users' as const, id: user.id })),
          { type: 'Users' as const, id: 'LIST' },
        ];
      },
    }),

    getAccountById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users' as const, id }],
    }),

    createAccount: builder.mutation<ApiResponse<User>, RegisterAccountDTO>({
      query: (data) => ({
        url: '/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'LIST' }],
    }),    updateAccount: builder.mutation<ApiResponse<User>, { id: string; body: AccountUpdateDTO & ProfileUpdateDTO }>({
      query: ({ id, body }) => {
        const formData = new FormData();
        
        // AccountUpdateDTO fields
        if (body.username) formData.append('username', body.username);
        if (body.password) formData.append('password', body.password);
        if (body.email) formData.append('email', body.email);
        if (body.fullName) formData.append('fullName', body.fullName);
        if (body.role) formData.append('role', body.role);

        // ProfileUpdateDTO fields
        if (body.givenName) formData.append('givenName', body.givenName);
        if (body.familyName) formData.append('familyName', body.familyName);
        if (body.pictureFile) formData.append('pictureFile', body.pictureFile);

        return {
          url: `/accounts/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
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
  useAssignRoleMutation

} = userApiSlice;
