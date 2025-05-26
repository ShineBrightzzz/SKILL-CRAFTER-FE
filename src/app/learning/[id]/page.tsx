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
import { useGetLessonsByChapterIdQuery, useCompleteLessonMutation, useGetLessonProgressByLessonIdQuery } from '@/services/lesson.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
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
  lessons: Lesson[] | null;
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
  chapters?: Chapter[];
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

// Helper function to get chapter and lesson indices
const findLessonIndices = (course: Course, lessonId: string) => {
  for (let chapterIndex = 0; chapterIndex < (course.chapters?.length || 0); chapterIndex++) {
    const chapter = course.chapters?.[chapterIndex];
    if (chapter?.lessons) {
      const lessonIndex = chapter.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1) {
        return { chapterIndex, lessonIndex };
      }
    }
  }
  return null;
};

// Helper function to get the next lesson
const getNextLesson = (course: Course, currentLessonId: string) => {
  const indices = findLessonIndices(course, currentLessonId);
  if (!indices || !course.chapters) return null;

  const { chapterIndex, lessonIndex } = indices;
  const currentChapter = course.chapters[chapterIndex];

  // Try next lesson in current chapter
  if (currentChapter.lessons && lessonIndex < currentChapter.lessons.length - 1) {
    return currentChapter.lessons[lessonIndex + 1];
  }

  // Try first lesson of next chapter
  if (chapterIndex < course.chapters.length - 1) {
    const nextChapter = course.chapters[chapterIndex + 1];
    return nextChapter.lessons?.[0] || null;
  }

  return null;
};

// Helper function to get the previous lesson
const getPreviousLesson = (course: Course, currentLessonId: string) => {
  const indices = findLessonIndices(course, currentLessonId);
  if (!indices || !course.chapters) return null;

  const { chapterIndex, lessonIndex } = indices;
  const currentChapter = course.chapters[chapterIndex];

  // Try previous lesson in current chapter
  if (lessonIndex > 0 && currentChapter.lessons) {
    return currentChapter.lessons[lessonIndex - 1];
  }

  // Try last lesson of previous chapter
  if (chapterIndex > 0) {
    const previousChapter = course.chapters[chapterIndex - 1];
    if (previousChapter.lessons) {
      return previousChapter.lessons[previousChapter.lessons.length - 1];
    }
  }

  return null;
};

