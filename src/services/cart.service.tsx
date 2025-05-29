import apiSlice from './api';

// Define the Cart Item type based on the provided CartDTO
interface CartItem {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  price: number;
  imageUrl: string;
  addedAt: string;
}

// Request type for adding/deleting items from cart
interface CartItemRequest {
  userId: string;
  courseId: string;
}

// Response type for cart items
interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
  timestamp: string;
}

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get cart items for a user
    getCartByUserId: builder.query<CartResponse, string>({
      query: (userId) => `/api/cart/user/${userId}`,
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((item) => ({ type: 'Cart' as const, id: item.id })),
              { type: 'Cart' as const, id: 'LIST' },
            ]
          : [{ type: 'Cart' as const, id: 'LIST' }],
    }),
    
    // Add item to cart
    addToCart: builder.mutation<void, CartItemRequest>({
      query: (cartItemRequest) => ({
        url: '/api/cart',
        method: 'POST',
        body: cartItemRequest,
      }),
      invalidatesTags: [{ type: 'Cart' as const, id: 'LIST' }],
    }),
    
    // Remove item from cart
    removeFromCart: builder.mutation<void, CartItemRequest>({
      query: (cartItemRequest) => ({
        url: '/api/cart',
        method: 'DELETE',
        body: cartItemRequest,
      }),
      invalidatesTags: [{ type: 'Cart' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCartByUserIdQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
} = cartApiSlice;

export type { CartItem, CartItemRequest, CartResponse };
