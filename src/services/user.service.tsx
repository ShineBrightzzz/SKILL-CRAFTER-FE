import apiSlice from './api';
import { setUser } from '@/store/slices/userSlice';
import { setRolePermissions } from '@/store/slices/abilitySlice';  
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { username: string; password: string }>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          // Lưu accessToken
          await localStorage.setItem('accessToken', data.data.accessToken);

          // Lưu user info
          dispatch(setUser({
            studentId: "ST001",
            name: "Nguyễn Văn A",
            avatar: "https://i.pinimg.com/originals/db/8e/0d/db8e0d7279eb0fb08fffb3b0d2f1d0e9.jpg",
          }));

          const permissions = data.data.permissions; 
          
          // Dispatch the permissions to the Redux store
          dispatch(setRolePermissions(permissions));

        } catch (error) {
          console.error("Error during login", error);
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
      query: ({ studentId }) => `/student/${studentId}`,
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
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useGetUserInfoQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useLogoutMutation,
} = userApiSlice;
