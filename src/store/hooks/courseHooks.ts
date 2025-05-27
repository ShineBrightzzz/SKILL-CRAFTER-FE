import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { 
  useGetCourseByIdQuery, 
  useGetAllCoursesQuery 
} from '@/services/course.service';
import { setCourse, setCourses } from '../slices/courseSlice';

/**
 * Hook to get a course by ID from either the Redux store or API
 */
export const useCourse = (courseId: string) => {
  const dispatch = useAppDispatch();
  
  // Get the course from Redux store if it exists
  const course = useAppSelector((state: RootState) => 
    state.courses.courses[courseId]
  );
  
  // Use RTK Query to fetch the course data
  const { 
    data: courseResponse, 
    isLoading: isFetching,
    error
  } = useGetCourseByIdQuery(courseId, {
    // Skip fetching if we already have the data cached
    skip: !!course
  });
  
  // Save course to Redux when it's fetched
  useEffect(() => {
    if (courseResponse?.data && !course) {
      dispatch(setCourse(courseResponse.data));
    }
  }, [courseResponse, course, dispatch]);
  
  return {
    course: course || courseResponse?.data,
    isLoading: isFetching && !course,
    error
  };
};

/**
 * Hook to get all courses
 */
export const useCourses = (params = {}) => {
  const dispatch = useAppDispatch();
  
  // Get all course IDs from Redux store
  const courseIds = useAppSelector((state: RootState) => 
    state.courses.allIds
  );
  
  // Get all courses from Redux store
  const coursesMap = useAppSelector((state: RootState) => 
    state.courses.courses
  );
  
  // Use RTK Query to fetch all courses
  const { 
    data: coursesResponse, 
    isLoading: isFetching,
    error
  } = useGetAllCoursesQuery(params, {
    // Skip fetching if we already have courses
    skip: courseIds.length > 0
  });
  
  // Save courses to Redux when they're fetched
  useEffect(() => {
    if (coursesResponse?.data?.result && courseIds.length === 0) {
      dispatch(setCourses(coursesResponse.data.result));
    }
  }, [coursesResponse, courseIds.length, dispatch]);
  
  // Convert courses map to array
  const courses = courseIds.map(id => coursesMap[id]);
  
  return {
    courses: courses.length > 0 ? courses : coursesResponse?.data?.result || [],
    isLoading: isFetching && courses.length === 0,
    error
  };
};