export default function CourseLearningPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuth();
    
  // Sử dụng RTK Query để lấy dữ liệu
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;
  
  // Kiểm tra đăng ký khoá học
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetEnrollmentsByUserIdQuery(
    currentUser?.id ? { userId: currentUser.id } : skipToken
  );
  
  // Kiểm tra xem người dùng đã đăng ký khóa học chưa
  const isEnrolled = useMemo(() => {
    if (!enrollmentsData?.data?.result || !params.id) return false;
    return enrollmentsData.data.result.some((enrollment: any) => enrollment.courseId === params.id);
  }, [enrollmentsData, params.id]);
  
  // Mutation cho việc đăng ký khóa học
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  
  // Get chapters using RTK Query
  const { data: chaptersResponse, isLoading: chaptersLoading } = useGetChaptersByCourseIdQuery({
    courseId: params.id
  });
  const chapters = chaptersResponse?.data?.result || [];

  // State to track which chapter we're currently fetching
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Add state for managing loaded chapters and lessons
  const [loadedLessons, setLoadedLessons] = useState<{[key: string]: Lesson[]}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  
  // Sử dụng local state cho current lesson
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  // Trạng thái đăng ký local
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  
  // Combined enrollment status from API and local state
  // Only consider isLocalEnrolled if we've confirmed enrollment through our API
  const effectivelyEnrolled = isEnrolled || (isLocalEnrolled && !enrollmentsLoading);
  // Function to change current lesson
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
  );  // Effect to process lessons data when it arrives
  useEffect(() => {
    if (activeChapterId && lessonsResponse?.data?.result) {
      const lessons = lessonsResponse.data.result;
      const sortedLessons = [...lessons].sort((a, b) => 
        (a.order ?? 0) - (b.order ?? 0)
      );
      
      // If the user is logged in, fetch their progress for each lesson
      const enhancedLessons = sortedLessons.map(lesson => {
        // Check if we have any existing progress data for this lesson
        let isCompleted = false;
        
        // Set isCompleted based on lesson's completion status
        // This will be updated with actual progress data when the lesson is viewed
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
    }  }, [lessonsResponse, activeChapterId, searchParams.activityId, currentLesson?.chapterId, changeLesson]);

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

  // Effect to find and load the first lesson when needed
  const firstLesson = useMemo(() => {
    if (course?.chapters && course.chapters.length > 0) {
      // Tìm chương đầu tiên
      const firstChapter = course.chapters[0];
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        // Trả về bài học đầu tiên của chương đầu tiên
        return firstChapter.lessons[0];
      }
    }
    // Nếu không có bài học nào, trả về null
    return null;
  }, [course]);  // Effect to redirect to first lesson if needed
  useEffect(() => {
    // Chỉ chuyển hướng nếu người dùng đã đăng ký khóa học và không có activityId 
    // và đã có dữ liệu của bài học đầu tiên
    if (effectivelyEnrolled && firstLesson && !searchParams.activityId && !chaptersLoading) {
      // Tự động tải bài học đầu tiên nếu người dùng đã đăng ký và chưa chọn bài học nào
      const lessonId = firstLesson.id;
      if (lessonId && typeof changeLesson === 'function') {
        // Chuyển hướng đến URL của bài học đầu tiên
        router.push(`/learning/${params.id}?activityId=${lessonId}`);
        // Cập nhật trạng thái bài học hiện tại
        changeLesson(firstLesson);
      }
    }
  }, [effectivelyEnrolled, firstLesson, searchParams.activityId, chaptersLoading, params.id, router, changeLesson]);  const [completingLesson, setCompletingLesson] = useState<boolean>(false);
  const [completeLesson] = useCompleteLessonMutation();
  
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
    }  };

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
    course: Course,
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
          course,
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
              useReduxStore={true}            />
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
    course: Course,
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
  };
  // Render lessons for each chapter
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
    
    // Check if lesson is completed based on progress data
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isLessonCompleted = lessonProgress?.status === "1" || currentLesson.isCompleted;
    
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
    // Check if lesson is completed based on progress data
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isLessonCompleted = lessonProgress?.status === "1" || lesson.isCompleted;
    
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
    course: Course,
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {
    const prevLesson = getPreviousLesson(course, currentLesson.id);
    if (prevLesson && typeof changeLesson === 'function') {
      router.push(`/learning/${params.id}?activityId=${prevLesson.id}`);
      changeLesson(prevLesson);
    }
  };

  const handleNextLesson = (
    course: Course,
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {
    const nextLesson = getNextLesson(course, currentLesson.id);
    if (nextLesson && typeof changeLesson === 'function') {
      router.push(`/learning/${params.id}?activityId=${nextLesson.id}`);
      changeLesson(nextLesson);
    }
  };
  // Render lesson number buttons
  const renderLessonNumbers = (
    course: Course,
    currentLesson: Lesson,
    changeLesson: (lesson: Lesson) => void,
    router: any,
    params: { id: string }
  ) => {
    // Check if current lesson is completed from progress data
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isCurrentLessonCompleted = lessonProgress?.status === "1" || currentLesson.isCompleted;
    
    return course.chapters?.map((chapter) => 
      chapter.lessons?.map((lesson) => {
        const indices = findLessonIndices(course, lesson.id);
        if (indices) {
          const isActive = lesson.id === currentLesson.id;
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
              {indices.lessonIndex + 1}
            </Link>
          );
        }
        return null;
      })
    );
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
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left side - Course info and content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    {course.categoryName || 'Chưa phân loại'}
                  </span>
                  <span className="text-sm text-gray-500">{getLevelText(course.level)}</span>
                </div>
                <p className="text-gray-600 mb-6">{course.description}</p>
              </div>

              {/* Course content overview */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>                <div className="space-y-4">
                  {chaptersLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Đang tải nội dung khóa học...</p>
                    </div>
                  ) : chapters.map((chapter: Chapter, index: number) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <div 
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center text-left mb-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                      >
                        {expandedChapters.has(chapter.id) ? (
                          <ChevronDownIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <span className="text-lg font-medium mr-2">Chương {index + 1}:</span>
                          <span className="text-lg">{chapter.name}</span>
                        </div>
                      </div>
                        {/* Only render lessons when chapter is expanded */}                      {expandedChapters.has(chapter.id) && (
                        <div className="ml-8 space-y-2 mt-3">
                          {loadingStates[chapter.id] ? (
                            <div className="py-2 text-gray-500">Đang tải...</div>
                          ) : (
                            (loadedLessons[chapter.id] || []).filter(lesson => lesson.chapterId === chapter.id).map((lesson: Lesson, lessonIndex: number) => (                              <div 
                                key={lesson.id}
                                className={`flex justify-between items-center text-gray-600 py-1 px-2 rounded-md transition-colors
                                  ${currentLesson?.id === lesson.id ? 'bg-blue-50 text-blue-600' : 'hover:text-blue-600'}`}
                                role="button"                                onClick={() => {
                                  if (typeof changeLesson === 'function') {
                                    // Cập nhật bài học hiện tại trong Redux store
                                    changeLesson(lesson);
                                  }
                                  // Chuyển hướng người dùng đến URL của bài học đã chọn
                                  router.push(`/learning/${params.id}?activityId=${lesson.id}`);
                                }}
                              >
                                <div>{index + 1}.{lessonIndex + 1} {lesson.title}</div>
                                {lesson.isCompleted && (
                                  <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-white h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Registration card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  {new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{course.duration ? `${course.duration} giờ học` : 'Không xác định'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                    <span className="text-gray-600">{course.chapters?.length || 0} chương học</span>
                  </div>
                </div>
                  {!currentUser ? (
                  <Link
                    href="/login"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium text-center block"
                  >
                    Đăng nhập để đăng ký
                  </Link>
                ) : !effectivelyEnrolled ? (
                  <button
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? 'Đang đăng ký...' : 'Đăng ký khóa học'}
                  </button>                ) : (
                  <Link
                    href={firstLesson?.id ? `/learning/${params.id}?activityId=${firstLesson.id}` : `/learning/${params.id}`}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition font-medium text-center block"
                  >
                    Vào học ngay
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>      ) : (
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
                    onClick={() => handlePreviousLesson(course, currentLesson, changeLesson, router, params)}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getPreviousLesson(course, currentLesson.id)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {/* Display lesson number */}
                  {renderLessonNumbers(course, currentLesson, changeLesson, router, params)}
                  <button
                    onClick={() => handleNextLesson(course, currentLesson, changeLesson, router, params)}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getNextLesson(course, currentLesson.id)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>              {renderLessonContent(currentLesson, course, chapters, expandedChapters, loadingStates, loadedLessons, params, changeLesson, router, chaptersLoading, toggleChapter, handleCompleteLesson, completingLesson)}
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