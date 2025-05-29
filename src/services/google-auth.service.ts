import apiSlice from './api';
import type { AuthResponse } from '@/types/auth';

interface GoogleAuthRequest {
  idToken: string;
  email?: string;
  name?: string;
}

export const googleAuthApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    googleAuth: builder.mutation<AuthResponse, GoogleAuthRequest>({
      query: (credentials) => ({
        url: '/api/auth/google',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Google authentication successful:', data);
          localStorage.setItem('userId', data.data.id);
          localStorage.setItem('accessToken', data.data.accessToken);
        } catch (error) {
          console.error('Error during Google authentication:', error);
          localStorage.removeItem('userId');
          localStorage.removeItem('accessToken');
        }
      },
    }),
  }),
});

export const { useGoogleAuthMutation } = googleAuthApiSlice;
