import apiSlice from './api';

interface EmailVerificationDTO {
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const emailApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    verifyEmail: builder.mutation<ApiResponse<void>, EmailVerificationDTO>({
      query: (verificationDTO) => ({
        url: '/api/email/verify',
        method: 'POST',
        body: verificationDTO,
      }),
    }),

    resendVerification: builder.mutation<ApiResponse<void>, string>({
      query: (email) => ({
        url: `/api/email/resend-verification?email=${encodeURIComponent(email)}`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = emailApiSlice;
