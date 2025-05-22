import apiSlice from './api';

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Extend with course specific params
interface CourseParams extends PaginationParams {
  courseId: string;
}

export const chapterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Chapter endpoints
    getAllChapters: builder.query({
      query: (params: PaginationParams = {}) => {
        // Build query string for pagination
        const { page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/chapters${queryString}`;
      },
    }),
    
    getChapterById: builder.query({
      query: (chapterId) => `/api/chapters/${chapterId}`,
    }),
    
    getChaptersByCourseId: builder.query({
      query: (params: CourseParams) => {
        const { courseId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/courses/${courseId}/chapters${queryString}`;
      },
    }),
    
    createChapter: builder.mutation({
      query: ({body}) => ({
        url: '/api/chapters',
        method: 'POST',
        body,
      }),
    }),
    
    updateChapter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/chapters/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    
    deleteChapter: builder.mutation({
      query: ({id}) => ({
        url: `/api/chapters/${id}`,
        method: 'DELETE',
      }),
    }),
    
    reorderChapters: builder.mutation({
      query: ({ courseId, body }) => ({
        url: `/api/courses/${courseId}/chapters/reorder`,
        method: 'PUT',
        body,
      }),
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
