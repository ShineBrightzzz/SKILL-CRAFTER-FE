'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';
import MarkdownCode from '@/components/MarkdownCode';
import CodeEditor from '@/components/CodeEditor';
import { toast } from 'react-toastify';
import { useAuth } from '@/store/hooks';
import { 
  useGetLessonsByChapterIdQuery, 
  useCompleteLessonMutation, 
  useGetLessonProgressByLessonIdQuery,
  useGetLessonProgressByUserIdQuery,
  useGetLessonByIdQuery 
} from '@/services/lesson.service';
import { useGetChaptersByCourseIdQuery, useGetChapterByIdQuery } from '@/services/chapter.service';
import { useGetCourseByIdQuery, useEnrollCourseMutation, useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
import { skipToken } from '@reduxjs/toolkit/query/react';

// Define the page props interface
interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    activityId?: string;
  } & { [key: string]: string | string[] | undefined };
}

// Define types for the API response
interface Lesson {
  id: string;
  chapterId: string;
  chapterName: string;
  title: string;
  type: number;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order?: number;
  initialCode?: string;
  language?: string;
  quizData?: any;
  isCompleted?: boolean;
}

interface Chapter {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  estimatedTime: number;
  order?: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  imageUrl?: string;
  duration: number;
  level: number;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
}

// Map level number to text
const getLevelText = (level: number) => {
  switch (level) {
    case 1:
      return 'Cơ bản';
    case 2:
      return 'Trung cấp';
    case 3:
      return 'Nâng cao';
    default:
      return 'Không xác định';
  }
};

// Helper function to find a lesson in an array of chapters and lessons
const findLessonInChapters = (
  chapters: Chapter[],
  chapterLessons: { [chapterId: string]: Lesson[] },
  lessonId: string
) => {
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex];
    const lessons = chapterLessons[chapter.id] || [];
    
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex !== -1) {
      return { chapterIndex, lessonIndex, chapter, lesson: lessons[lessonIndex] };
    }
  }
  return null;
};

// Helper function to get the next lesson
const getNextLesson = (
  chapters: Chapter[],
  chapterLessons: { [chapterId: string]: Lesson[] },
  currentLessonId: string
) => {
  const result = findLessonInChapters(chapters, chapterLessons, currentLessonId);
  if (!result) return null;

  const { chapterIndex, lessonIndex, chapter } = result;
  const lessons = chapterLessons[chapter.id] || [];

  // Try next lesson in current chapter
  if (lessonIndex < lessons.length - 1) {
    return lessons[lessonIndex + 1];
  }

  // Try first lesson of next chapter
  if (chapterIndex < chapters.length - 1) {
    const nextChapter = chapters[chapterIndex + 1];
    const nextChapterLessons = chapterLessons[nextChapter.id] || [];
    return nextChapterLessons.length > 0 ? nextChapterLessons[0] : null;
  }

  return null;
};

// Helper function to get the previous lesson
const getPreviousLesson = (
  chapters: Chapter[],
  chapterLessons: { [chapterId: string]: Lesson[] },
  currentLessonId: string
) => {
  const result = findLessonInChapters(chapters, chapterLessons, currentLessonId);
  if (!result) return null;

  const { chapterIndex, lessonIndex, chapter } = result;
  const lessons = chapterLessons[chapter.id] || [];

  // Try previous lesson in current chapter
  if (lessonIndex > 0) {
    return lessons[lessonIndex - 1];
  }

  // Try last lesson of previous chapter
  if (chapterIndex > 0) {
    const previousChapter = chapters[chapterIndex - 1];
    const previousChapterLessons = chapterLessons[previousChapter.id] || [];
    return previousChapterLessons.length > 0 ? 
      previousChapterLessons[previousChapterLessons.length - 1] : null;
  }

  return null;
};

