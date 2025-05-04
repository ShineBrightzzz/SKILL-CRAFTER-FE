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
          const { data } = await queryFulfilled;
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('userId', data.data.username);
        } catch (error) {
          console.log('Error saving token:', error);
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
        url: '/accounts',
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

    getStudentInfoByClassId: builder.query({
      query: ({ classId }) => `/student/by-class/${classId}`,
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
