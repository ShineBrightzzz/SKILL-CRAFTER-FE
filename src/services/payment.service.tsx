import apiSlice from './api';
import type { ListResponse } from '@/types/api';

// Define interfaces for payment service
export interface PaymentCreateRequest {
  courseIds: string[];
  amount: number;
  locale: string;
  returnUrl?: string;
}

export interface PaymentCreateResponseData {
  paymentUrl: string;
  txnRef: string;
  message: string;
  success: boolean;
}

export interface PaymentCreateResponse {
  success: boolean;
  message: string;
  data: PaymentCreateResponseData;
  timestamp: string;
}

export interface VNPayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface PaymentQueryResponse {
  success: boolean;
  message?: string;
  status?: string;
}

export interface PaymentRefundRequest {
  txnRef: string;
  amount: number;
  transDate: string;
}

export interface PaymentRefundResponse {
  success: boolean;
  message?: string;
  status?: string;
  txnRef?: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  courseId: string;
  txnRef: string;
}

// Response type for multiple payments
interface PaymentsResponse extends ListResponse<Payment> {}

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentCreateResponse, PaymentCreateRequest>({
      query: (request) => ({
        url: '/api/v1/payments/create',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }],
    }),

    queryPayment: builder.query<PaymentQueryResponse, { txnRef: string; transDate: string }>({
      query: ({ txnRef, transDate }) => ({
        url: `/api/v1/payments/query/${txnRef}`,
        params: { transDate },
      }),
      providesTags: (result, error, { txnRef }) => [{ type: 'Payment', id: txnRef }],
    }),

    refundPayment: builder.mutation<PaymentRefundResponse, PaymentRefundRequest>({
      query: (request) => ({
        url: '/api/v1/payments/refund',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, request) => [{ type: 'Payment', id: request.txnRef }],
    }),

    getPaymentHistory: builder.query<PaymentsResponse, void>({
      query: () => '/api/v1/payments/history',
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment' as const, id: 'LIST' },
            ]
          : [{ type: 'Payment' as const, id: 'LIST' }],
    }),

    checkPaymentStatus: builder.query<{ hasPaid: boolean }, string>({
      query: (courseId) => ({
        url: '/api/v1/payments/check-payment',
        params: { courseId },
      }),
      providesTags: (result, error, courseId) => [{ type: 'Payment', id: `status-${courseId}` }],
    }),

    handleVNPayReturn: builder.query<{ success: boolean; message: string }, VNPayReturnParams>({
      query: (params) => ({
        url: '/api/v1/payments/vnpay-return',
        params,
      }),
      providesTags: (result, error, params) => [{ type: 'Payment', id: params.vnp_TxnRef }],
    }),
  }),
});

// Export the hooks
export const {
  useCreatePaymentMutation,
  useQueryPaymentQuery,
  useRefundPaymentMutation,
  useGetPaymentHistoryQuery,
  useCheckPaymentStatusQuery,
  useHandleVNPayReturnQuery,
} = paymentApiSlice;
