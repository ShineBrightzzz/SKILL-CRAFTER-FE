import apiSlice from './api';
import { ListResponse } from '@/types/api';
import { LessonsResponse } from './lesson.service';

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

// Define the Course type
interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  imageUrl?: string;
  paymentQrUrl?: string;
  duration: number;
  level: number;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
}

// Define the Enrollment type
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  // Add other enrollment properties as needed
}

// Response type for a single course
interface CourseResponse {
  data: Course;
}

// Response type for multiple courses
interface CoursesResponse extends ListResponse<Course> {}

// Response type for multiple enrollments  
interface EnrollmentsResponse extends ListResponse<Enrollment> {}

export const courseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query<CoursesResponse, PaginationParams>({
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
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' },
            ]
          : [{ type: 'Courses' as const, id: 'LIST' }],
    }),
      getCourseById: builder.query<CourseResponse, string>({
      query: (courseId) => `/api/courses/${courseId}`,
      providesTags: (result, error, id) => [{ type: 'Courses' as const, id }],
    }),
    
    createCourse: builder.mutation<Course, FormData>({
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
      invalidatesTags: [{ type: 'Courses' as const, id: 'LIST' }],
    }),
    
    updateCourse: builder.mutation<Course, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/courses/${id}`,
        method: 'PUT',
        body,
        formData: true,
        headers: {
          Accept: 'application/json',
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Courses' as const, id },
        { type: 'Courses' as const, id: 'LIST' },
      ],
    }),
    
    deleteCourse: builder.mutation<void, { courseId: string }>({
      query: ({courseId}) => ({
        url: `/api/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Courses' as const, id: courseId },
        { type: 'Courses' as const, id: 'LIST' },
      ],
    }),
    
    deleteCourseById: builder.mutation<void, { id: string }>({
      query: ({id}) => ({
        url: `/api/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Courses' as const, id },
        { type: 'Courses' as const, id: 'LIST' },
      ],
    }),
    
    getAllCourseByCategory: builder.query<CoursesResponse, CategoryParams>({
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
      },      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Category-${params.categoryId}` },
            ]
          : [
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Category-${params.categoryId}` },
            ],
    }),    
    
    getAllCourseByInstructor: builder.query<CoursesResponse, InstructorParams>({
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
      },      providesTags: (result, error, params) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Instructor-${params.instructorId}` },
            ]
          : [
              { type: 'Courses' as const, id: 'LIST' },
              { type: 'Courses' as const, id: `Instructor-${params.instructorId}` },
            ],
    }),

    getAllLessonsByChapterId: builder.query<LessonsResponse, { chapterId: string; params?: PaginationParams }>({
      query: ({ chapterId, params = {} }) => {
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
      providesTags: (result, error, { chapterId }) => 
        result
          ? [              ...result.data.result.map(({ id }: { id: string }) => ({ type: 'Lessons' as const, id })),
              { type: 'Lessons' as const, id: 'LIST' },
              { type: 'Lessons' as const, id: `Chapter-${chapterId}` },
            ]
          : [
              { type: 'Lessons' as const, id: 'LIST' },
              { type: 'Lessons' as const, id: `Chapter-${chapterId}` },
            ],
    }),

    getEnrollmentsByUserId: builder.query<EnrollmentsResponse, EnrollmentParams>({
      query: (params: EnrollmentParams) => {
        const { userId, page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/enrollments/user/${userId}${queryString}`;
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

    getEnrollmentsByCourseId: builder.query<EnrollmentsResponse, EnrollmentParams>({
      query: (params: EnrollmentParams) => {
        const { courseId, page, pageSize } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/enrollments/course/${courseId}${queryString}`;
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

    enrollCourse: builder.mutation<Enrollment, { courseId: string; userId: string }>({
      query: ({ courseId, userId }) => ({
        url: `/api/enrollments/user/${userId}/course/${courseId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { courseId, userId }) => [
        { type: 'Courses' as const, id: courseId },
        { type: 'Courses' as const, id: `User-${userId}` },
        { type: 'Courses' as const, id: `Course-${courseId}` },
      ],
    }),
    
    unenrollCourse: builder.mutation<void, { courseId: string; userId: string }>({
      query: ({ courseId, userId }) => ({
        url: `/api/enrollments/user/${userId}/course/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId, userId }) => [
        { type: 'Courses' as const, id: courseId },
        { type: 'Courses' as const, id: `User-${userId}` },
        { type: 'Courses' as const, id: `Course-${courseId}` },
      ],
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
