import apiSlice from './api';
import type { User, AuthResponse } from '@/types/auth';

interface LoginCredentials {
  username: string;
  email: string;
  password: string;
  recaptchaToken?: string | null;
}

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),
    
    register: builder.mutation<AuthResponse, RegisterUserData>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: [
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Users' as const, id: 'CURRENT' }],
    }),
    
    getCurrentUser: builder.query<User, void>({
      query: () => '/api/auth/me',
      providesTags: (result) => 
        result 
          ? [{ type: 'Users' as const, id: result.id }, { type: 'Users' as const, id: 'CURRENT' }] 
          : [{ type: 'Users' as const, id: 'CURRENT' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApiSlice;
