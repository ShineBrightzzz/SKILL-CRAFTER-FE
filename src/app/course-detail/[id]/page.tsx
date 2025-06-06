'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/store/hooks';
import { useGetCourseByIdQuery, useEnrollCourseMutation, useGetEnrollmentsByUserIdQuery, useUpdateCourseStatusMutation } from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { useGetLessonProgressByUserIdQuery, useGetLessonByIdQuery, useUpdateLessonStatusMutation } from '@/services/lesson.service';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { skipToken } from '@reduxjs/toolkit/query/react';
import VideoPlayer from '@/components/VideoPlayer';
import MarkdownCode from '@/components/MarkdownCode';
import CodeEditor from '@/components/CodeEditor';
import { Button, Tag, Modal, Input } from 'antd';
import Quiz from '@/components/Quiz';
import { CourseStatusDisplay } from '@/components/instructor/CourseStatusDisplay';
import { LessonStatusDisplay } from '@/components/instructor/LessonStatusDisplay';
import { validateAndProcessQuizData } from '@/utils/quiz';


interface PageProps {
  params: {
    id: string;
  };
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

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [updateLessonStatus, { isLoading: isUpdatingStatus }] = useUpdateLessonStatusMutation();
  const [updateCourseStatus] = useUpdateCourseStatusMutation();
  const [modal, contextHolder] = Modal.useModal();
    // Handle course approval with confirmation
  const showConfirmModal = (status: number) => {
    let message = '';
    const type = status === 2 ? "phê duyệt" : "từ chối";
    
    Modal.confirm({
      title: `Xác nhận ${type} khóa học`,
      content: (
        <div>
          <p>{`Bạn có chắc chắn muốn ${type} khóa học này không?`}</p>
          <Input.TextArea
            placeholder="Nhập ghi chú (không bắt buộc)"
            onChange={(e) => message = e.target.value}
            style={{ marginTop: '10px' }}
          />
        </div>
      ),
      okText: 'Có',
      cancelText: 'Không',
      onOk: () => handleCourseApproval(status, message),
    });
  };
  // Handle course approval
  const handleCourseApproval = async (status: number, message?: string) => {
    if (!course) return;
    
    try {
      await updateCourseStatus({ 
        courseId: params.id,
        status: status,
        message: message
      }).unwrap();
      
      toast.success(status === 2 ? 'Khóa học đã được phê duyệt' : 'Khóa học đã bị từ chối');
    } catch (error) {
      console.error('Course approval error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái khóa học');
    }
  };
  
  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;
  
  // Fetch selected lesson details
  const { data: lessonData, isLoading: lessonLoading } = useGetLessonByIdQuery(
    selectedLessonId || skipToken
  );
  
  
  // Check enrollment
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetEnrollmentsByUserIdQuery(
    currentUser?.id ? { userId: currentUser.id } : skipToken
  );

  // Check if user is enrolled in this course
  const isEnrolled = useMemo(() => {
    if (!enrollmentsData?.data?.result || !params.id) return false;
    return enrollmentsData.data.result.some((enrollment: any) => enrollment.courseId === params.id);
  }, [enrollmentsData, params.id]);

  // Combined enrollment status
  const effectivelyEnrolled = isEnrolled || (isLocalEnrolled && !enrollmentsLoading);

  // Fetch chapters
  const { data: chaptersResponse, isLoading: chaptersLoading } = useGetChaptersByCourseIdQuery({
    courseId: params.id
  });
  
  // Keep track of chapters and their lessons
  const chapters = useMemo(() => {
    const result = chaptersResponse?.data?.result || [];
    // Sort chapters by order if available
    return result;
  }, [chaptersResponse]);
  
  // Keep track of lessons for each chapter
  const [chaptersWithLessons, setChaptersWithLessons] = useState<any[]>([]);
  
  // Fetch user's lesson progress
  const { data: progressData } = useGetLessonProgressByUserIdQuery(
    currentUser?.id ? currentUser.id : skipToken
  );
  
  // Fetch lessons for expanded chapters
  useEffect(() => {
    const fetchLessonsForExpandedChapters = async () => {
      const updatedChapters = [...chapters];
      
      // For each expanded chapter, fetch its lessons if not already loaded
      for (const chapter of updatedChapters) {
        if (expandedChapters.has(chapter.id) && !chapter.lessons) {
          try {
            // Fetch lessons for this chapter
            const response = await fetch(`/api/chapters/${chapter.id}/lessons`);
            const data = await response.json();
            
            if (data.data && data.data.result) {
              // Enhance lessons with completion status if user is logged in
              let lessons = data.data.result;
              
              if (progressData?.data?.result) {
                const progressMap = new Map(
                  progressData.data.result.map((progress: any) => [progress.lessonId, progress])
                );
                
                lessons = lessons.map((lesson: any) => ({
                  ...lesson,
                  isCompleted: progressMap.has(lesson.id) && progressMap.get(lesson.id).completed
                }));
              }
              
              // Add lessons to the chapter
              chapter.lessons = lessons;
            }
          } catch (error) {
            console.error(`Error fetching lessons for chapter ${chapter.id}:`, error);
          }
        }
      }
      
      setChaptersWithLessons(updatedChapters);
    };
    
    if (chapters.length > 0 && expandedChapters.size > 0) {
      fetchLessonsForExpandedChapters();
    } else {
      setChaptersWithLessons(chapters);
    }
  }, [chapters, expandedChapters, progressData]);

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
      
