import { setUser } from '@/store/slices/authSlice';
import apiSlice from './api';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { username: string; password: string }>({
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
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    }),

    getUserInfo: builder.query({
      query: ({userId}) => `/student/${userId}`,
    }),

    createUser: builder.mutation({
      query: ({body}) => ({
        url: '/accounts/create',
        method: 'POST',
        body,
      }),
    }),

    editUser: builder.mutation({
      query: ({ body }) => ({
        url: '/api/user',
        method: 'PATCH',
        body,
      }),
    }),

    getUserPermissions: builder.query({
      query: ({studentId}) => `/accounts/${studentId}/permissions`,
    }),

    getUserEmbedding: builder.query({
      query: () => `/student/check-embedding`,
    }),


    getAllClassInfo: builder.query({
      query: () => `/get-all-class-information`,
    }),

    getAllDepartmentInfo: builder.query({
      query: () => `/get-all-department`,
    }),

    getAllUser : builder.query({
      query: () => `/accounts`,
    }),

    getUserById: builder.query({
      query: ({ id }) => `/accounts/${id}`,
    }),
    
    deleteUser: builder.mutation({
      query: ({ username }) => ({
        url: `/accounts/${username}`,
        method: 'DELETE',
      }),
    }),

    updateUser: builder.mutation({
      query: ({ username, body }) => ({
        url: `/accounts/${username}`,
        method: 'PUT',
        body,
      }),
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
