import apiSlice from './api';

// Define types
interface Payment {
  id: string;
  vnpTxnRef: string;
  vnpTransactionNo: string;
  amount: number;
  vnpAmount: number;
  status: string;
  paymentMethod: string | null;
  vnpBankCode: string;
  vnpCardType: string;
  vnpOrderInfo: string;
  vnpPayDate: string;
  refundAmount: number | null;
  refundReason: string | null;
  refundDate: string | null;
  createdAt: string;
  updatedAt: string;
  paid: boolean;
  refunded: boolean;
}

interface PaginationParams {
  page?: number;
  size?: number;  // Changed from pageSize to size
  searchText?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentsResponse {
  success: boolean;
  message: string;
  data: {
    result: Payment[];
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
  };
  timestamp: string;
}

interface PaymentCreateRequest {
  courseId: string;
}

interface PaymentCreateResponse {
  success: boolean;
  message: string;
  data: {
    paymentUrl: string;
  };
}

interface PaymentQueryResponse {
  success: boolean;
  message: string;
  data: Payment;
}

interface PaymentRefundRequest {
  txnRef: string;
  amount: number;
  reason: string;
}

interface PaymentRefundResponse {
  success: boolean;
  message: string;
  data: Payment;
}

interface VNPayReturnParams {
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  [key: string]: string;
}

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayments: builder.query<PaymentsResponse, PaginationParams | void>({
      query: (params = {}) => {
        if (!params) return '/api/payments/all';

        const queryParams = Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');

        return `/api/payments/all${queryParams ? `?${queryParams}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment' as const, id: 'LIST' },
            ]
          : [{ type: 'Payment' as const, id: 'LIST' }],
    }),

    createPayment: builder.mutation<PaymentCreateResponse, PaymentCreateRequest>({
      query: (request) => ({
        url: '/api/payments/create',
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
        url: '/api/payments/refund',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, request) => [{ type: 'Payment', id: request.txnRef }],
    }),

    getPaymentHistory: builder.query<PaymentsResponse, void>({
      query: () => '/api/payments/history',
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
        url: '/api/payments/check-payment',
        params: { courseId },
      }),
      providesTags: (result, error, courseId) => [{ type: 'Payment', id: `status-${courseId}` }],
    }),

    handleVNPayReturn: builder.query<{ success: boolean; message: string }, VNPayReturnParams>({
      query: (params) => ({
        url: '/api/payments/vnpay-return',
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
  useGetAllPaymentsQuery,
} = paymentApiSlice;
