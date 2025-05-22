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
      query: (chapterId) => ({
        url: `/api/chapters/${chapterId}/lessons`,
        method: 'GET',
      }),
    }),      createLesson: builder.mutation<any, { body: FormData }>({
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
                const chapterId = body.get('chapterId');
                return chapterId ? [{ type: 'Lessons', id: chapterId.toString() }] : [];
            }
        }),
    
    updateLesson: builder.mutation({
      query: ({ id, body }) => {
        const formData = new FormData();
        for (const key in body) {
          if (body[key] instanceof File) {
            formData.append(key, body[key]);
          } else if (typeof body[key] === 'object') {
            formData.append(key, JSON.stringify(body[key]));
          } else if (body[key] !== null && body[key] !== undefined) {
            formData.append(key, body[key].toString());
          }
        }        
        return {
          url: `/api/lessons/${id}`,
          method: 'PUT',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        };
      },
    }),
    deleteLesson: builder.mutation({
      query: ({ id }) => ({
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