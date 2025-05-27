import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { 
  useGetLessonsByChapterIdQuery, 
  useGetLessonByIdQuery 
} from '@/services/lesson.service';
import { 
  setLesson, 
  setLessons, 
  setCurrentLesson, 
  saveUserCode, 
  updateLessonCompletion 
} from '../slices/lessonSlice';

/**
 * Hook to get a lesson by ID from either the Redux store or API
 */
export const useLesson = (lessonId: string) => {
  const dispatch = useAppDispatch();
  
  // Get the lesson from Redux store if it exists
  const lesson = useAppSelector((state: RootState) => 
    state.lessons.lessons[lessonId]
  );
  
  // Use RTK Query to fetch the lesson data
  const { 
    data: lessonResponse, 
    isLoading: isFetching,
    error
  } = useGetLessonByIdQuery(lessonId, {
    // Skip fetching if we already have the data cached
    skip: !!lesson
  });
  
  // Save lesson to Redux when it's fetched
  useEffect(() => {
    if (lessonResponse?.data && !lesson) {
      dispatch(setLesson(lessonResponse.data));
    }
  }, [lessonResponse, lesson, dispatch]);
  
  return {
    lesson: lesson || lessonResponse?.data,
    isLoading: isFetching && !lesson,
    error
  };
};

/**
 * Hook to get all lessons for a chapter
 */
export const useChapterLessons = (chapterId: string) => {
  const dispatch = useAppDispatch();
  
  // Get all lesson IDs for this chapter from Redux store
  const lessonIds = useAppSelector((state: RootState) => 
    state.lessons.byChapter[chapterId] || []
  );
  
  // Get all lessons from Redux store
  const lessonsMap = useAppSelector((state: RootState) => 
    state.lessons.lessons
  );
  
  // Use RTK Query to fetch all lessons for this chapter
  const { 
    data: lessonsResponse, 
    isLoading: isFetching,
    error
  } = useGetLessonsByChapterIdQuery(chapterId, {
    // Skip fetching if we already have lessons for this chapter
    skip: lessonIds.length > 0
  });
  
  // Save lessons to Redux when they're fetched
  useEffect(() => {
    if (lessonsResponse?.data?.result && lessonIds.length === 0) {
      dispatch(setLessons(lessonsResponse.data.result));
    }
  }, [lessonsResponse, lessonIds.length, dispatch, chapterId]);
  
  // Convert lessons map to array
  const lessons = lessonIds.map(id => lessonsMap[id]);
  
  return {
    lessons: lessons.length > 0 ? lessons : lessonsResponse?.data?.result || [],
    isLoading: isFetching && lessons.length === 0,
    error
  };
};

/**
 * Hook to manage the current lesson
 */
export const useCurrentLesson = () => {
  const dispatch = useAppDispatch();
  
  // Get current lesson ID from Redux
  const currentLessonId = useAppSelector((state: RootState) => 
    state.lessons.currentLessonId
  );
  
  // Get current lesson from Redux if it exists
  const currentLesson = useAppSelector((state: RootState) => 
    currentLessonId ? state.lessons.lessons[currentLessonId] : null
  );
  
  // Function to change the current lesson
  const changeLesson = (lessonIdOrObject: string | any) => {
    let lessonId: string;
    
    if (typeof lessonIdOrObject === 'string') {
      lessonId = lessonIdOrObject;
    } else if (lessonIdOrObject && lessonIdOrObject.id) {
      lessonId = lessonIdOrObject.id;
      // Also save the lesson object to Redux if provided
      dispatch(setLesson(lessonIdOrObject));
    } else {
      console.error('Invalid lesson provided to changeLesson:', lessonIdOrObject);
      return;
    }
    
    dispatch(setCurrentLesson(lessonId));
  };
  
  // Function to mark a lesson as completed
  const markLessonCompleted = (lessonId: string, isCompleted = true) => {
    dispatch(updateLessonCompletion({ lessonId, isCompleted }));
  };
  
  return {
    currentLesson,
    currentLessonId,
    changeLesson,
    markLessonCompleted
  };
};

/**
 * Hook to manage user code for programming exercises
 */
export const useUserCode = (lessonId: string) => {
  const dispatch = useAppDispatch();
  
  // Get user code from Redux
  const code = useAppSelector((state: RootState) => 
    state.lessons.userCode[lessonId] || ''
  );
  
  // Function to save user code
  const saveCode = (newCode: string) => {
    dispatch(saveUserCode({ lessonId, code: newCode }));
  };
  
  return {
    code,
    saveCode
  };
};
