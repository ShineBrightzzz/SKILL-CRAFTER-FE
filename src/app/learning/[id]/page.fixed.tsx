'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';
import MarkdownCode from '@/components/MarkdownCode';
import CodeEditor from '@/components/CodeEditor';
import { toast } from 'react-toastify';
import { 
  useGetCourse,
  useCheckEnrollment,
  useEnrollCourse,
  useCurrentLesson,
  useUserCode,
  useAuth
} from '@/store/hooks';
import { useGetLessonsByChapterIdQuery } from '@/services/lesson.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { skipToken } from '@reduxjs/toolkit/query';

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
  
  // Use our custom hooks for better performance
  const { course, isLoading: courseLoading } = useGetCourse(params.id);
  const { isEnrolled } = useCheckEnrollment(params.id, currentUser?.id);
  const { enrollInCourse, isEnrolling } = useEnrollCourse();
  
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
  
  // Ensure we get a valid changeLesson function
  const currentLessonData = useCurrentLesson();
  const currentLesson = currentLessonData?.currentLesson;
  const changeLesson = currentLessonData?.changeLesson;

  // Update the state to use our new hooks
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  
  // Combined enrollment status from Redux and local state
  const effectivelyEnrolled = isEnrolled || isLocalEnrolled;
  
  const handleEnrollment = async () => {
    if (!currentUser || !course) return;
    const result = await enrollInCourse(course.id, currentUser.id);
    
    // If enrollment was successful, update local state immediately
    if (result.success) {
      setIsLocalEnrolled(true);
      toast.success('Đăng ký khóa học thành công!');
    }
  };

  // Fetch lessons for a chapter
  const fetchLessonsForChapter = (chapterId: string) => {
    // Skip if chapter is already loaded
    if (loadedLessons[chapterId]) return;
    
    // Set loading state and active chapter
    setLoadingStates(prev => ({ ...prev, [chapterId]: true }));
    setActiveChapterId(chapterId);
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId); 
      } else {
        newSet.add(chapterId);
        // Only fetch if not already loaded
        if (!loadedLessons[chapterId]) {
          fetchLessonsForChapter(chapterId);
        }
      }
      return newSet;
    });
  };

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
          if (lesson && typeof changeLesson === 'function') {
            changeLesson(lesson);
            break;
          }
        }
      }
    } else if (chapters[0]?.id) {
      // Default to first lesson if no activityId
      const firstChapterId = chapters[0].id;
      if (!loadedLessons[firstChapterId]) {
        fetchLessonsForChapter(firstChapterId);
      }
      setExpandedChapters(prev => new Set([...prev, firstChapterId]));
    }
  }, [searchParams.activityId, chapters, chaptersLoading, loadedLessons, changeLesson]);

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
      
      setLoadedLessons(prev => ({
        ...prev,
        [activeChapterId]: sortedLessons
      }));

      // Pre-load the lesson content if it's the current chapter
      if (searchParams.activityId && currentLesson?.chapterId === activeChapterId) {
        const lesson = sortedLessons.find(l => l.id === searchParams.activityId);
        if (lesson && typeof changeLesson === 'function') {
          changeLesson(lesson);
        }
      }

      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [activeChapterId]: false }));
      setActiveChapterId(null);
    }
  }, [lessonsResponse, activeChapterId, searchParams.activityId, currentLesson?.chapterId, changeLesson]);

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
                        {/* Only render lessons when chapter is expanded */}
                      {expandedChapters.has(chapter.id) && (
                        <div className="ml-8 space-y-2 mt-3">
                          {loadingStates[chapter.id] ? (
                            <div className="py-2 text-gray-500">Đang tải...</div>
                          ) : (
                            (loadedLessons[chapter.id] || []).map((lesson: Lesson, lessonIndex: number) => (
                              <div 
                                key={lesson.id}
                                className={`text-gray-600 py-1 px-2 rounded-md transition-colors
                                  ${currentLesson?.id === lesson.id ? 'bg-blue-50 text-blue-600' : 'hover:text-blue-600'}`}
                                role="button" 
                                onClick={() => {
                                  if (typeof changeLesson === 'function') {
                                    changeLesson(lesson);
                                  }
                                  router.push(`/learning/${params.id}?activityId=${lesson.id}`);
                                }}
                              >
                                {index + 1}.{lessonIndex + 1} {lesson.title}
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
                  </button>
                ) : (
                  <Link
                    href={`/learning/${params.id}${course.chapters && course.chapters[0]?.lessons?.[0] 
                      ? `?activityId=${course.chapters[0].lessons[0].id}` 
                      : ''}`}
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
                    onClick={() => {
                      const prevLesson = getPreviousLesson(course, currentLesson.id);
                      if (prevLesson && typeof changeLesson === 'function') {
                        router.push(`/learning/${params.id}?activityId=${prevLesson.id}`);
                        changeLesson(prevLesson);
                      }
                    }}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getPreviousLesson(course, currentLesson.id)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {/* Display lesson number */}
                  {course.chapters?.map((chapter) => 
                    chapter.lessons?.map((lesson) => {
                      const indices = findLessonIndices(course, lesson.id);
                      if (indices) {
                        const isActive = lesson.id === currentLesson.id;
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
                                : 'text-white hover:bg-blue-800'
                              }`}
                          >
                            {indices.lessonIndex + 1}
                          </Link>
                        );
                      }
                      return null;
                    })
                  )}
                  <button
                    onClick={() => {
                      const nextLesson = getNextLesson(course, currentLesson.id);
                      if (nextLesson && typeof changeLesson === 'function') {
                        router.push(`/learning/${params.id}?activityId=${nextLesson.id}`);
                        changeLesson(nextLesson);
                      }
                    }}
                    className="p-2 rounded-md bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                    disabled={!getNextLesson(course, currentLesson.id)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {currentLesson.type === 3 ? (
                // Code editor split view layout
                <div className="grid grid-cols-2 h-[calc(100vh-76px)]">
                  {/* Left side - Content/Description */}
                  <div className="border-r bg-white overflow-y-auto">
                    <div className="p-6">
                      {currentLesson.content ? (
                        <div className="prose max-w-none">
                          <MarkdownCode content={currentLesson.content} />
                        </div>
                      ) : (
                        <div className="prose max-w-none">
                          <h3>Bài tập: {currentLesson.title}</h3>
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
                        initialCode={currentLesson.initialCode || '// Write your code here\n// Viết code của bạn ở đây'}
                        language={currentLesson.language || 'javascript'}
                        lessonId={currentLesson.id}                        useReduxStore={true}
                      />
                    </div>
                    <div className="h-[300px] border-t border-gray-700 text-white overflow-y-auto">
                      <div className="p-4">
                        {/* Code testing area */}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Non-code editor layout with sidebar
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-64 min-h-[calc(100vh-76px)] bg-white border-r">
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">NỘI DUNG KHÓA HỌC</h3>
                      {chaptersLoading ? (
                        <div className="py-4 text-center">
                          <p className="text-gray-500">Đang tải nội dung...</p>
                        </div>
                      ) : chapters.map((chapter, chapterIndex) => (
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
                          {expandedChapters.has(chapter.id) && chapter.lessons && (
                            <div className="ml-6 space-y-2">
                              {chapter.lessons.map((lesson, lessonIndex) => (
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
                                  className={`block text-sm py-1 px-2 rounded-md ${
                                    currentLesson?.id === lesson.id
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-600 hover:text-blue-600'
                                  }`}
                                >
                                  {chapterIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="prose max-w-none">                    
                        {currentLesson.type === 4 && currentLesson.content && (
                          <MarkdownCode content={currentLesson.content} />
                        )}
                        {currentLesson.type === 2 && currentLesson.videoUrl && (
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
                        )}
                        {currentLesson.type === 1 && currentLesson.quizData && (
                          <Quiz data={currentLesson.quizData} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
