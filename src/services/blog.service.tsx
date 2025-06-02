import apiSlice from './api';
import { ListResponse } from '@/types/api';

// Define types
interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

// Create Blog DTO
interface BlogCreateDTO {
  title: string;
  content: string;
  authorId: string;
}

// Response type for multiple blogs
interface BlogsResponse extends ListResponse<Blog> {}

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Extend with author specific params
interface AuthorParams extends PaginationParams {
  authorId: string;
}

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all blogs with pagination
    getAllBlogs: builder.query<BlogsResponse, PaginationParams>({
      query: (params: PaginationParams = {}) => {
        const { page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/blogs${queryString}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Blogs' as const, id })),
              { type: 'Blogs' as const, id: 'LIST' },
            ]
          : [{ type: 'Blogs' as const, id: 'LIST' }],
    }),

    // Get a single blog by ID
    getBlogById: builder.query<{ data: Blog }, string>({
      query: (id) => `/api/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blogs' as const, id }],
    }),

    // Get blogs by author ID with pagination
    getBlogsByAuthorId: builder.query<BlogsResponse, AuthorParams>({
      query: (params: AuthorParams) => {
        const { authorId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/blogs/author/${authorId}${queryString}`;
      },
      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Blogs' as const, id })),
              { type: 'Blogs' as const, id: 'LIST' },
              { type: 'Blogs' as const, id: `Author-${params.authorId}` },
            ]
          : [
              { type: 'Blogs' as const, id: 'LIST' },
              { type: 'Blogs' as const, id: `Author-${params.authorId}` },
            ],
    }),

    // Create a new blog
    createBlog: builder.mutation<{ data: Blog }, BlogCreateDTO>({
      query: (body) => ({
        url: '/api/blogs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Blogs' as const, id: 'LIST' }],
    }),

    // Update an existing blog
    updateBlog: builder.mutation<{ data: Blog }, { id: string; body: BlogCreateDTO }>({
      query: ({ id, body }) => ({
        url: `/api/blogs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blogs' as const, id },
        { type: 'Blogs' as const, id: 'LIST' },
      ],
    }),

    // Delete a blog
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Blogs' as const, id },
        { type: 'Blogs' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useGetBlogsByAuthorIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApiSlice;
