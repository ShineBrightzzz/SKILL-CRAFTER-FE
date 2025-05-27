import { setUser } from '@/store/slices/authSlice';
import apiSlice from './api';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { username: string; password: string }>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),      async onQueryStarted(arg, {dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response.data;
          
          // Store user data safely
          const userData = {
            id: data.id,
            username: data.username,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('accessToken', data.accessToken);
          
          // Dispatch the user data to Redux store
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Error saving user data:', error);
          // Clean up any partial data
          localStorage.removeItem('user');
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
  useLazyGetUserInfoQuery,
  useGetUserInfoQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useLogoutMutation,
  useGetUserPermissionsQuery,
  useLazyGetUserPermissionsQuery,
  useGetUserEmbeddingQuery,
  useGetStudentInfoByClassIdQuery,
  useGetAllClassInfoQuery,
  useGetAllDepartmentInfoQuery,
  useGetAllUserQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = userApiSlice;
