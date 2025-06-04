import apiSlice from './api';
import { ListResponse } from '@/types/api';

// Define types
export interface CourseComment {
  id: string;
  content: string;
  courseId: string;
  userId: string;
  username: string;
  userPictureUrl: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
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

// Response type for multiple comments
type CourseCommentsResponse = ListResponse<CourseComment>;

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
    getCommentsByCourseId: builder.query<CourseCommentsResponse, CourseParams>({
      query: (params: CourseParams) => {
        const { courseId, page, size, sortBy = 'createdAt', sortDir = 'desc' } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sortBy) queryParams.push(`sortBy=${sortBy}`);
        if (sortDir) queryParams.push(`sortDir=${sortDir}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/comments/course/${courseId}${queryString}`;
      },      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Course-${params.courseId}` },
            ]
          : [
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Course-${params.courseId}` },
            ],
    }),

    // Get comments by user ID with pagination
    getCommentsByUserId: builder.query<CourseCommentsResponse, UserParams>({
      query: (params: UserParams) => {
        const { userId, page, size, sortBy = 'createdAt', sortDir = 'desc' } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sortBy) queryParams.push(`sortBy=${sortBy}`);
        if (sortDir) queryParams.push(`sortDir=${sortDir}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/comments/user/${userId}${queryString}`;
      },      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `User-${params.userId}` },
            ]
          : [
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `User-${params.userId}` },
            ],
    }),

    // Create a new comment
    createComment: builder.mutation<{ data: CourseComment }, CourseCommentCreateDTO>({
      query: (body) => ({
        url: '/api/comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Courses' as const, id: 'LIST' },
        { type: 'Courses' as const, id: `Course-${courseId}` },
      ],
    }),

    // Update a comment
    updateComment: builder.mutation<{ data: CourseComment }, { id: string; content: string; rating: number }>({
      query: ({ id, content, rating }) => ({
        url: `/api/comments/${id}`,
        method: 'PUT',
        body: { content, rating },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Courses' as const, id },
        { type: 'Courses' as const, id: 'LIST' },
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
        { type: 'Courses' as const, id: 'LIST' },
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