export default function CourseLearningPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuth();
    
  // Use RTK Query to fetch data
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;
    // Check enrollment
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetEnrollmentsByUserIdQuery(
    currentUser?.id ? { userId: currentUser.id } : skipToken
  );
  
  // Fetch all lesson progress data for the current user
  const { data: allLessonProgressData } = useGetLessonProgressByUserIdQuery(
    currentUser?.id ? currentUser.id : skipToken
  );
  
  // Check if user is enrolled in this course
  const isEnrolled = useMemo(() => {
    if (!enrollmentsData?.data?.result || !params.id) return false;
    return enrollmentsData.data.result.some((enrollment: any) => enrollment.courseId === params.id);
  }, [enrollmentsData, params.id]);
  
  // Course enrollment mutation
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  
  // Get chapters using RTK Query
  const { data: chaptersResponse, isLoading: chaptersLoading } = useGetChaptersByCourseIdQuery({
    courseId: params.id
  });
  const chapters = useMemo(() => {
    const result = chaptersResponse?.data?.result || [];
    return result;
  }, [chaptersResponse]);
  
  // State to track which chapter we're currently fetching
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Add state for managing loaded chapters and lessons
  const [loadedLessons, setLoadedLessons] = useState<{[key: string]: Lesson[]}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  
  // State for current lesson
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  // Local enrollment state
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  
  // Combined enrollment status
  const effectivelyEnrolled = isEnrolled || (isLocalEnrolled && !enrollmentsLoading);  // Function to change current lesson
  const changeLesson = useCallback((lesson: Lesson) => {
    if (!lesson || !lesson.id) {
      console.warn('Attempted to set an invalid lesson:', lesson);
      return;
    }
    
    // Prevent unnecessary updates if the lesson is the same
    if (currentLesson && lesson.id === currentLesson.id) {
      return;
    }
    
    setCurrentLesson(lesson);
  }, [currentLesson]);

  // Function to handle enrollment
  const handleEnrollment = async () => {
    if (!currentUser || !course) return;
    
    try {
      const result = await enrollCourse({ 
        courseId: params.id, 
        userId: currentUser.id 
      }).unwrap();
      
      // If enrollment was successful, update local state immediately
      if (result.success) {
        setIsLocalEnrolled(true);
        toast.success('Đăng ký khóa học thành công!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };
  
  // Function to fetch lessons for a chapter
  const fetchLessonsForChapter = useCallback((chapterId: string) => {
    // Skip if chapter is already loaded
    if (loadedLessons[chapterId]) return;
    
    // Set loading state and active chapter
    setLoadingStates(prev => ({ ...prev, [chapterId]: true }));
    setActiveChapterId(chapterId);
  }, [loadedLessons]);
  
  // Function to toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
        return newSet;
      } else {
        newSet.add(chapterId);
        // Only fetch if not already loaded
        if (!loadedLessons[chapterId]) {
          fetchLessonsForChapter(chapterId);
        }
        return newSet;
      }
    });
  };
  // Effect to handle first load and pre-load first chapter's lessons
  useEffect(() => {
    if (!chaptersLoading && chapters.length > 0 && !activeChapterId && !searchParams.activityId) {
      // Default to loading first chapter's lessons on first load
      const firstChapterId = chapters[0].id;
      if (firstChapterId && !loadedLessons[firstChapterId]) {
        fetchLessonsForChapter(firstChapterId);
        setExpandedChapters(prev => new Set([...prev, firstChapterId]));
      }
    }
  }, [chaptersLoading, chapters, activeChapterId, searchParams.activityId, loadedLessons, fetchLessonsForChapter]);
  
  // Effect to handle activityId changes
  useEffect(() => {
    // Don't run the effect if chapters are still loading
    if (chaptersLoading || chapters.length === 0) return;

    // Handle activityId changes
    if (searchParams.activityId) {
      // Find the chapter containing the lesson
      for (const chapter of chapters) {
        // Load lessons for this chapter if not already loaded and activityId matches
        if (!loadedLessons[chapter.id]) {
          fetchLessonsForChapter(chapter.id);
          // Add chapter to expanded set
          setExpandedChapters(prev => new Set([...prev, chapter.id]));
        }

        // If lessons are loaded, check if this is the right lesson
        if (loadedLessons[chapter.id]) {
          const lesson = loadedLessons[chapter.id].find(l => l.id === searchParams.activityId);
          if (lesson) {
            changeLesson(lesson);
            break;
          }
        }
      }
    } else if (chapters[0]?.id && !expandedChapters.size) {
      // Default to first lesson if no activityId and no chapters are expanded yet
      const firstChapterId = chapters[0].id;
      if (!loadedLessons[firstChapterId]) {
        fetchLessonsForChapter(firstChapterId);
      }
      setExpandedChapters(prev => new Set([...prev, firstChapterId]));
    }
  }, [searchParams.activityId, chapters, chaptersLoading, loadedLessons, changeLesson, expandedChapters, fetchLessonsForChapter]);

  // Fetch lessons for active chapter using RTK Query
  const { data: lessonsResponse } = useGetLessonsByChapterIdQuery(
    activeChapterId ?? skipToken
  );  
    // Effect to process lessons data when it arrives
  useEffect(() => {
    if (activeChapterId && lessonsResponse?.data?.result) {
      const lessons = lessonsResponse.data.result;
      const sortedLessons = [...lessons].sort((a, b) => 
        (a.order ?? 0) - (b.order ?? 0)
      );
      
      // Process lesson progress data
      const enhancedLessons = sortedLessons.map(lesson => {
        // Check if we have progress data for this lesson
        let isCompleted = false;
        
        // If we have progress data from the user query, use it
        if (allLessonProgressData?.data?.result) {
          const progressItem = allLessonProgressData.data.result.find(
            (progress: any) => progress.lessonId === lesson.id && progress.status === "1"
          );
          isCompleted = !!progressItem;
        }
        
        return {
          ...lesson,
          isCompleted
        };
      });
      
      setLoadedLessons(prev => ({
        ...prev,
        [activeChapterId]: enhancedLessons
      }));

      // Pre-load the lesson content if it's the current chapter
      if (searchParams.activityId && currentLesson?.chapterId === activeChapterId) {
        const lesson = enhancedLessons.find(l => l.id === searchParams.activityId);
        if (lesson) {
          changeLesson(lesson);
        }
      }

      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [activeChapterId]: false }));
      setActiveChapterId(null);
    }  
  }, [lessonsResponse, activeChapterId, searchParams.activityId, currentLesson?.chapterId, changeLesson, allLessonProgressData]);
  // Get progress for current lesson
  const { data: lessonProgressData } = useGetLessonProgressByLessonIdQuery(
    currentLesson?.id ? currentLesson.id : skipToken
  );
    // Effect to update current lesson completion status when progress data changes
  useEffect(() => {
    if (currentLesson && lessonProgressData?.data?.result?.[0]) {
      const progress = lessonProgressData.data.result[0];
      // If the lesson status is "1" (completed) and the current lesson is not marked as completed
      if (progress.status === "1" && !currentLesson.isCompleted) {
        // Update current lesson to show completed status
        setCurrentLesson(prev => 
          prev ? { ...prev, isCompleted: true } : prev
        );
        
        // Also update in the loaded lessons array
        if (currentLesson.chapterId) {
          setLoadedLessons(prev => {
            const chapterLessons = prev[currentLesson.chapterId] || [];
            const updatedLessons = chapterLessons.map(lesson => 
              lesson.id === currentLesson.id 
                ? { ...lesson, isCompleted: true } 
                : lesson
            );
            
            return {
              ...prev,
              [currentLesson.chapterId]: updatedLessons
            };
          });
        }
      }
    }
  }, [lessonProgressData, currentLesson]);

  // Find the first lesson for the course
  const firstLesson = useMemo(() => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      const firstChapterLessons = loadedLessons[firstChapter.id] || [];
      if (firstChapterLessons.length > 0) {
        return firstChapterLessons[0];
      }
    }
    return null;
  }, [chapters, loadedLessons]);  

  // Effect to redirect to first lesson if needed
  useEffect(() => {
    // Only redirect if user is enrolled, first lesson exists, no activityId is provided,
    // and chapters are loaded
    if (effectivelyEnrolled && firstLesson && !searchParams.activityId && !chaptersLoading) {
      const lessonId = firstLesson.id;
      if (lessonId && typeof changeLesson === 'function') {
        // Redirect to first lesson URL
        router.push(`/learning/${params.id}?activityId=${lessonId}`);
        // Update current lesson state
        changeLesson(firstLesson);
      }
    }
  }, [effectivelyEnrolled, firstLesson, searchParams.activityId, chaptersLoading, params.id, router, changeLesson]);  // Complete lesson mutation
  const [completingLesson, setCompletingLesson] = useState<boolean>(false);
  const [completeLesson] = useCompleteLessonMutation();
    // Function to handle lesson completion
  const handleCompleteLesson = async () => {
    if (!currentUser || !currentLesson) return;
    
    try {
      setCompletingLesson(true);
      await completeLesson({
        userId: currentUser.id,
        lessonId: currentLesson.id,
      }).unwrap();

      // Update the lesson completion status in local state
      if (currentLesson.chapterId) {
        // Mark the current lesson as completed in the local state
        setLoadedLessons(prev => {
          const chapterLessons = prev[currentLesson.chapterId] || [];
          const updatedLessons = chapterLessons.map(lesson => 
            lesson.id === currentLesson.id 
              ? { ...lesson, isCompleted: true } 
              : lesson
          );
          
          return {
            ...prev,
            [currentLesson.chapterId]: updatedLessons
          };
        });
        
        // Update current lesson to show completed status
        setCurrentLesson(prev => 
          prev ? { ...prev, isCompleted: true } : prev
        );
      }

      toast.success('Bài học đã được đánh dấu là hoàn thành!');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error('Có lỗi xảy ra khi hoàn thành bài học');
    } finally {
      setCompletingLesson(false);
    }  
  };

  // Reset local enrollment state when enrollment data changes
  useEffect(() => {
    if (!enrollmentsLoading && !isEnrolled) {
      // If we've loaded enrollment data and the user is not enrolled according to API
      // reset the local enrollment state to avoid incorrect display
      setIsLocalEnrolled(false);
    }
  }, [enrollmentsLoading, isEnrolled]);
  // Helper functions for rendering different lesson types

  // Render the appropriate content based on lesson type
  const renderLessonContent = (
    currentLesson: Lesson,
    chapters: Chapter[],
    expandedChapters: Set<string>,
    loadingStates: {[key: string]: boolean},
    loadedLessons: {[key: string]: Lesson[]},
    params: { id: string },
    changeLesson: (lesson: Lesson) => void,
    router: any,
    chaptersLoading: boolean,
    toggleChapter: (chapterId: string) => void,
    handleCompleteLesson: () => Promise<void>,
    completingLesson: boolean
  ) => {
    switch (currentLesson.type) {
      case 3:
        return renderProgrammingExercise(currentLesson);
      default:
        return renderNormalLesson(
          currentLesson,
          chapters,
          expandedChapters,
          loadingStates,
          loadedLessons,
          params,
          changeLesson,
          router,
          chaptersLoading,
          toggleChapter,
          handleCompleteLesson,
          completingLesson
        );
    }
  };

  // Render coding/programming exercise (type === 3)
  const renderProgrammingExercise = (lesson: Lesson) => {
    return (
      <div className="grid grid-cols-2 h-[calc(100vh-76px)]">
        {/* Left side - Content/Description */}
        <div className="border-r bg-white overflow-y-auto">
          <div className="p-6">
            {lesson.content ? (
              <div className="prose max-w-none">
                <MarkdownCode content={lesson.content} />
              </div>
            ) : (
              <div className="prose max-w-none">
                <h3>Bài tập: {lesson.title}</h3>
                <p>Vui lòng tạo một chương trình Java theo yêu cầu bên dưới:</p>
                <ul>
                  <li>Triển khai các yêu cầu của bài tập</li>
                  <li>Test tất cả các trường hợp có thể</li>
                  <li>Đảm bảo code rõ ràng và có comment đầy đủ</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Code Editor and Test */}
        <div className="flex flex-col bg-[#1e1e1e]">
          <div className="flex-1">
            <CodeEditor
              initialCode={lesson.initialCode || '// Write your code here\n// Viết code của bạn ở đây'}
              language={lesson.language || 'javascript'}
              lessonId={lesson.id}
              useReduxStore={true}
              onComplete={handleCompleteLesson}
            />
          </div>
          <div className="h-[300px] border-t border-gray-700 text-white overflow-y-auto">
            <div className="p-4">
              {/* Code testing area */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Render normal lessons (reading, video, quiz) - types 1, 2, 4
  const renderNormalLesson = (
    currentLesson: Lesson,
    chapters: Chapter[],
    expandedChapters: Set<string>,
    loadingStates: {[key: string]: boolean},
    loadedLessons: {[key: string]: Lesson[]},
    params: { id: string },
    changeLesson: (lesson: Lesson) => void,
    router: any,
    chaptersLoading: boolean,
    toggleChapter: (chapterId: string) => void,
    handleCompleteLesson: () => Promise<void>,
    completingLesson: boolean
  ) => {
    return (
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-76px)] bg-white border-r">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-4">NỘI DUNG KHÓA HỌC</h3>
            {renderChapters(
              chaptersLoading,
              chapters,
              expandedChapters,
              loadingStates,
              loadedLessons,
              currentLesson,
              params,
              toggleChapter,
              changeLesson,
              router
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderCompleteLessonButton(currentLesson, handleCompleteLesson, completingLesson)}
            <div className="prose max-w-none">                    
              {renderLessonTypeContent(currentLesson)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Render the chapters list in sidebar
  const renderChapters = (
    chaptersLoading: boolean,
    chapters: Chapter[],
    expandedChapters: Set<string>,
    loadingStates: {[key: string]: boolean},
    loadedLessons: {[key: string]: Lesson[]},
    currentLesson: Lesson,
    params: { id: string },
    toggleChapter: (chapterId: string) => void,
    changeLesson: (lesson: Lesson) => void,
    router: any
  ) => {
    if (chaptersLoading) {
      return (
        <div className="py-4 text-center">
          <p className="text-gray-500">Đang tải nội dung...</p>
        </div>
      );
    }
    
    return chapters.map((chapter: Chapter, chapterIndex: number) => (
      <div key={chapter.id} className="mb-4">
        <button
          onClick={() => toggleChapter(chapter.id)}
          className="flex items-center w-full text-left mb-2 text-gray-700 hover:text-blue-600"
        >
          {expandedChapters.has(chapter.id) ? (
            <ChevronDownIcon className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 mr-2" />
          )}
          <span className="text-sm font-medium">
            Chương {chapterIndex + 1}: {chapter.name}
          </span>
        </button>                        
        {expandedChapters.has(chapter.id) && (
          <div className="ml-6 space-y-2">
            {loadingStates[chapter.id] ? (
              <div className="py-2 text-gray-500">Đang tải...</div>
            ) : renderLessons(
              loadedLessons,
              chapter,
              chapterIndex,
              currentLesson,
              params,
              changeLesson,
              router
            )}
          </div>
        )}
      </div>
    ));
  };  // Render lessons for each chapter
  const renderLessons = (
    loadedLessons: {[key: string]: Lesson[]},
    chapter: Chapter,
    chapterIndex: number,
    currentLesson: Lesson,
    params: { id: string },
    changeLesson: (lesson: Lesson) => void,
    router: any
  ) => {
    return (loadedLessons[chapter.id] || [])
      .filter(lesson => lesson.chapterId === chapter.id)
      .map((lesson: Lesson, lessonIndex: number) => {
        // For the current lesson, check if it's completed from the progress data
        const isCurrentLesson = currentLesson?.id === lesson.id;
        const lessonProgress = isCurrentLesson ? lessonProgressData?.data?.result?.[0] : null;
        
        // Use the isCompleted flag from the lesson object, which is now populated from allLessonProgressData
        const isCompleted = lesson.isCompleted || (isCurrentLesson && lessonProgress?.status === "1");
        
        return (
          <Link
            key={lesson.id}
            href={`/learning/${params.id}?activityId=${lesson.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (typeof changeLesson === 'function') {
                changeLesson(lesson);
              }
              router.push(`/learning/${params.id}?activityId=${lesson.id}`);
            }}
            className={`flex justify-between items-center text-sm py-1 px-2 rounded-md ${
              currentLesson?.id === lesson.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div>{chapterIndex + 1}.{lessonIndex + 1} {lesson.title}</div>
            <div className={`h-4 w-4 border-2 rounded flex-shrink-0 ml-2 
              ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {isCompleted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="text-white h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </Link>
        );
      });
  };  // Render the complete lesson button for video and reading lessons
  const renderCompleteLessonButton = (
    currentLesson: Lesson,
    handleCompleteLesson: () => Promise<void>,
    completingLesson: boolean
  ) => {
    if (currentLesson.type !== 2 && currentLesson.type !== 4) return null;
    
    // Check if lesson is completed based on the lesson object's isCompleted property
    // or from the current lesson progress data as a fallback
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isLessonCompleted = currentLesson.isCompleted || lessonProgress?.status === "1";
    
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCompleteLesson}
          disabled={completingLesson || isLessonCompleted}
          className={`px-4 py-2 rounded-md text-white font-medium flex items-center space-x-2
            ${isLessonCompleted 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-blue-600 hover:bg-blue-700'} 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {completingLesson ? (
            <span>Đang xử lý...</span>
          ) : isLessonCompleted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Đã hoàn thành</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Đánh dấu hoàn thành</span>
            </>
          )}
        </button>
      </div>
    );
  };// Render content based on lesson type
  const renderLessonTypeContent = (lesson: Lesson) => {
    // Check if lesson is completed based on lesson object's isCompleted property 
    // which is now populated from allLessonProgressData
    // or from the current lesson progress data as a fallback
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isLessonCompleted = lesson.isCompleted || (lessonProgress?.status === "1");
    
    switch (lesson.type) {
      case 1: // Quiz
        return lesson.quizData && (
          <Quiz 
            data={lesson.quizData} 
            onComplete={(success) => {
              // Only mark as complete if all answers are correct
              if (success && !isLessonCompleted) {
                handleCompleteLesson();
              }
            }} 
          />
        );
      case 2: // Video
        return lesson.videoUrl && (
          <>
            <VideoPlayer 
              src={lesson.videoUrl}
              className="w-full relative z-10"
            />
            <VideoPlayer 
              src={lesson.videoUrl}
              backgroundMode={true}
              className="background-video"
            />
          </>
        );
      case 4: // Reading
        return lesson.content && <MarkdownCode content={lesson.content} />;
      default:
        return <p>Loại bài học không được hỗ trợ</p>;
    }
  };

  // Handle lesson navigation
  const handlePreviousLesson = (
    chapters: Chapter[],
    loadedLessons: {[key: string]: Lesson[]},
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {
    const prevLesson = getPreviousLesson(chapters, loadedLessons, currentLesson.id);
    if (prevLesson && typeof changeLesson === 'function') {
      router.push(`/learning/${params.id}?activityId=${prevLesson.id}`);
      changeLesson(prevLesson);
    }
  };

  const handleNextLesson = (
    chapters: Chapter[],
    loadedLessons: {[key: string]: Lesson[]},
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {    const nextLesson = getNextLesson(chapters, loadedLessons, currentLesson.id);
    if (nextLesson && typeof changeLesson === 'function') {
      router.push(`/learning/${params.id}?activityId=${nextLesson.id}`);
      changeLesson(nextLesson);
    }
  };

  // Render lesson number buttons
  const renderLessonNumbers = (
    chapters: Chapter[],
    loadedLessons: {[key: string]: Lesson[]},
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {
    // Check if current lesson is completed from progress data
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isCurrentLessonCompleted = lessonProgress?.status === "1" || currentLesson.isCompleted;
    
    // Create a set to track unique lesson IDs
    const uniqueLessons = new Set();
    
    // First, collect all unique lessons in order
    const allLessons = chapters.flatMap((chapter) => {
      const chapterLessons = loadedLessons[chapter.id] || [];
      return chapterLessons.map(lesson => lesson);
    });
    
    // Now render only unique lessons
    return allLessons.filter(lesson => {
      if (uniqueLessons.has(lesson.id)) {
        return false;
      }
      uniqueLessons.add(lesson.id);
      return true;
    }).map((lesson, overallIndex) => {
      const isActive = lesson.id === currentLesson.id;
      // Use the isCompleted flag from the lesson object, which is now populated from allLessonProgressData
      const isCompleted = isActive ? isCurrentLessonCompleted : lesson.isCompleted;
      
      return (
        <Link
          key={lesson.id}
          onClick={(e) => {
            e.preventDefault();
            if (typeof changeLesson === 'function') {
              changeLesson(lesson);
            }
            router.push(`/learning/${params.id}?activityId=${lesson.id}`);
          }}
          href={`/learning/${params.id}?activityId=${lesson.id}`}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer
            ${isActive 
              ? 'bg-white text-blue-900' 
              : isCompleted
                ? 'bg-green-500 text-white'
                : 'text-white hover:bg-blue-800'
            }`}
        >
          {overallIndex + 1}
        </Link>
      );
    });
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-gray-600">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-red-600">Có lỗi xảy ra khi tải thông tin khóa học</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!searchParams.activityId ? (
        /* Course Overview */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Course Info - Left Side */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-6">{course.description}</p>
                
                {effectivelyEnrolled ? (
                  /* Show "Vào học ngay" button if enrolled */
                  <button
                    onClick={() => {
                      if (firstLesson) {
                        router.push(`/learning/${params.id}?activityId=${firstLesson.id}`);
                      }
                    }}
                    disabled={isEnrolling || !firstLesson}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    {isEnrolling ? 'Đang xử lý...' : 'Vào học ngay'}
                  </button>
                ) : (
                  /* Show enrollment button if not enrolled */
                  <button
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {isEnrolling ? 'Đang xử lý...' : 'Đăng ký khóa học'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Course Details - Right Side */}
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="divide-y">
                  <div className="py-4">
                    <h3 className="text-lg font-medium">Thông tin khóa học</h3>
                  </div>
                  <div className="py-4">
                    <p className="flex justify-between">
                      <span>Cấp độ:</span>
                      <span>{getLevelText(course.level)}</span>
                    </p>
                  </div>
                  <div className="py-4">
                    <p className="flex justify-between">
                      <span>Thời lượng:</span>
                      <span>{course.duration ? `${course.duration} giờ` : "Chưa cập nhật"}</span>
                    </p>
                  </div>
                  <div className="py-4">
                    <p className="flex justify-between">
                      <span>Danh mục:</span>
                      <span>{course.categoryName || "Chưa phân loại"}</span>
                    </p>
                  </div>
                  <div className="py-4">
                    <p className="flex justify-between">
                      <span>Học phí:</span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ... existing code for lesson view
        <div className="min-h-screen">
          {currentLesson ? (
            <>
              {/* Navigation header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-900">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/learning/${params.id}`}
                    className="flex items-center text-white hover:text-blue-200 transition"
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  </Link>
                  <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                </div>                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviousLesson(chapters, loadedLessons, currentLesson, changeLesson, router, params)}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getPreviousLesson(chapters, loadedLessons, currentLesson.id)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {/* Display lesson number */}
                  {renderLessonNumbers(chapters, loadedLessons, currentLesson, changeLesson, router, params)}
                  <button
                    onClick={() => handleNextLesson(chapters, loadedLessons, currentLesson, changeLesson, router, params)}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getNextLesson(chapters, loadedLessons, currentLesson.id)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>              
                </div>              
                {renderLessonContent(currentLesson, chapters, expandedChapters, loadingStates, loadedLessons, params, changeLesson, router, chaptersLoading, toggleChapter, handleCompleteLesson, completingLesson)}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chọn một bài học để bắt đầu</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}