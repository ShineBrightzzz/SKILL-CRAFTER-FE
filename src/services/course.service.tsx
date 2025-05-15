import apiSlice from './api';

export const courseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query({
      query: () => '/api/courses',
    }),
    getCourseById: builder.query({
        query: (courseId) => `/api/courses/${courseId}`,
    }),
    addCourse: builder.mutation({
      query: (body) => ({
        url: '/api/courses',
        method: 'POST',
        body,
      }),
    }),
    editCourse: builder.mutation({
      query: ({ courseId, body }) => ({
        url: `/api/courses/${courseId}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteCourse: builder.mutation({
      query: ({courseId}) => ({
        url: `/api/courses/${courseId}`,
        method: 'DELETE',
      }),
    }),    getAllCourseByCategory: builder.query({
      query: ({categoryId}) => `/api/courses/category/${categoryId}`,
    }),    
    
    getAllCourseByInstructor: builder.query({
      query: ({instructorId}) => `/api/courses/instructor/${instructorId}`,
    }),

    getAllLessonsByChapterId: builder.query({
      query: (chapterId) => `/api/chapters/${chapterId}/lessons`,
    }),

  }),
  overrideExisting: true,
});

export const {
    useGetAllCoursesQuery,
    useGetCourseByIdQuery,
    useAddCourseMutation,
    useEditCourseMutation,
    useDeleteCourseMutation,
    useGetAllCourseByCategoryQuery,
    useGetAllCourseByInstructorQuery,
    useGetAllLessonsByChapterIdQuery,
} = courseApiSlice;
