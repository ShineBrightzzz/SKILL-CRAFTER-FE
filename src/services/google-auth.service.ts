import apiSlice, { setAccessToken, setDebugRefreshToken } from './api';
import type { AuthResponse } from '@/types/auth';
import { setUser } from '@/store/slices/authSlice';
import { setAbility } from '@/store/slices/abilitySlice';
import { roleApiSlice } from './role.service';

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
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const userData = data.data;
          if (!userData) {
            throw new Error('No user data received from Google authentication');
          }

          // Store tokens and user ID
          localStorage.setItem('userId', userData.id);
          setAccessToken(userData.accessToken);
          
          // Store refresh token in HTTP-only cookie (handled by backend)
          if (userData.refreshToken) {
            setDebugRefreshToken(userData.refreshToken);
          }

            // Dispatch user data with roleId
          dispatch(setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            familyName: userData.familyName,
            givenName: userData.givenName,
            pictureUrl: userData.pictureUrl,
            roleId: userData.roleId,
            isAdmin: userData.isAdmin
          }));

          // Fetch and dispatch permissions if roleId exists
          if (userData.roleId) {
            try {
              const permissionsResult = await dispatch(
                roleApiSlice.endpoints.getRolePermissions.initiate(String(userData.roleId))
              );
              
              if ('data' in permissionsResult) {
                const permissionsResponse = permissionsResult.data;
                if (permissionsResponse?.data) {
                  dispatch(setAbility(permissionsResponse.data));
                }
              }
            } catch (error) {
              console.error('Error fetching permissions after Google login:', error);
            }
          }

        } catch (error) {
          console.error('Error during Google authentication:', error);
          localStorage.removeItem('userId');
          setAccessToken(null);
        }
      },
    }),
  }),
});

export const { useGoogleAuthMutation } = googleAuthApiSlice;
