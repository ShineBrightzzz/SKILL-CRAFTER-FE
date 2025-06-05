import apiSlice from './api';
import { ListResponse } from '@/types/api';

// Define types
export interface CourseComment {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseCommentResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: CourseComment[];
  };
  timestamp: string;
}

// Create Comment DTO
interface CourseCommentCreateDTO {
  content: string;
  courseId: string;
  userId: string;
  rating: number;
}

// Update Comment DTO
interface CourseCommentUpdateDTO {
  content: string;
  rating: number;
}

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Extend with course specific params
interface CourseParams extends PaginationParams {
  courseId: string;
}

// Extend with user specific params
interface UserParams extends PaginationParams {
  userId: string;
}

export const courseCommentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all comments for a course with pagination
    getCommentsByCourseId: builder.query<CourseCommentResponse, CourseParams>({
      query: (params: CourseParams) => {
        const { courseId, page = 1, size = 10 } = params;
        const queryParams = [
          `page=${page}`,
          `pageSize=${size}`
        ].join('&');
        
        return `/api/comments/course/${courseId}?${queryParams}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' }
            ]
          : [{ type: 'Courses' as const, id: 'LIST' }],
    }),

    // Get comments by user ID with pagination
    getCommentsByUserId: builder.query<CourseCommentResponse, UserParams>({
      query: (params: UserParams) => {
        const { userId, page = 1, size = 10 } = params;
        const queryParams = [
          `page=${page}`,
          `pageSize=${size}`
        ].join('&');
        
        return `/api/comments/user/${userId}?${queryParams}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' }
            ]
          : [{ type: 'Courses' as const, id: 'LIST' }],
    }),

    // Create a new comment
    createComment: builder.mutation<CourseCommentResponse, CourseCommentCreateDTO>({
      query: (body) => ({
        url: '/api/comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Courses' as const, id: 'LIST' }]
    }),

    // Update a comment
    updateComment: builder.mutation<CourseCommentResponse, { id: string; body: CourseCommentUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `/api/comments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Courses' as const, id },
        { type: 'Courses' as const, id: 'LIST' }
      ],
    }),

    // Delete a comment
    deleteComment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Courses' as const, id },
        { type: 'Courses' as const, id: 'LIST' }
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsByCourseIdQuery,
  useGetCommentsByUserIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = courseCommentApiSlice;
