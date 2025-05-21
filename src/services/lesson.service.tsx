import apiSlice from './api';

export const lessonApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Lesson endpoints
    getAllLessons: builder.query({
      query: () => '/api/lessons',
    }),
    getLessonById: builder.query({
      query: (lessonId) => `/api/lessons/${lessonId}`,
    }),
    getLessonsByChapterId: builder.query({
      query: (chapterId) => `/api/lessons/chapter/${chapterId}`,
    }),
    createLesson: builder.mutation({
      query: ({body}) => ({
        url: '/api/lessons',
        method: 'POST',
        body,
      }),
    }),
    updateLesson: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/lessons/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteLesson: builder.mutation({
      query: ({id}) => ({
        url: `/api/lessons/${id}`,
        method: 'DELETE',
      }),
    }),

    // Progress endpoints
    getLessonProgressByUserId: builder.query({
      query: (userId) => `/api/progress/user/${userId}`,
    }),
    getLessonProgressByLessonId: builder.query({
      query: (lessonId) => `/api/progress/lesson/${lessonId}`,
    }),
    startLesson: builder.mutation({
      query: ({ userId, lessonId }) => ({
        url: `/api/progress/user/${userId}/lesson/${lessonId}/start`,
        method: 'POST',
      }),
    }),
    completeLesson: builder.mutation({
      query: ({ userId, lessonId, progressData }) => ({
        url: `/api/progress/user/${userId}/lesson/${lessonId}/complete`,
        method: 'POST',
        body: progressData,
      }),
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
} = lessonApiSlice;