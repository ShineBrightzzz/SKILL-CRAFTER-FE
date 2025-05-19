import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useGetCourseByIdQuery, 
  useGetAllCoursesQuery,
  useGetEnrollmentsByUserIdQuery,
  useGetAllCourseByCategoryQuery,
  useGetAllCourseByInstructorQuery,
  useEnrollCourseMutation
} from '@/services/course.service';
import { RootState } from '@/store/store';
import { 
  setCourse, 
  setAllCourses, 
  setLoading as setCourseLoading,
  setError as setCourseError,
  setCategoryCoursesMap,
  setInstructorCoursesMap
} from '@/store/slices/courseSlice';
import { 
  setUserEnrollments,
  addEnrollment,
  setEnrollmentLoading,
  setEnrollmentError
} from '@/store/slices/enrollmentSlice';
import { toast } from 'react-toastify';

// Hook for getting a single course with caching
export const useGetCourse = (courseId: string) => {
  const dispatch = useDispatch();
  const course = useSelector((state: RootState) => state.courses.courses[courseId]);
  const isLoading = useSelector((state: RootState) => state.courses.loading);
  const error = useSelector((state: RootState) => state.courses.error);

  // Only fetch if we don't already have the course in Redux
  const shouldFetch = !course;
  const { data: courseResponse, isLoading: apiLoading, error: apiError } = useGetCourseByIdQuery(courseId, {
    skip: !shouldFetch,
  });

  useEffect(() => {
    if (shouldFetch) {
      dispatch(setCourseLoading(true));
    }
  }, [shouldFetch, dispatch]);

  useEffect(() => {
    if (apiLoading) {
      dispatch(setCourseLoading(apiLoading));
    }
  }, [apiLoading, dispatch]);

  useEffect(() => {
    if (apiError) {
      dispatch(setCourseError((apiError as any)?.data?.message || 'Có lỗi xảy ra khi tải thông tin khóa học'));
    }
  }, [apiError, dispatch]);

  useEffect(() => {
    if (courseResponse?.data && !course) {
      dispatch(setCourse(courseResponse.data));
      dispatch(setCourseLoading(false));
    }
  }, [courseResponse, course, dispatch]);

  return { 
    course: course || courseResponse?.data || null, 
    isLoading: isLoading || apiLoading,
    error: error || (apiError ? (apiError as any)?.data?.message || 'Có lỗi xảy ra' : null) 
  };
};

// Hook for checking if a user is enrolled in a course
export const useCheckEnrollment = (courseId: string, userId?: string) => {
  const dispatch = useDispatch();
  const isEnrolled = useSelector((state: RootState) => {
    const enrollmentIds = state.enrollments.userEnrollmentIds;
    return enrollmentIds.includes(courseId);
  });
  const enrollmentsLoaded = useSelector((state: RootState) => 
    state.enrollments.userEnrollmentsLoaded
  );
  
  const { 
    data: enrollmentsResponse, 
    isLoading: enrollmentLoading 
  } = useGetEnrollmentsByUserIdQuery(
    { userId: userId || '' },
    { skip: !userId || enrollmentsLoaded }
  );

  // Store enrollments in Redux when they come from the API
  useEffect(() => {
    if (enrollmentsResponse?.data && !enrollmentsLoaded && userId) {
      dispatch(setUserEnrollments(enrollmentsResponse.data));
    }
  }, [enrollmentsResponse, enrollmentsLoaded, userId, dispatch]);

  return {
    isEnrolled,
    isLoading: enrollmentLoading && !enrollmentsLoaded,
    enrollmentsLoaded
  };
};

// Hook for enrolling in a course with Redux state updates
export const useEnrollCourse = () => {
  const dispatch = useDispatch();
  const [enrollCourseApi, { isLoading }] = useEnrollCourseMutation();

  const enrollInCourse = async (courseId: string, userId: string) => {
    try {
      dispatch(setEnrollmentLoading(true));
      const response = await enrollCourseApi({ courseId, userId }).unwrap();
      
      // Add the enrollment to Redux
      if (response?.data) {
        dispatch(addEnrollment(response.data));
        toast.success('Đăng ký khóa học thành công!');
      }
      
      dispatch(setEnrollmentLoading(false));
      return { success: true };
    } catch (error) {
      dispatch(setEnrollmentError('Có lỗi xảy ra khi đăng ký khóa học'));
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
      dispatch(setEnrollmentLoading(false));
      return { success: false, error };
    }
  };

  return {
    enrollInCourse,
    isLoading
  };
};
