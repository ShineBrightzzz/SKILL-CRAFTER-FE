import apiSlice from './api';

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Extend with category and instructor specific params
interface CategoryParams extends PaginationParams {
  categoryId: string;
}

interface InstructorParams extends PaginationParams {
  instructorId: string;
}

interface EnrollmentParams extends PaginationParams {
  userId?: string;
  courseId?: string;
}

export const courseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query({
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
          
        return `/api/courses${queryString}`;
      },
    }),
    getCourseById: builder.query({
        query: (courseId) => `/api/courses/${courseId}`,
    }),
    createCourse: builder.mutation({
      query: (formData) => ({
        url: '/api/courses',
        method: 'POST',
        body: formData,
        formData: true, // Enable multipart/form-data
        headers: {
          // Don't set Content-Type, it will be set automatically with boundary
          Accept: 'application/json',
        },
      }),
    }),
    updateCourse: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/courses/${id}`,
        method: 'PUT',
        body,
        formData: true,
        headers: {
          Accept: 'application/json',
        },
      }),
    }),
    deleteCourse: builder.mutation({
      query: ({courseId}) => ({
        url: `/api/courses/${courseId}`,
        method: 'DELETE',
      }),
    }),
    deleteCourseById: builder.mutation({
      query: ({id}) => ({
        url: `/api/courses/${id}`,
        method: 'DELETE',
      }),
    }),
    getAllCourseByCategory: builder.query({
      query: (params: CategoryParams) => {
        const { categoryId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/courses/category/${categoryId}${queryString}`;
      },
    }),    
    
    getAllCourseByInstructor: builder.query({
      query: (params: InstructorParams) => {
        const { instructorId, page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/courses/instructor/${instructorId}${queryString}`;
      },
    }),

    getAllLessonsByChapterId: builder.query({
      query: (chapterId: string, params: PaginationParams = {}) => {
        // Build query string for pagination
        const { page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/chapters/${chapterId}/lessons${queryString}`;
      },
    }),

    getEnrollmentsByUserId: builder.query({
      query: (params: EnrollmentParams) => {
        const { userId, page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/enrollments/user/${userId}${queryString}`;
      },
    }),

    getEnrollmentsByCourseId: builder.query({
      query: (params: EnrollmentParams) => {
        const { courseId, page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/enrollments/course/${courseId}${queryString}`;
      },
    }),

    enrollCourse: builder.mutation({
      query: ({ courseId, userId }) => ({
        url: `/api/enrollments/user/${userId}/course/${courseId}`,
        method: 'POST',
      }),
    }),
    unenrollCourse: builder.mutation({
      query: ({ courseId, userId }) => ({
        url: `/api/enrollments/user/${userId}/course/${courseId}`,
        method: 'DELETE',
      }),
    }),

  }),
  overrideExisting: true,
});

export const {
    useGetAllCoursesQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    useDeleteCourseByIdMutation,
    useGetAllCourseByCategoryQuery,
    useGetAllCourseByInstructorQuery,
    useGetAllLessonsByChapterIdQuery,
    useGetEnrollmentsByUserIdQuery,
    useEnrollCourseMutation,
    useUnenrollCourseMutation,
    useGetEnrollmentsByCourseIdQuery,
} = courseApiSlice;
