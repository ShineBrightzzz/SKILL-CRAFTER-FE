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

// Define API endpoints
export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => '/api/categories',
    }),
    getCategoryById: builder.query({
      query: (id: string) => `/api/categories/${id}`,
    }),
    createCategory: builder.mutation({
      query: (body: CreateCategoryRequest) => ({
        url: '/api/categories',
        method: 'POST',
        body,
      }),
    }),
    updateCategory: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateCategoryRequest }) => ({
        url: `/api/categories/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
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