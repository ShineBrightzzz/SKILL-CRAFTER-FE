import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllLessonsByChapterIdQuery } from '@/services/course.service';
import { RootState } from '@/store/store';
import { 
  setCurrentLesson,
  setChapterLessons,
  setLessonProgress,
  saveUserCode,
  setLessonLoading,
  setLessonError
} from '@/store/slices/lessonSlice';
import { Lesson } from '@/store/slices/courseSlice';

// Hook to get chapter lessons with caching
export const useChapterLessons = (chapterId: string) => {
  const dispatch = useDispatch();
  const cachedLessons = useSelector(
    (state: RootState) => state.lessons.lessonsByChapterId[chapterId]
  );
  const isLoading = useSelector((state: RootState) => state.lessons.loading);
  
  // Only fetch if we don't have the lessons cached
  const shouldFetch = !cachedLessons && chapterId;
  
  const { 
    data: lessonsResponse,
    isLoading: apiLoading,
    error: apiError
  } = useGetAllLessonsByChapterIdQuery(chapterId, {
    skip: !shouldFetch,
  });

  useEffect(() => {
    if (shouldFetch) {
      dispatch(setLessonLoading(true));
    }
  }, [shouldFetch, dispatch]);

  useEffect(() => {
    if (lessonsResponse?.data?.result && shouldFetch) {
      dispatch(setChapterLessons({
        chapterId,
        lessons: lessonsResponse.data.result
      }));
      dispatch(setLessonLoading(false));
    }
    
    if (apiError) {
      dispatch(setLessonError('Failed to load lessons'));
      dispatch(setLessonLoading(false));
    }
  }, [lessonsResponse, apiError, chapterId, shouldFetch, dispatch]);

  return {
    lessons: cachedLessons || lessonsResponse?.data?.result || [],
    isLoading: isLoading || apiLoading,
    pagination: lessonsResponse?.data?.meta || { page: 1, pageSize: 10, pages: 1, total: 0 }
  };
};

// Hook to manage the current lesson
export const useCurrentLesson = (initialLesson?: Lesson | null) => {
  const dispatch = useDispatch();
  const currentLesson = useSelector((state: RootState) => state.lessons.currentLesson);
  
  // Set initial lesson if provided and no current lesson exists
  useEffect(() => {
    if (initialLesson && !currentLesson) {
      dispatch(setCurrentLesson(initialLesson));
    }
  // Only run this effect when the component mounts or initialLesson changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLesson, dispatch]);
    // Function to change the current lesson
  const changeLesson = (lesson: Lesson) => {
    // Make sure lesson is defined and has necessary properties
    if (!lesson || !lesson.id) {
      console.warn('Attempted to set an invalid lesson:', lesson);
      return;
    }
    
    // Prevent unnecessary updates if the lesson is the same
    if (currentLesson && lesson.id === currentLesson.id) {
      return;
    }
    
    dispatch(setCurrentLesson(lesson));
  };
  
  return {
    currentLesson: currentLesson || initialLesson || null,
    changeLesson: changeLesson // Explicitly return the function
  };
};

// Hook to save and retrieve user code for coding exercises
export const useUserCode = (lessonId: string, initialCode: string = '') => {
  const dispatch = useDispatch();
  const savedCode = useSelector(
    (state: RootState) => state.lessons.userCode[lessonId]
  );
  
  // Function to save code to Redux
  const saveCode = (code: string) => {
    dispatch(saveUserCode({ lessonId, code }));
  };
  
  // Return saved code or initial code if none saved
  return {
    code: savedCode || initialCode,
    saveCode
  };
};
