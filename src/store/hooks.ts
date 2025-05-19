import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from './store';
import { 
  useGetCourseByIdQuery, 
  useGetEnrollmentsByUserIdQuery, 
  useEnrollCourseMutation 
} from '@/services/course.service';
import { setCourse } from './slices/courseSlice';
import { addEnrollment } from './slices/enrollmentSlice';
import { setCurrentLesson, saveUserCode } from './slices/lessonSlice';
import { toast } from 'react-toastify';

// Import hooks from hook files
import { useAuth } from './hooks/authHooks';
import { useCurrentLesson, useUserCode, useChapterLessons } from './hooks/lessonHooks';

// Base Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export hooks from separate files
export { useAuth, useCurrentLesson, useUserCode, useChapterLessons };

// Hooks for accessing and managing the course state
export const useGetCourse = (courseId: string) => {
  const dispatch = useAppDispatch();
  // Get the course from Redux store if it exists, otherwise use the API
  const cachedCourse = useAppSelector((state: RootState) => 
    state.courses.courses[courseId]
  );
  
  // Use RTK Query to fetch the course data
  const { 
    data: courseResponse, 
    isLoading: isFetching,
    error
  } = useGetCourseByIdQuery(courseId, {
    // Skip fetching if we already have the data cached
    skip: !!cachedCourse
  });
    // Save course to Redux when it's fetched
  useEffect(() => {
    if (courseResponse?.data && !cachedCourse) {
      dispatch(setCourse(courseResponse.data));
    }
  }, [courseResponse, cachedCourse, dispatch]);
  
  // Extract the course data
  const course = cachedCourse || courseResponse?.data;
  
  return {
    course,
    isLoading: isFetching && !cachedCourse,
    error
  };
};

// Hook to check enrollment status and handle enrollment
export const useCheckEnrollment = (courseId: string, userId?: string) => {
  const dispatch = useAppDispatch();
  
  // Get enrollments from Redux
  const userEnrollmentIds = useAppSelector((state: RootState) => 
    state.enrollments.userEnrollmentIds
  );
  const isEnrolled = userEnrollmentIds.includes(courseId);
  const enrollmentsLoaded = useAppSelector((state: RootState) => 
    state.enrollments.userEnrollmentsLoaded
  );

  // Only fetch enrollments if we have a userId
  const { data: enrollmentsResponse, isLoading, isError } = useGetEnrollmentsByUserIdQuery(
    { userId: userId || '' },
    { 
      skip: !userId,
      refetchOnMountOrArgChange: true
    }
  );

  // Update enrollments in Redux when the response changes
  useEffect(() => {
    if (enrollmentsResponse?.data && Array.isArray(enrollmentsResponse.data) && enrollmentsResponse.data.length > 0) {
      dispatch(addEnrollment(enrollmentsResponse.data));
    }
  }, [enrollmentsResponse, dispatch]);

  // Check directly from API response if not found in Redux state
  const isEnrolledFromApi = enrollmentsResponse?.data?.some(
    (enrollment: any) => enrollment.courseId === courseId
  ) || false;
  
  return {
    // Consider enrolled if either Redux state or API indicates enrollment
    isEnrolled: isEnrolled || isEnrolledFromApi,
    enrollmentsLoading: isLoading,
    enrollmentsError: isError,
    enrollmentsLoaded
  };
};

// Hook for enrolling in courses
export const useEnrollCourse = () => {
  const dispatch = useAppDispatch();
  const [enrollCourseApi, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  
  // Function to handle enrollment
  const handleEnrollment = async (courseId: string, userId: string) => {
    if (!userId) return { success: false, error: 'User not logged in' };
    
    try {
      const result = await enrollCourseApi({ courseId, userId }).unwrap();
      
      // If successful, add to Redux
      if (result?.data) {
        // Create enrollment object if API response doesn't match our expected format
        const enrollmentData = result.data.courseId ? result.data : {
          id: result.data.id || `${userId}-${courseId}`, // Generate ID if not provided
          userId: userId,
          courseId: courseId,
          enrollmentDate: new Date().toISOString(),
          progress: 0
        };
        
        dispatch(addEnrollment(enrollmentData));
        toast.success('Đăng ký khóa học thành công!');
        return { success: true };
      }
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
      return { success: false, error: 'Unknown error' };
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
      return { success: false, error };
    }
  };
  
  return {
    enrollInCourse: handleEnrollment,
    isEnrolling
  };
};

// The useCurrentLesson hook has been moved to src/store/hooks/lessonHooks.ts

// The useUserCode hook has been moved to src/store/hooks/lessonHooks.ts