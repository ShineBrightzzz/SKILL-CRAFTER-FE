import { setUser } from '@/store/slices/authSlice';
import apiSlice from './api';

// Define types
interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  active?: boolean;
  // Add other user properties as needed
}

// Role assignment DTO
interface RoleAssignmentDTO {
  roleId?: string;
  roleName?: string;
}

// Account update DTO
interface AccountUpdateDTO {
  username?: string;
  password?: string;
  // Add other updateable fields
}

// Register account DTO
interface RegisterAccountDTO {
  username: string;
  password: string;
  // Add other registration fields
}

interface UserPermission {
  id: string;
  name: string;
  description?: string;
}

// Response type for API responses
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ data: { id: string; accessToken: string } }, { username: string; password: string }>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;

          localStorage.setItem('userId', data.id);
          localStorage.setItem('accessToken', data.accessToken);
        } catch (error) {
          console.error('Error saving user data:', error);
          // Clean up any partial data
          localStorage.removeItem('userId');
          localStorage.removeItem('accessToken');
        }
      },
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
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
