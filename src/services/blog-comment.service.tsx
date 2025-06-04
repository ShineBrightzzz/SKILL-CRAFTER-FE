import apiSlice from './api';
import { ListResponse } from '@/types/api';

// Define types
export interface BlogComment {
  id: string;
  content: string;
  blogId: string;
  userId: string;
  username: string;
  userPictureUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  parentId: string | null;
  replies: BlogComment[];
}

// Create Comment DTO
interface BlogCommentCreateDTO {
  content: string;
  blogId: string;
  userId: string;
  parentId?: string | null;
}

// Update Comment DTO
interface BlogCommentUpdateDTO {
  content: string;
}

// Response type for multiple comments
type BlogCommentsResponse = ListResponse<BlogComment>;

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Extend with blog specific params
interface BlogParams extends PaginationParams {
  blogId: string;
}

// Extend with user specific params
interface UserParams extends PaginationParams {
  userId: string;
}

export const blogCommentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all comments for a blog with pagination
    getCommentsByBlogId: builder.query<BlogCommentsResponse, BlogParams>({
      query: (params: BlogParams) => {
        const { blogId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/blog-comments/blog/${blogId}${queryString}`;
      },
      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'BlogComments' as const, id })),
              { type: 'BlogComments' as const, id: 'LIST' },
              { type: 'BlogComments' as const, id: `Blog-${params.blogId}` },
            ]
          : [
              { type: 'BlogComments' as const, id: 'LIST' },
              { type: 'BlogComments' as const, id: `Blog-${params.blogId}` },
            ],
    }),

    // Get comments by user ID with pagination
    getCommentsByUserId: builder.query<BlogCommentsResponse, UserParams>({
      query: (params: UserParams) => {
        const { userId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/blog-comments/user/${userId}${queryString}`;
      },
      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'BlogComments' as const, id })),
              { type: 'BlogComments' as const, id: 'LIST' },
              { type: 'BlogComments' as const, id: `User-${params.userId}` },
            ]
          : [
              { type: 'BlogComments' as const, id: 'LIST' },
              { type: 'BlogComments' as const, id: `User-${params.userId}` },
            ],
    }),

    // Create a new comment
    createComment: builder.mutation<{ data: BlogComment }, BlogCommentCreateDTO>({
      query: (body) => ({
        url: '/api/blog-comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: 'BlogComments' as const, id: 'LIST' },
        { type: 'BlogComments' as const, id: `Blog-${blogId}` },
      ],
    }),

    // Update a comment
    updateComment: builder.mutation<{ data: BlogComment }, { id: string; body: BlogCommentUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `/api/blog-comments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BlogComments' as const, id },
        { type: 'BlogComments' as const, id: 'LIST' },
      ],
    }),

    // Delete a comment
    deleteComment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/blog-comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'BlogComments' as const, id },
        { type: 'BlogComments' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsByBlogIdQuery,
  useGetCommentsByUserIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = blogCommentApiSlice;
