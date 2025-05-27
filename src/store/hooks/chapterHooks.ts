import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { 
  useGetChaptersByCourseIdQuery, 
  useGetChapterByIdQuery 
} from '@/services/chapter.service';
import { setChapter, setChapters } from '../slices/chapterSlice';

/**
 * Hook to get a chapter by ID from either the Redux store or API
 */
export const useChapter = (chapterId: string) => {
  const dispatch = useAppDispatch();
  
  // Get the chapter from Redux store if it exists
  const chapter = useAppSelector((state: RootState) => 
    state.chapters.chapters[chapterId]
  );
  
  // Use RTK Query to fetch the chapter data
  const { 
    data: chapterResponse, 
    isLoading: isFetching,
    error
  } = useGetChapterByIdQuery(chapterId, {
    // Skip fetching if we already have the data cached
    skip: !!chapter
  });
  
  // Save chapter to Redux when it's fetched
  useEffect(() => {
    if (chapterResponse?.data && !chapter) {
      dispatch(setChapter(chapterResponse.data));
    }
  }, [chapterResponse, chapter, dispatch]);
  
  return {
    chapter: chapter || chapterResponse?.data,
    isLoading: isFetching && !chapter,
    error
  };
};

/**
 * Hook to get all chapters for a course
 */
export const useCourseChapters = (courseId: string) => {
  const dispatch = useAppDispatch();
  
  // Get all chapter IDs for this course from Redux store
  const chapterIds = useAppSelector((state: RootState) => 
    state.chapters.byCourse[courseId] || []
  );
  
  // Get all chapters from Redux store
  const chaptersMap = useAppSelector((state: RootState) => 
    state.chapters.chapters
  );
  
  // Use RTK Query to fetch all chapters for this course
  const { 
    data: chaptersResponse, 
    isLoading: isFetching,
    error
  } = useGetChaptersByCourseIdQuery({
    courseId
  }, {
    // Skip fetching if we already have chapters for this course
    skip: chapterIds.length > 0
  });
  
  // Save chapters to Redux when they're fetched
  useEffect(() => {
    if (chaptersResponse?.data?.result && chapterIds.length === 0) {
      dispatch(setChapters(chaptersResponse.data.result));
    }
  }, [chaptersResponse, chapterIds.length, dispatch, courseId]);
  
  // Convert chapters map to array
  const chapters = chapterIds.map(id => chaptersMap[id]);
  
  return {
    chapters: chapters.length > 0 ? chapters : chaptersResponse?.data?.result || [],
    isLoading: isFetching && chapters.length === 0,
    error
  };
};