      // If enrollment was successful (result contains the enrollment data)
      if (result.id) {
        setIsLocalEnrolled(true);
        toast.success('Đăng ký khóa học thành công!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };

  // Handle chapter expansion/collapse
  const handleChapterClick = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };
  // Handle starting course
  const handleStartCourse = () => {
    // If enrolled, navigate to learning page
    router.push(`/learning/${params.id}`);
  };

  // Helper function to get lesson type description
  const getLessonTypeText = (type: number) => {
    switch (type) {
      case 1:
        return 'Quiz';
      case 2:
        return 'Video';
      case 3:
        return 'Bài tập lập trình';
      case 4:
        return 'Bài đọc';
      default:
        return `Không xác định (${type})`;
    }
  };
  
  // Helper function to get lesson status description
  const getLessonStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Bản nháp';
      case 1:
        return 'Chờ phê duyệt';
      case 2:
        return 'Đã phê duyệt';
      case 3:
        return 'Đã từ chối';
      default:
        return `Không xác định (${status})`;
    }
  };
  
  // Helper function to get lesson status color class
  const getLessonStatusColorClass = (status: number) => {
    switch (status) {
      case 0:
        return 'text-gray-500 bg-gray-100';
      case 1:
        return 'text-yellow-700 bg-yellow-100';
      case 2:
        return 'text-green-700 bg-green-100';
      case 3:
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };
  // Handle lesson selection
  const handleLessonClick = (lessonId: string) => {
    
    // Fetch lesson data directly for debugging
    fetch(`/api/lessons/${lessonId}`)
      .then(response => response.json())
      .then(data => {
        
        // Now set the selected lesson ID to trigger the official data fetch
        setSelectedLessonId(lessonId);
      })
      .catch(error => {
        console.error("Error fetching lesson directly:", error);
        setSelectedLessonId(lessonId);
      });
  };
  // Handle lesson status update
  const handleLessonStatusUpdate = (status: number, message?: string) => async () => {
    if (!selectedLessonId) return;
    
    try {
      await updateLessonStatus({
        id: selectedLessonId,
        status: status,
        message: message
      }).unwrap();
      
      toast.success(status === 2 ? 'Bài học đã được phê duyệt' : 'Bài học đã bị từ chối');
      
      // Reload lesson data
      setSelectedLessonId(null);
      setTimeout(() => setSelectedLessonId(selectedLessonId), 100);
    } catch (error) {
      console.error("Error updating lesson status:", error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái bài học');
    }
  };

  // Handle showing lesson status modal
  const showLessonStatusModal = (status: number) => {
    let message = '';
    const type = status === 2 ? "phê duyệt" : "từ chối";
    
    Modal.confirm({
      title: `Xác nhận ${type} bài học`,
      content: (
        <div>
          <p>{`Bạn có chắc chắn muốn ${type} bài học này không?`}</p>
          <Input.TextArea
            placeholder="Nhập ghi chú (không bắt buộc)"
            onChange={(e) => message = e.target.value}
            style={{ marginTop: '10px' }}
          />
        </div>
      ),
      okText: 'Có',
      cancelText: 'Không',
      onOk: handleLessonStatusUpdate(status, message),
    });
  };
  const showLessonConfirmModal = (lessonId: string, status: number) => {
    let message = '';
    const type = status === 2 ? "phê duyệt" : "từ chối";
    
    Modal.confirm({
      title: `Xác nhận ${type} bài học`,
      content: (
        <div>
          <p>{`Bạn có chắc chắn muốn ${type} bài học này không?`}</p>
          <Input.TextArea
            placeholder="Nhập ghi chú (không bắt buộc)"
            onChange={(e) => message = e.target.value}
            style={{ marginTop: '10px' }}
          />
        </div>
      ),
      okText: 'Có',
      cancelText: 'Không',
      onOk: () => handleLessonApproval(lessonId, status, message),
    });
  };

  const handleLessonApproval = async (lessonId: string, status: number, message?: string) => {
    try {
      await updateLessonStatus({ 
        id: lessonId,
        status: status,
        message: message
      }).unwrap();
      
      toast.success(status === 2 ? 'Bài học đã được phê duyệt' : 'Bài học đã bị từ chối');
    } catch (error) {
      console.error('Lesson approval error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái bài học');
    }
  };

  // A utility function to normalize lesson data regardless of its structure
  const normalizeLessonData = (rawData: any) => {
    if (!rawData) return null;
    
    // Extract the lesson object, handling both direct data and nested structures
    let lesson = rawData;
    if ('data' in rawData) {
      lesson = rawData.data;
    }
    
    // Ensure we have a valid lesson object
    if (!lesson || typeof lesson !== 'object') {
      console.error("Invalid lesson data structure:", rawData);
      return null;
    }
    
    // Convert type to a number if it's a string
    const type = typeof lesson.type === 'string' ? parseInt(lesson.type, 10) : Number(lesson.type);
    
    // Create a normalized lesson object with all possible properties
    const normalizedLesson: any = {
      id: lesson.id,
      title: lesson.title || 'Untitled Lesson',
      type: isNaN(type) ? 0 : type, // Default to 0 if parsing fails
      content: lesson.content || null,
      videoUrl: lesson.videoUrl || null,
      duration: lesson.duration || null,
      order: lesson.order || 0,
      initialCode: lesson.initialCode || null,
      language: lesson.language || 'javascript',
      quizData: null,
      chapterId: lesson.chapterId || null,
      isCompleted: !!lesson.isCompleted,
      status: typeof lesson.status === 'string' ? parseInt(lesson.status, 10) : Number(lesson.status || 0),
      // Add any other properties that might be needed
    };
    
    // Process quizData based on its format
    if (lesson.quizData) {
      try {
        normalizedLesson.quizData = typeof lesson.quizData === 'string' 
          ? JSON.parse(lesson.quizData) 
          : lesson.quizData;
      } catch (e) {
        console.error("Error parsing quizData:", e);
        normalizedLesson.quizData = { questions: [] };
      }
    }
    
    // Add default content for specific lesson types
    if (normalizedLesson.type === 1 && !normalizedLesson.content) {
      normalizedLesson.content = '_Nội dung bài học chưa được cung cấp_';
    }
    
    if (normalizedLesson.type === 3 && !normalizedLesson.initialCode) {
      normalizedLesson.initialCode = '// Mã code mẫu chưa được cung cấp\n// Bạn có thể bắt đầu viết code ở đây';
    }
    
    return normalizedLesson;
  };

  // Render lesson content based on type
  const renderLessonContent = () => {
    if (lessonLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      );
    }

    if (!lessonData) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500">Chọn một bài học từ sidebar để xem nội dung</p>
        </div>
      );
    }
    
    // Process the lesson data to ensure it has all required properties
    const normalizedLesson = normalizeLessonData(lessonData);
    
    if (!normalizedLesson) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">Không thể xử lý dữ liệu bài học. Vui lòng thử lại.</p>
        </div>
      );
    }
    
    const lessonType = normalizedLesson.type;
    
    switch (lessonType) {
      case 1: // Quiz (type 1)
        const validatedQuizData = validateAndProcessQuizData(normalizedLesson.quizData);
        if (!validatedQuizData.isValid || !validatedQuizData.data) {
          return (
            <div>
              <h2 className="text-xl font-bold mb-4">{normalizedLesson.title}</h2>
              <p className="text-red-500">Dữ liệu quiz không hợp lệ</p>
            </div>
          );
        }
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{normalizedLesson.title}</h2>
            <Quiz
              quizData={validatedQuizData.data}
              onComplete={() => {}}
            />
          </div>
        );
      case 2: // Video
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{normalizedLesson.title}</h2>
            {normalizedLesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <VideoPlayer src={normalizedLesson.videoUrl} />
              </div>
            ) : (
              <p className="text-red-500">Video không khả dụng</p>
            )}
          </div>
        );
      case 3: // Programming exercise
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{normalizedLesson.title}</h2>
            <CodeEditor
              initialCode={normalizedLesson.initialCode || '// Mã code mẫu chưa được cung cấp'}
              programmingLanguage={normalizedLesson.language || 'javascript'}
              useReduxStore={false}
            />
          </div>
        );
      case 4: // Reading content (type 4)
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{normalizedLesson.title}</h2>
            <div className="prose max-w-none">
              <MarkdownCode content={normalizedLesson.content || ''} />
            </div>
          </div>
        );
      default:
        return (
          <div>
            <p className="text-red-500 mb-4">Loại bài học không được hỗ trợ (Type: {normalizedLesson.type})</p>
            <pre className="text-xs bg-gray-800 text-white p-3 rounded-md overflow-auto">
              {JSON.stringify(normalizedLesson, null, 2)}
            </pre>
          </div>
        );
    }  };

  // Loading state
  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Không tìm thấy khóa học</h1>
          <p className="mt-2 text-gray-600">Khóa học không tồn tại hoặc đã bị xóa</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-100">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course status and admin actions */}        <div className="flex justify-end items-center gap-4 mb-4">
          {contextHolder}          <div className="flex items-center gap-2">              <CourseStatusDisplay status={Number(course.status)} />
          </div>
          {course.status === 1 && (
            <div className="flex gap-2">
              <Button
                type="primary"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => showConfirmModal(2)}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                onClick={() => showConfirmModal(3)}
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {/* Sidebar with course content */}
            <div className="md:col-span-1 border-r border-gray-200">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Nội dung khóa học</h2>
                <p className="text-sm text-gray-500 mt-1">{chapters.length} chương • {course.duration} giờ học</p>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                {chaptersLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                  </div>
                ) : chaptersWithLessons.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {chaptersWithLessons.map((chapter) => (
                      <div key={chapter.id} className="cursor-pointer">
                        <div 
                          onClick={() => handleChapterClick(chapter.id)}
                          className={`p-4 hover:bg-gray-50 transition-colors ${expandedChapters.has(chapter.id) ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {expandedChapters.has(chapter.id) ? (
                                <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                              )}
                              <span className="font-medium text-gray-900">{chapter.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{chapter.estimatedTime || 0} phút</span>
                          </div>
                        </div>
                        
                        {/* Lesson list when chapter is expanded */}
                        {expandedChapters.has(chapter.id) && (
                          <div className="bg-gray-50 pl-10 pr-4">
                            {chapter.lessons && chapter.lessons.length > 0 ? (
                              <ul className="py-2 space-y-1">
                                {chapter.lessons.map((lesson: any) => (
                                  <li 
                                    key={lesson.id} 
                                    className={`py-2 px-3 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer
                                      ${selectedLessonId === lesson.id ? 'bg-blue-100' : ''}`}
                                    onClick={() => handleLessonClick(lesson.id)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0
                                        ${lesson.isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        {lesson.isCompleted ? (
                                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                                        )}
                                      </div>
                                      <span className="text-sm">{lesson.title}</span>
                                    </div>                                    
                                    <div className="text-xs text-gray-500">
                                      {getLessonTypeText(parseInt(String(lesson.type)))}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="py-2 px-4 text-center text-sm text-gray-500">
                                Chưa có bài học
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Chưa có nội dung cho khóa học này
                  </div>
                )}
              </div>
            </div>
            
            {/* Main content area */}
            <div className="md:col-span-2 lg:col-span-3 p-6">
              {selectedLessonId ? (
                /* Lesson content display */                <div className="p-4 bg-white rounded-lg shadow">                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chi tiết bài học</h3>                      {lessonData && normalizeLessonData(lessonData)?.status !== 2 && normalizeLessonData(lessonData)?.status !== 3 && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => showLessonStatusModal(2)}
                          disabled={isUpdatingStatus}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 disabled:opacity-50"
                        >
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => showLessonStatusModal(3)}
                          disabled={isUpdatingStatus}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                  {lessonData && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {getLessonTypeText(normalizeLessonData(lessonData)?.type)}
                        </span>                        <div className="flex items-center gap-2">                          <LessonStatusDisplay 
                            status={normalizeLessonData(lessonData)?.status} 
                            message={normalizeLessonData(lessonData)?.message} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {renderLessonContent()
}
                </div>
              ) : (
                /* Course overview when no lesson is selected */
                <div className="space-y-6">
                  {/* Course overview section */}
                  <div>                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                        <p className="mt-2 text-gray-600">{course.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-700">Cấp độ</p>
                        <p className="text-gray-600">{getLevelText(course.level)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-700">Thời lượng</p>
                        <p className="text-gray-600">{course.duration} giờ</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course enrollment card */}
                  <div className="bg-blue-50 rounded-lg p-6 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {course.price === 0 ? 'Khóa học miễn phí' : `Giá: ${course.price.toLocaleString('vi-VN')} đ`}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {effectivelyEnrolled 
                            ? 'Bạn đã đăng ký khóa học này' 
                            : 'Đăng ký để học ngay hôm nay'}
                        </p>
                      </div>
                      
                      <div className="mt-4 md:mt-0">
                        {effectivelyEnrolled ? (
                          <button
                            onClick={handleStartCourse}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Vào học ngay
                          </button>
                        ) : (
                          <button
                            onClick={handleEnrollment}
                            disabled={isEnrolling || !currentUser}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {isEnrolling ? 'Đang xử lý...' : 'Đăng ký khóa học'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* What you'll learn section */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Bạn sẽ học được gì</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Kiến thức cơ bản và nâng cao về chủ đề của khóa học</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Kỹ năng thực hành thông qua các bài tập và quiz</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Áp dụng kiến thức vào các dự án thực tế</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Giấy chứng nhận hoàn thành khóa học</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
