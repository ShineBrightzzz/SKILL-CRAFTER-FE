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
import { 
  useAuth, 
  useCourse, 
  useCourseChapters, 
  useCurrentLesson,
  useUserCode 
} from '@/store/hooks';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setLessons } from '@/store/slices/lessonSlice';
import { 
  useCompleteLessonMutation, 
  useGetLessonProgressByLessonIdQuery,
  useGetLessonProgressByUserIdQuery
} from '@/services/lesson.service';
import { useEnrollCourseMutation, useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
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
  chapters: any[],
  chapterLessons: { [chapterId: string]: any[] },
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
  chapters: any[],
  chapterLessons: { [chapterId: string]: any[] },
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
  chapters: any[],
  chapterLessons: { [chapterId: string]: any[] },
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
    
  // Use our custom hooks for Redux state management
  const { course, isLoading: courseLoading } = useCourse(params.id);
  const { chapters, isLoading: chaptersLoading } = useCourseChapters(params.id);
  
  // For managing the current lesson
  const { currentLesson, changeLesson, markLessonCompleted } = useCurrentLesson();
  
  // State for tracking which chapters' lessons have been loaded
  const [loadedChapters, setLoadedChapters] = useState<Set<string>>(new Set());
  
  // Local state to track lessons by chapter
  const [chapterLessons, setChapterLessons] = useState<{[key: string]: any[]}>({});
  
  // Local enrollment state
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  
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
  
  // Combined enrollment status
  const effectivelyEnrolled = isEnrolled || (isLocalEnrolled && !enrollmentsLoading);
  
  // Course enrollment mutation
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

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
    // Get all chapters' lessons using our custom hook
  const chaptersWithLessons = useAppSelector((state) => state.lessons.byChapter);
  const allLessons = useAppSelector((state) => state.lessons.lessons);
  const dispatch = useAppDispatch();

  // Use RTK Query to get lessons data
  const { useGetLessonsByChapterIdQuery } = require('@/services/lesson.service');
  
  // Function to load lessons for a chapter
  const loadChapterLessons = useCallback((chapterId: string) => {
    // Skip if already loaded
    if (loadedChapters.has(chapterId)) return;
    
    // Mark as loaded
    setLoadedChapters(prev => new Set([...prev, chapterId]));
    
    // Fetch lessons using RTK Query
    const fetchLessons = async () => {
      try {
        // Get cached lessons first if available
        const cachedLessonIds = chaptersWithLessons[chapterId] || [];
        let lessonsToProcess = [];
        
        if (cachedLessonIds.length > 0) {
          // Use cached lessons from redux store
          lessonsToProcess = cachedLessonIds.map(id => allLessons[id]);
        } else {
          // No cached data, fetch from API
          const result = await fetch(`/api/lessons/chapter/${chapterId}`);
          const data = await result.json();
          
          if (data.success && data.data.result) {
            // Save lessons to redux store
            dispatch(setLessons(data.data.result));
            lessonsToProcess = data.data.result;
          } else {
            console.error('Failed to fetch lessons:', data);
            return;
          }
        }
        
        // Process lessons with progress data
        const processedLessons = lessonsToProcess.map(lesson => {
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
        
        // Update chapter lessons
        setChapterLessons(prev => ({
          ...prev,
          [chapterId]: processedLessons
        }));
      } catch (error) {
        console.error('Error loading chapter lessons:', error);
      }
    };
    
    fetchLessons();
  }, [loadedChapters, allLessonProgressData, chaptersWithLessons, allLessons, dispatch]);
  
  // Function to toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
        return newSet;
      } else {
        newSet.add(chapterId);
        // Load lessons if not already loaded
        if (!loadedChapters.has(chapterId)) {
          loadChapterLessons(chapterId);
        }
        return newSet;
      }
    });
  };
  // Effect to handle first load and pre-load first chapter's lessons
  useEffect(() => {
    if (!chaptersLoading && chapters.length > 0 && !searchParams.activityId) {
      // Default to loading first chapter's lessons on first load
      const firstChapterId = chapters[0].id;
      if (firstChapterId && !loadedChapters.has(firstChapterId)) {
        // Expand the first chapter
        setExpandedChapters(prev => new Set([...prev, firstChapterId]));
        
        // Load lessons for the first chapter
        loadChapterLessons(firstChapterId);
      }
    }
  }, [chaptersLoading, chapters, searchParams.activityId, loadedChapters, loadChapterLessons]);
    // Effect to handle activityId changes
  useEffect(() => {
    if (!searchParams.activityId || chaptersLoading || chapters.length === 0) return;
    
    const loadChaptersAndFindLesson = async () => {
      // Try to find the chapter for this lesson
      let foundLesson = false;
      
      // First, check if the lesson already exists in our local state
      for (const chapter of chapters) {
        const chapterLessonList = chapterLessons[chapter.id] || [];
        const targetLesson = chapterLessonList.find(lesson => lesson.id === searchParams.activityId);
        
        if (targetLesson) {
          changeLesson(targetLesson);
          foundLesson = true;
          
          // Ensure this chapter is expanded
          setExpandedChapters(prev => new Set([...prev, chapter.id]));
          break;
        }
      }
      
      // If we didn't find the lesson, load all chapters' lessons
      if (!foundLesson) {
        // For each chapter, load its lessons if not already loaded
        for (const chapter of chapters) {
          if (!loadedChapters.has(chapter.id)) {
            // Load lessons for this chapter and expand it
            setExpandedChapters(prev => new Set([...prev, chapter.id]));
            loadChapterLessons(chapter.id);
          }
        }
      }
    };
    
    loadChaptersAndFindLesson();
  }, [
    searchParams.activityId, 
    chapters, 
    chaptersLoading, 
    loadedChapters, 
    chapterLessons, 
    loadChapterLessons, 
    changeLesson
  ]);
  
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
        markLessonCompleted(currentLesson.id, true);
        
        // Also update in the local chapter lessons array
        if (currentLesson.chapterId) {
          setChapterLessons(prev => {
            const chapterLessonList = prev[currentLesson.chapterId] || [];
            const updatedLessons = chapterLessonList.map(lesson => 
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
  }, [lessonProgressData, currentLesson, markLessonCompleted]);

  // Find the first lesson for the course
  const firstLesson = useMemo(() => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      const firstChapterLessons = chapterLessons[firstChapter.id] || [];
      if (firstChapterLessons.length > 0) {
        return firstChapterLessons[0];
      }
    }
    return null;
  }, [chapters, chapterLessons]);  

  // Effect to redirect to first lesson if needed
  useEffect(() => {
    // Only redirect if user is enrolled, first lesson exists, no activityId is provided,
    // and chapters are loaded
    if (effectivelyEnrolled && firstLesson && !searchParams.activityId && !chaptersLoading) {
      const lessonId = firstLesson.id;
      if (lessonId) {
        // Redirect to first lesson URL
        router.push(`/learning/${params.id}?activityId=${lessonId}`);
        // Update current lesson state
        changeLesson(firstLesson);
      }
    }
  }, [
    effectivelyEnrolled, 
    firstLesson, 
    searchParams.activityId, 
    chaptersLoading, 
    params.id, 
    router, 
    changeLesson
  ]);
  
  // Complete lesson mutation
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

      // Update the lesson completion status in state
      markLessonCompleted(currentLesson.id, true);
      
      // Update in the local chapter lessons array
      if (currentLesson.chapterId) {
        setChapterLessons(prev => {
          const chapterLessonList = prev[currentLesson.chapterId] || [];
          const updatedLessons = chapterLessonList.map(lesson => 
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

  // Render the appropriate content based on lesson type
  const renderLessonContent = () => {
    if (!currentLesson) return null;
    
    switch (currentLesson.type) {
      case 3:
        return renderProgrammingExercise(currentLesson);
      default:
        return renderNormalLesson();
    }
  };

  // Render coding/programming exercise (type === 3)
  const renderProgrammingExercise = (lesson: any) => {
    const { code, saveCode } = useUserCode(lesson.id);
    
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
              initialCode={lesson.initialCode || code || '// Write your code here\n// Viết code của bạn ở đây'}
              language={lesson.language || 'javascript'}
              lessonId={lesson.id}
              useReduxStore={true}
              onComplete={handleCompleteLesson}
              onCodeChange={saveCode}
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
  const renderNormalLesson = () => {
    return (
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-76px)] bg-white border-r">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-4">NỘI DUNG KHÓA HỌC</h3>
            {renderChapters()}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderCompleteLessonButton()}
            <div className="prose max-w-none">                    
              {renderLessonTypeContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the chapters list in sidebar
  const renderChapters = () => {
    if (chaptersLoading) {
      return (
        <div className="py-4 text-center">
          <p className="text-gray-500">Đang tải nội dung...</p>
        </div>
      );
    }
    
    return chapters.map((chapter: any, chapterIndex: number) => (
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
            {!loadedChapters.has(chapter.id) ? (
              <div className="py-2 text-gray-500">Đang tải...</div>
            ) : renderLessons(chapter, chapterIndex)}
          </div>
        )}
      </div>
    ));
  };

  // Render lessons for each chapter
  const renderLessons = (chapter: any, chapterIndex: number) => {
    return (chapterLessons[chapter.id] || [])
      .filter(lesson => lesson.chapterId === chapter.id)
      .map((lesson: any, lessonIndex: number) => {
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
              changeLesson(lesson);
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
  };

  // Render the complete lesson button for video and reading lessons
  const renderCompleteLessonButton = () => {
    if (!currentLesson || (currentLesson.type !== 2 && currentLesson.type !== 4)) return null;
    
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
  };

  // Render content based on lesson type
  const renderLessonTypeContent = () => {
    if (!currentLesson) return null;
    
    // Check if lesson is completed
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isLessonCompleted = currentLesson.isCompleted || (lessonProgress?.status === "1");
    
    switch (currentLesson.type) {
      case 1: // Quiz
        return currentLesson.quizData && (
          <Quiz 
            data={currentLesson.quizData} 
            onComplete={(success) => {
              // Only mark as complete if all answers are correct
              if (success && !isLessonCompleted) {
                handleCompleteLesson();
              }
            }} 
          />
        );
      case 2: // Video
        return currentLesson.videoUrl && (
          <>
            <VideoPlayer 
              src={currentLesson.videoUrl}
              className="w-full relative z-10"
            />
            <VideoPlayer 
              src={currentLesson.videoUrl}
              backgroundMode={true}
              className="background-video"
            />
          </>
        );
      case 4: // Reading
        return currentLesson.content && <MarkdownCode content={currentLesson.content} />;
      default:
        return <p>Loại bài học không được hỗ trợ</p>;
    }
  };

  // Handle lesson navigation
  const handlePreviousLesson = () => {
    if (!currentLesson) return;
    
    const prevLesson = getPreviousLesson(chapters, chapterLessons, currentLesson.id);
    if (prevLesson) {
      router.push(`/learning/${params.id}?activityId=${prevLesson.id}`);
      changeLesson(prevLesson);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    
    const nextLesson = getNextLesson(chapters, chapterLessons, currentLesson.id);
    if (nextLesson) {
      router.push(`/learning/${params.id}?activityId=${nextLesson.id}`);
      changeLesson(nextLesson);
    }
  };

  // Render lesson number buttons
  const renderLessonNumbers = () => {
    if (!currentLesson) return null;
    
    // Check if current lesson is completed from progress data
    const lessonProgress = lessonProgressData?.data?.result?.[0];
    const isCurrentLessonCompleted = lessonProgress?.status === "1" || currentLesson.isCompleted;
    
    // Create a set to track unique lesson IDs
    const uniqueLessons = new Set();
    
    // First, collect all unique lessons in order
    const allLessons = chapters.flatMap((chapter) => {
      const chapterLessonList = chapterLessons[chapter.id] || [];
      return chapterLessonList.map(lesson => lesson);
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
      // Use the isCompleted flag from the lesson object
      const isCompleted = isActive ? isCurrentLessonCompleted : lesson.isCompleted;
      
      return (
        <Link
          key={lesson.id}
          onClick={(e) => {
            e.preventDefault();
            changeLesson(lesson);
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
                <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
                <div className="space-y-4">
                  {chaptersLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Đang tải nội dung khóa học...</p>
                    </div>
                  ) : chapters.map((chapter: any, index: number) => (
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
                      {/* Only render lessons when chapter is expanded */}
                      {expandedChapters.has(chapter.id) && (
                        <div className="ml-8 space-y-2 mt-3">
                          {!loadedChapters.has(chapter.id) ? (
                            <div className="py-2 text-gray-500">Đang tải...</div>
                          ) : (
                            (chapterLessons[chapter.id] || [])
                              .filter(lesson => lesson.chapterId === chapter.id)
                              .map((lesson: any, lessonIndex: number) => (
                                <div 
                                  key={lesson.id}
                                  className={`flex justify-between items-center text-gray-600 py-1 px-2 rounded-md transition-colors
                                    ${currentLesson?.id === lesson.id ? 'bg-blue-50 text-blue-600' : 'hover:text-blue-600'}`}
                                  role="button"
                                  onClick={() => {
                                    changeLesson(lesson);
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
                    <span className="text-gray-600">{chapters.length || 0} chương học</span>
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
                  </button>
                ) : (
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
        </div>
      ) : (
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
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousLesson}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getPreviousLesson(chapters, chapterLessons, currentLesson.id)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {/* Display lesson numbers */}
                  {renderLessonNumbers()}
                  <button
                    onClick={handleNextLesson}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getNextLesson(chapters, chapterLessons, currentLesson.id)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {renderLessonContent()}
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
