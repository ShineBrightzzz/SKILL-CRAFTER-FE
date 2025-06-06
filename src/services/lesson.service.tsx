import apiSlice from './api';

// Define types
interface Lesson {
  id: string;
  title: string;
  chapterId: string;
  chapterName: string;
  type: number;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order?: number;
  initialCode?: string;
  programmingLanguage?: string;
  quizData?: any;
  isCompleted?: boolean;
  status?: number;
  statusMessage?: string;
}

interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: string;
  completed: boolean;
  completedAt?: string;
}

// Response type for multiple lessons
export interface LessonsResponse {
  data: {
    result: Lesson[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

// Response type for multiple progress records
interface ProgressResponse {
  data: {
    result: LessonProgress[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

export const lessonApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({    // Lesson endpoints
    getAllLessons: builder.query<LessonsResponse, { page?: number; pageSize?: number }>({
      query: (params = {}) => {
        const { page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/lessons${queryString}`;
      },providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Lessons' as const, id })),
              { type: 'Lessons' as const, id: 'LIST' },
            ]
          : [{ type: 'Lessons' as const, id: 'LIST' }],    }),    
          getLessonById: builder.query<{ data: Lesson; success: boolean }, string>({
      query: (lessonId) => `/api/lessons/${lessonId}`,
      providesTags: (result, error, id) => [{ type: 'Lessons' as const, id }],
    }),
    
    getLessonsByChapterId: builder.query<LessonsResponse, string>({
      query: (chapterId) => ({
        url: `/api/chapters/${chapterId}/lessons`,
        method: 'GET',
      }),      providesTags: (result, error, chapterId) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Lessons' as const, id })),
              { type: 'Lessons' as const, id: 'LIST' },
              { type: 'Lessons' as const, id: `Chapter-${chapterId}` },
            ]
          : [
              { type: 'Lessons' as const, id: 'LIST' },
              { type: 'Lessons' as const, id: `Chapter-${chapterId}` },
            ],
    }),
    
    createLesson: builder.mutation<Lesson, { body: FormData }>({
      query: ({ body }) => {
        // Check if chapterId exists and is valid UUID
        const chapterId = body.get('chapterId');
        if (!chapterId) {
            throw new Error('chapterId is required');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(chapterId.toString())) {
            throw new Error('Invalid chapterId format');
        }

        return {
            url: '/api/lessons',
            method: 'POST',
            body,
            formData: true,
            headers: {
                'Accept': 'application/json'
            }
          };
      },
      invalidatesTags: (result, error, { body }) => {
        const chapterId = body.get('chapterId')?.toString();
        return [
          { type: 'Lessons' as const, id: 'LIST' },
          ...(chapterId ? [{ type: 'Lessons' as const, id: `Chapter-${chapterId}` }] : []),
        ];
      },
    }),
    
    updateLesson: builder.mutation<Lesson, { id: string, body: FormData }>({
      query: ({ id, body }) => {
        return {
            url: `/api/lessons/${id}`,
            method: 'PUT',
            body,
            formData: true,
            headers: {
                'Accept': 'application/json'
            }
        };
      },
      invalidatesTags: (result, error, { id, body }) => {
        const chapterId = body.get('chapterId')?.toString();
        return [
          { type: 'Lessons' as const, id },
          { type: 'Lessons' as const, id: 'LIST' },
          ...(chapterId ? [{ type: 'Lessons' as const, id: `Chapter-${chapterId}` }] : []),
        ];
      },
    }),
    
    deleteLesson: builder.mutation<void, { id: string, chapterId?: string }>({
      query: ({ id }) => ({
        url: `/api/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, chapterId }) => [
        { type: 'Lessons' as const, id },
        { type: 'Lessons' as const, id: 'LIST' },
        ...(chapterId ? [{ type: 'Lessons' as const, id: `Chapter-${chapterId}` }] : []),
      ],
    }),

    // Progress endpoints
    getLessonProgressByUserId: builder.query<ProgressResponse, string>({
      query: (userId) => `/api/progress/user/${userId}`,      providesTags: (result, error, userId) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Lessons' as const, id: `Progress-${id}` })),
              { type: 'Lessons' as const, id: `User-Progress-${userId}` },
            ]
          : [{ type: 'Lessons' as const, id: `User-Progress-${userId}` }],
    }),
    
    getLessonProgressByLessonId: builder.query<ProgressResponse, string>({
      query: (lessonId) => `/api/progress/lesson/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: 'Lessons' as const, id: `Lesson-Progress-${lessonId}` },
      ],
    }),
    
    startLesson: builder.mutation<LessonProgress, { userId: string, lessonId: string }>({
      query: ({ userId, lessonId }) => ({
        url: `/api/progress/user/${userId}/lesson/${lessonId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { userId, lessonId }) => [
        { type: 'Lessons' as const, id: `User-Progress-${userId}` },
        { type: 'Lessons' as const, id: `Lesson-Progress-${lessonId}` },
      ],
    }),
      completeLesson: builder.mutation<LessonProgress, { userId: string, lessonId: string }>({
      query: ({ userId, lessonId }) => ({
        url: `/api/progress/mark-complete`,
        method: 'PATCH',
        body: { userId, lessonId },
      }),
      invalidatesTags: (result, error, { userId, lessonId }) => [
        { type: 'Lessons' as const, id: `User-Progress-${userId}` },
        { type: 'Lessons' as const, id: `Lesson-Progress-${lessonId}` },
      ],
    }),    updateLessonStatus: builder.mutation<Lesson, { id: string, status: number, message?: string }>({
      query: ({ id, status, message }) => ({
        url: `/api/lessons/${id}/status`,
        method: 'PATCH',
        body: { status, message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lessons' as const, id },
        { type: 'Lessons' as const, id: 'LIST' },
      ],
    }),

  }),
  overrideExisting: true,
});

export const {
  useGetAllLessonsQuery,
  useGetLessonByIdQuery,
  useGetLessonsByChapterIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetLessonProgressByUserIdQuery,
  useGetLessonProgressByLessonIdQuery,
  useStartLessonMutation,
  useCompleteLessonMutation,
  useUpdateLessonStatusMutation,
} = lessonApiSlice;