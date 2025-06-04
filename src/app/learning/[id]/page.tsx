'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Button, Spin, Rate } from 'antd';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useAuth } from '@/store/hooks';
import { 
  useGetCourseByIdQuery, 
  useEnrollCourseMutation, 
  useGetEnrollmentsByUserIdQuery 
} from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { useGetCategoryByIdQuery } from '@/services/category.service';
import { 
  useGetLessonsByChapterIdQuery, 
  useGetLessonProgressByUserIdQuery,
  useGetLessonProgressByLessonIdQuery,
  useCompleteLessonMutation
} from '@/services/lesson.service';
import { useGetCartByUserIdQuery, useAddToCartMutation } from '@/services/cart.service';
import { Chapter } from '@/types/chapter';
import VideoPlayer from '@/components/VideoPlayer';
import MarkdownCode from '@/components/MarkdownCode';
import CodeEditor from '@/components/CodeEditor';
import Quiz from '@/components/Quiz';
import CourseComments from '@/components/course/CourseComments';

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

interface EnrollmentResponse {
  data: {
    success: boolean;
    message?: string;
  };
}

interface CourseResponse {
  data: Course;
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
  rating?: number;
  totalRatings?: number;
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

export default function CourseLearningPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuth();
  
  // Course enrollment mutation
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  // Get cart items and cart mutation
  const { data: cartData } = useGetCartByUserIdQuery(currentUser?.id ?? skipToken);
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Check if course is already in cart
  const isInCart = useMemo(() => {
    if (!cartData?.data || !params.id) return false;
    return cartData.data.some((item) => item.courseId === params.id);
  }, [cartData, params.id]);
  // Get course data and check enrollment
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course: Course | undefined = courseData?.data;
  
  // Fetch category data if course has categoryId
  const { data: categoryData } = useGetCategoryByIdQuery(
    course?.categoryId ?? skipToken
  );
  
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
  
  // Get chapters using RTK Query
  const { data: chaptersResponse, isLoading: chaptersLoading } = useGetChaptersByCourseIdQuery({
    courseId: params.id
  });
  
  const chapters = useMemo(() => {
    const result = (chaptersResponse?.data?.result || []) as Chapter[];
    return result;
  }, [chaptersResponse]);

