import apiSlice from './api';

export interface LessonUpdateDTO {
  title: string;
  type: number;
  content: string | null;
  quizData: {
    questions: {
      question: string;
      options: string[];  // Must contain exactly 4 options
      correctAnswer: number;  // Index of the correct answer (0-3)
    }[];
  } | null;
  videoUrl: string | null;
  initialCode: string | null;
  solutionCode: string | null;
  testCases: string | null;
  duration: number | null;
}

export const lessonApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
    }),
    createLesson: builder.mutation<any, { body: LessonUpdateDTO }>({
      query: ({ body }) => ({
        url: '/api/lessons',
        method: 'POST',
        body,
      }),
    }),
    updateLesson: builder.mutation<any, { id: string; body: LessonUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `/api/lessons/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteLesson: builder.mutation({
      query: ({ id }) => ({
        url: `/api/lessons/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllLessonsQuery,
  useGetLessonByIdQuery,
  useGetLessonsByChapterIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} = lessonApiSlice;
