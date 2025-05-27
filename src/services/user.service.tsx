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
  // Add other user properties as needed
}

interface UserPermission {
  id: string;
  name: string;
  description?: string;
}

// Response type for multiple users
interface UsersResponse {
  data: User[];
}

// Response type for permissions
interface PermissionsResponse {
  data: UserPermission[];
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ data: { id: string; accessToken: string } }, { username: string; password: string }>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),      
      async onQueryStarted(arg, {dispatch, queryFulfilled }) {
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

    getUserInfo: builder.query<User, { userId: string }>({
      query: ({userId}) => `/student/${userId}`,
      providesTags: (result, error, { userId }) => [
        { type: 'Users' as const, id: userId },
        { type: 'Users' as const, id: 'CURRENT' },
      ],
    }),

    createUser: builder.mutation<User, { body: any }>({
      query: ({body}) => ({
        url: '/accounts/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'LIST' }],
    }),

    editUser: builder.mutation<User, { body: any }>({
      query: ({ body }) => ({
        url: '/api/user',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { body }) => [
        { type: 'Users' as const, id: body.id || 'UNKNOWN' },
        { type: 'Users' as const, id: 'LIST' },
        ...(body.id === localStorage.getItem('userId') ? [{ type: 'Users' as const, id: 'CURRENT' }] : []),
      ],
    }),

    getUserPermissions: builder.query<PermissionsResponse, { studentId: string }>({
      query: ({studentId}) => `/accounts/${studentId}/permissions`,
      providesTags: (result, error, { studentId }) => [
        { type: 'Permission' as const, id: `User-${studentId}` },
      ],
    }),

    getUserEmbedding: builder.query<any, void>({
      query: () => `/student/check-embedding`,
      providesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),

    getAllClassInfo: builder.query<any, void>({
      query: () => `/get-all-class-information`,
      providesTags: [{ type: 'Users' as const, id: 'CLASS-INFO' }],
    }),

    getAllDepartmentInfo: builder.query<any, void>({
      query: () => `/get-all-department`,
      providesTags: [{ type: 'Users' as const, id: 'DEPARTMENT-INFO' }],
    }),

    getAllUser: builder.query<UsersResponse, void>({
      query: () => `/accounts`,
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),

    getUserById: builder.query<User, { id: string }>({
      query: ({ id }) => `/accounts/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Users' as const, id }],
    }),
    
    deleteUser: builder.mutation<void, { username: string }>({
      query: ({ username }) => ({
        url: `/accounts/${username}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'LIST' }],
    }),

    updateUser: builder.mutation<User, { username: string; body: any }>({
      query: ({ username, body }) => ({
        url: `/accounts/${username}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { username, body }) => [
        { type: 'Users' as const, id: body.id || username },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserPermissionsQuery,
  useGetUserEmbeddingQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useGetAllClassInfoQuery,
  useGetAllDepartmentInfoQuery,
  useGetAllUserQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = userApiSlice;