  // State management
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [loadedLessons, setLoadedLessons] = useState<{[key: string]: Lesson[]}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);

  // State management for page mode
  const [isLearningMode, setIsLearningMode] = useState(false);
  // Combined enrollment status
  const effectivelyEnrolled = isEnrolled || (isLocalEnrolled && !enrollmentsLoading);

  // Functions to manage lessons and chapters
  const changeLesson = useCallback((lesson: Lesson | null) => {
    if (!lesson?.id) {
      console.warn('Attempted to set an invalid lesson:', lesson);
      return;
    }
    
    if (currentLesson?.id === lesson.id) return;
    
    setCurrentLesson(lesson);
    
    // Ensure the chapter is expanded
    if (lesson.chapterId) {
      setExpandedChapters(prev => {
        const newSet = new Set(prev);
        newSet.add(lesson.chapterId);
        return newSet;
      });
    }
  }, [currentLesson]);

  // Functions to switch between overview and learning mode 
  const switchToOverview = useCallback(() => {
    setIsLearningMode(false);
  }, []);

  const switchToLearning = useCallback((selectedLesson?: Lesson) => {
    if (selectedLesson?.id) {
      changeLesson(selectedLesson);
      if (selectedLesson.chapterId) {
        setExpandedChapters(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedLesson.chapterId);
          return newSet;
        });
      }
    }
    setIsLearningMode(true);
  }, [changeLesson]);  // Get lessons for chapters
  const { data: lessonsData } = useGetLessonsByChapterIdQuery(
    activeChapterId ?? skipToken
  );

  useEffect(() => {
    if (!activeChapterId || !lessonsData?.data?.result) return;

    const lessons = lessonsData.data.result;
    const sortedLessons = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    
    // Enhance lessons with completion status based on progress data
    const enhancedLessons = sortedLessons.map(lesson => {
      // Find the progress for this lesson
      const progressItem = allLessonProgressData?.data?.result?.find(
        (progress: any) => progress.lessonId === lesson.id
      );
      
      return {
        ...lesson,
        isCompleted: progressItem?.status === "1", // Check if status is "1"
        progress: progressItem // Store the full progress data
      };
    });

    setLoadedLessons(prev => ({
      ...prev,
      [activeChapterId]: enhancedLessons
    }));

    setLoadingStates(prev => ({ ...prev, [activeChapterId]: false }));
  }, [lessonsData, activeChapterId, allLessonProgressData]);

  const fetchLessonsForChapter = useCallback((chapterId: string) => {
    if (loadedLessons[chapterId]) return;
    setLoadingStates(prev => ({ ...prev, [chapterId]: true }));
    setActiveChapterId(chapterId);
  }, [loadedLessons]);

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
        fetchLessonsForChapter(chapterId);
      }
      return newSet;
    });
  }, [fetchLessonsForChapter]);

  // Initialize first chapter if needed
  useEffect(() => {
    if (chaptersLoading || !chapters.length || !effectivelyEnrolled) return;
    
    // If no chapters are expanded, expand and load the first one
    if (expandedChapters.size === 0) {
      const firstChapterId = chapters[0].id;
      setExpandedChapters(new Set([firstChapterId]));
      fetchLessonsForChapter(firstChapterId);
    }
  }, [chaptersLoading, chapters, effectivelyEnrolled, expandedChapters.size, fetchLessonsForChapter]);  // Track lesson progress
  const { data: lessonProgressData } = useGetLessonProgressByLessonIdQuery(
    currentLesson?.id ? currentLesson.id : skipToken
  );

  // Update lesson completion status based on progress data
  useEffect(() => {
    if (!currentLesson || !lessonProgressData?.data?.result?.[0]) return;

    const progress = lessonProgressData.data.result[0];
    const isCompleted = progress.status === "1";
    if (isCompleted !== currentLesson.isCompleted) {
      // Update current lesson completion status
      setCurrentLesson(prev => prev ? { 
        ...prev, 
        isCompleted,
        progress // Store the full progress data
      } : prev);

      // Update lesson in loadedLessons
      if (currentLesson.chapterId) {
        setLoadedLessons(prev => {
          const chapterLessons = prev[currentLesson.chapterId] || [];
          const updatedLessons = chapterLessons.map(lesson => 
            lesson.id === currentLesson.id ? { 
              ...lesson, 
              isCompleted,
              progress // Store the full progress data
            } : lesson
          );
          
          return {
            ...prev,
            [currentLesson.chapterId]: updatedLessons 
          };
        });
      }
    }
  }, [lessonProgressData, currentLesson]);

  // Handle lesson completion 
  const [completingLesson, setCompletingLesson] = useState<boolean>(false);
  const [completeLesson] = useCompleteLessonMutation();

  const handleCompleteLesson = async () => {
    if (!currentUser?.id || !currentLesson?.id) {
      console.warn('Cannot complete lesson: missing user or lesson ID');
      return;
    }
    
    try {
      setCompletingLesson(true);
      await completeLesson({
        userId: currentUser.id,
        lessonId: currentLesson.id,
      }).unwrap();

      // Update completion status in state
      if (currentLesson.chapterId) {
        setLoadedLessons(prev => {
          const chapterLessons = prev[currentLesson.chapterId] || [];
          const updatedLessons = chapterLessons.map(lesson => 
            lesson.id === currentLesson.id ? { ...lesson, isCompleted: true } : lesson
          );
          
          return {
            ...prev,
            [currentLesson.chapterId]: updatedLessons
          };
        });
      }

      // Update current lesson completion status
      setCurrentLesson(prev => prev ? { ...prev, isCompleted: true } : prev);

      toast.success('Đã hoàn thành bài học!');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái bài học');
    } finally {
      setCompletingLesson(false);
    }
  };

  // Handle enrollment
  const handleEnrollment = async () => {
    if (!currentUser || !course) return;
    
    try {
      const response = await enrollCourse({ 
        courseId: params.id, 
        userId: currentUser.id 
      }).unwrap();
      
      if (response) {
        setIsLocalEnrolled(true);
        toast.success('Đăng ký khóa học thành công!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };

  // Handle adding course to cart
  const handleAddToCart = async () => {
    if (!currentUser || !course) return;
    
    try {
      await addToCart({
        userId: currentUser.id,
        courseId: params.id
      }).unwrap();
      
      toast.success('Đã thêm khóa học vào giỏ hàng');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <span className="ml-2">Đang tải khóa học...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy khóa học</h1>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  // Main content render
  return (
    <main className="min-h-screen bg-gray-50">
      {!isLearningMode ? (
        // Course overview page
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Course Title and Basic Info */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">                  <span>Cấp độ: {getLevelText(course.level)}</span>
                  <span>•</span>
                  <span>{categoryData?.name}</span>
                  {course.rating !== undefined && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Rate 
                          disabled 
                          defaultValue={course.rating} 
                          className="text-sm"
                          allowHalf
                        />
                        <span className="ml-1">({course.totalRatings || 0} đánh giá)</span>
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-700">{course.description}</p>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Nội dung khóa học</h2>
                {chaptersLoading ? (
                  <div className="text-center py-4">
                    <Spin />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <div key={chapter.id} className="border rounded-lg">
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">
                              Chương {index + 1}: {chapter.name}
                            </span>
                          </div>
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        {expandedChapters.has(chapter.id) && (
                          <div className="border-t p-4">
                            {loadingStates[chapter.id] ? (
                              <div className="text-center py-2">
                                <Spin size="small" />
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {(loadedLessons[chapter.id] || []).map((lesson) => (                                    <button 
                                    key={lesson.id}
                                    onClick={() => switchToLearning(lesson)}
                                    className={classNames(
                                      'w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100',
                                      currentLesson?.id === lesson.id && 'bg-blue-50'
                                    )}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {lesson.isCompleted ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                      ) : (
                                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                      )}
                                      <span>{lesson.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Comments */}
              {effectivelyEnrolled && currentUser && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <CourseComments 
                    courseId={params.id}
                    userId={currentUser.id}
                  />
                </div>
              )}
            </div>

            {/* Course Actions Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="text-center mb-6">
                  {effectivelyEnrolled ? (
                    <Button
                      type="primary"
                      onClick={() => switchToLearning()}
                      className="w-full mb-4 text-lg h-12 flex items-center justify-center"
                    >
                      Vào học ngay
                    </Button>
                  ) : (
                    <>
                      {!isInCart && (
                        <Button
                          type="primary"
                          onClick={handleAddToCart}
                          loading={isAddingToCart}
                          className="w-full mb-4 text-lg h-12 flex items-center justify-center"
                        >
                          Thêm vào giỏ hàng
                        </Button>
                      )}

                      {isInCart && (
                        <p className="text-blue-600 mb-4 text-lg">
                          Khóa học này đã có trong giỏ hàng
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Thông tin khóa học</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Cấp độ:</span>
                      <span className="font-medium">{getLevelText(course.level)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Số bài học:</span>
                      <span className="font-medium">{course.duration}</span>
                    </li>                    <li className="flex justify-between">
                      <span className="text-gray-600">Danh mục:</span>
                      <span className="font-medium">{categoryData?.name}</span>
                    </li>
                    {course.rating !== undefined && (
                      <li className="flex justify-between items-center">
                        <span className="text-gray-600">Đánh giá:</span>
                        <div className="flex items-center">
                          <Rate disabled defaultValue={course.rating} /> 
                          <span className="ml-2">({course.totalRatings})</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Learning page with lesson content
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">NỘI DUNG KHÓA HỌC</h3>
              {chaptersLoading ? (
                <div className="text-center py-4">
                  <Spin />
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <div key={chapter.id}>
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center w-full text-left mb-2"
                      >
                        {expandedChapters.has(chapter.id) ? (
                          <ChevronDownIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-sm font-medium">
                          Chương {index + 1}: {chapter.name}
                        </span>
                      </button>
                      
                      {expandedChapters.has(chapter.id) && (
                        <div className="ml-6">
                          {loadingStates[chapter.id] ? (
                            <div className="py-2 text-gray-500">
                              <Spin size="small" />
                            </div>
                          ) : (
                            <ul className="space-y-2">
                              {(loadedLessons[chapter.id] || []).map((lesson) => (                                <li key={lesson.id}>
                                  <button
                                    onClick={() => {
                                      changeLesson(lesson);
                                      switchToLearning();
                                    }}
                                    className={classNames(
                                      'flex items-center w-full text-left px-2 py-1 rounded text-sm',
                                      currentLesson?.id === lesson.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'hover:bg-gray-50'
                                    )}
                                  >
                                    {lesson.isCompleted ? (
                                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 border border-gray-300 rounded-full mr-2 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{lesson.title}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {currentLesson ? (
              <div>
                {/* Navigation header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={switchToOverview}
                      className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeftIcon className="h-5 w-5 mr-1" />
                      <span>Quay lại khóa học</span>
                    </button>
                  </div>
                  <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold truncate">
                      {currentLesson.title}
                    </h2>
                  </div>
                </div>

                {/* Lesson content */}
                <div className="p-6">
                  {currentLesson.type === 1 && currentLesson.quizData && (
                    <Quiz
                      quizData={currentLesson.quizData}
                      onComplete={handleCompleteLesson}
                    />
                  )}
                  
                  {currentLesson.type === 2 && currentLesson.videoUrl && (
                    <div className="aspect-w-16 aspect-h-9">
                      <VideoPlayer src={currentLesson.videoUrl} />
                    </div>
                  )}
                  
                  {currentLesson.type === 3 && (
                    <CodeEditor
                      initialCode={currentLesson.initialCode || '// Write your code here'}
                      language={currentLesson.language || 'javascript'}
                      onComplete={handleCompleteLesson}
                    />
                  )}
                  
                  {currentLesson.type === 4 && currentLesson.content && (
                    <MarkdownCode content={currentLesson.content} />
                  )}

                  {/* Complete lesson button for video and reading lessons */}
                  {(currentLesson.type === 2 || currentLesson.type === 4) && (
                    <div className="mt-6">
                      <Button
                        type="primary"
                        onClick={handleCompleteLesson}
                        loading={completingLesson}
                        disabled={currentLesson.isCompleted}
                      >
                        {currentLesson.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học xong'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-gray-500">
                  {isEnrolled ? 'Chọn một bài học từ danh sách bên trái để bắt đầu học' : 'Bạn cần đăng ký khóa học để có thể học'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}