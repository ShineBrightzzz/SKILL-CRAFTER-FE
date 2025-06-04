import apiSlice from './api';

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;  // Changed from pageSize to size
  sort?: string;
  order?: 'asc' | 'desc';
}

// Extend with course specific params
interface CourseParams extends PaginationParams {
  courseId: string;
}

// Define the Chapter type
interface Chapter {
  id: string;
  name: string;
  description?: string;
  courseId: string;
  courseName?: string;  // Added to match API response
  order?: number;
  estimatedTime?: number;
  lessons?: any[];
}

// Response type for multiple chapters
interface ChaptersResponse {
  data: {
    result: Chapter[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

export const chapterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Chapter endpoints
    getAllChapters: builder.query<ChaptersResponse, PaginationParams>({
      query: (params: PaginationParams = {}) => {
        // Build query string for pagination
        const { page, size, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/chapters${queryString}`;
      },      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Chapters' as const, id })),
              { type: 'Chapters' as const, id: 'LIST' },
            ]
          : [{ type: 'Chapters' as const, id: 'LIST' }],
    }),
      getChapterById: builder.query<{ data: Chapter }, string>({
      query: (chapterId) => `/api/chapters/${chapterId}`,
      providesTags: (result, error, id) => [{ type: 'Chapters' as const, id }],
    }),
    
    getChaptersByCourseId: builder.query<ChaptersResponse, CourseParams>({
      query: (params: CourseParams) => {
        const { courseId, page, size, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/courses/${courseId}/chapters${queryString}`;
      },      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Chapters' as const, id })),
              { type: 'Chapters' as const, id: 'LIST' },
              { type: 'Chapters' as const, id: `Course-${params.courseId}` },
            ]
          : [
              { type: 'Chapters' as const, id: 'LIST' },
              { type: 'Chapters' as const, id: `Course-${params.courseId}` },
            ],
    }),
      createChapter: builder.mutation<Chapter, { body: Partial<Chapter> }>({
      query: ({body}) => ({
        url: '/api/chapters',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { body }) => [
        { type: 'Chapters' as const, id: 'LIST' },
        ...(body.courseId ? [{ type: 'Chapters' as const, id: `Course-${body.courseId}` }] : []),
      ],
    }),
    
    updateChapter: builder.mutation<Chapter, { id: string; body: Partial<Chapter> }>({
      query: ({ id, body }) => ({
        url: `/api/chapters/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Chapters' as const, id },
        { type: 'Chapters' as const, id: 'LIST' },
        ...(result?.courseId ? [{ type: 'Chapters' as const, id: `Course-${result.courseId}` }] : []),
      ],
    }),
    
    deleteChapter: builder.mutation<void, { id: string; courseId?: string }>({
      query: ({id}) => ({
        url: `/api/chapters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, courseId }) => [
        { type: 'Chapters' as const, id },
        { type: 'Chapters' as const, id: 'LIST' },
        ...(courseId ? [{ type: 'Chapters' as const, id: `Course-${courseId}` }] : []),
      ],
    }),
      reorderChapters: builder.mutation<void, { courseId: string; body: { chapterIds: string[] } }>({
      query: ({ courseId, body }) => ({
        url: `/api/courses/${courseId}/chapters/reorder`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Chapters' as const, id: 'LIST' },
        { type: 'Chapters' as const, id: `Course-${courseId}` },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllChaptersQuery,
  useGetChapterByIdQuery,
  useGetChaptersByCourseIdQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useReorderChaptersMutation,
} = chapterApiSlice;
