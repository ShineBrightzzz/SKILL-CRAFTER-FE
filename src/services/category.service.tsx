import apiSlice from './api';

// Define types
interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Response type for multiple categories
interface CategoriesResponse {
  data: {
    result: Category[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;  // Changed from pageSize to size
  sort?: string;
  order?: 'asc' | 'desc';
}

// Define API endpoints
export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<CategoriesResponse, PaginationParams | void>({
      query: (params: PaginationParams = {}) => {
        if (!params) return '/api/categories';

        const { page, size, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        return `/api/categories${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Categories' as const, id })),
              { type: 'Categories' as const, id: 'LIST' },
            ]
          : [{ type: 'Categories' as const, id: 'LIST' }],
    }),

    getCategoryById: builder.query<Category, string>({
      query: (id: string) => `/api/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Categories' as const, id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body: CreateCategoryRequest) => ({
        url: '/api/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Categories' as const, id: 'LIST' }],
    }),

    updateCategory: builder.mutation<Category, { id: string; body: UpdateCategoryRequest }>({
      query: ({ id, body }: { id: string; body: UpdateCategoryRequest }) => ({
        url: `/api/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Categories' as const, id },
        { type: 'Categories' as const, id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<void, { id: string }>({
      query: ({ id }: { id: string }) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Categories' as const, id },
        { type: 'Categories' as const, id: 'LIST' },
        // Also invalidate courses related to this category
        { type: 'Courses' as const, id: `Category-${id}` },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;