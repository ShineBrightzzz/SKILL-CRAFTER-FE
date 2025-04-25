
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
      query: ({studentId}) => `/student/${studentId}`,
    }),

    createUser: builder.mutation<any, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: '/api/auth/register',
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

    registFace: builder.mutation({
      query: ({ studentId, video }) => {
        const formData = new FormData();
        formData.append("id", studentId);
        formData.append("video", {
          uri: video.uri,
          name: "video.mp4",
          type: "video/mp4",
        } as any);
        return {
          url: `/regist-face`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
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
  useRegistFaceMutation,
} = userApiSlice;
