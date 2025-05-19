'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGetCourseByIdQuery } from '@/services/course.service';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';
import MarkdownCode from '@/components/MarkdownCode';
import CodeEditor from '@/components/CodeEditor';

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

export default function CourseDetailPage({ params, searchParams }: { 
  params: { id: string }, 
  searchParams: { activityId?: string } 
}) {
  const [registered, setRegistered] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // Fetch course data using the API
  const { data: courseResponse, isLoading, error } = useGetCourseByIdQuery(params.id);
  const course = courseResponse?.data;

  // Handle activityId changes
  useEffect(() => {
    if (course?.chapters && searchParams.activityId) {
      // Find the lesson with matching activityId
      for (const chapter of course.chapters) {
        if (chapter.lessons) {
          const lesson = chapter.lessons.find((l: Lesson) => l.id === searchParams.activityId);
          if (lesson) {
            setCurrentLesson(lesson);
            setExpandedChapters(prev => new Set([...prev, chapter.id]));
            break;
          }
        }
      }
    } else if (course?.chapters && course.chapters[0]?.lessons?.[0]) {
      // Default to first lesson if no activityId
      setCurrentLesson(course.chapters[0].lessons[0]);
      setExpandedChapters(new Set([course.chapters[0].id]));
    }
  }, [searchParams.activityId, course]);

  const toggleChapter = (chapterId: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-gray-600">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
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
                  {course.chapters?.map((chapter: Chapter, index: number) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-medium">Chương {index + 1}:</span>
                        <span className="text-lg">{chapter.name}</span>
                      </div>
                      {chapter.lessons && (
                        <div className="ml-6 space-y-2">
                          {chapter.lessons.map((lesson: Lesson, lessonIndex: number) => (
                            <div key={lesson.id} className="text-gray-600">
                              {index + 1}.{lessonIndex + 1} {lesson.title}
                            </div>
                          ))}
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
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                    <span className="text-gray-600">{course.chapters?.length || 0} chương học</span>
                  </div>
                </div>
                
                {!registered ? (
                  <button
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
                    onClick={() => setRegistered(true)}
                  >
                    Đăng ký khóa học
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
              <h2 className="text-2xl font-bold p-6 border-b bg-white">{currentLesson.title}</h2>
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
                        lessonId={currentLesson.id}
                      />
                    </div>
                    <div className="h-[300px] border-t border-gray-700 text-white overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-sm font-medium mb-2">KIỂM THỬ</h3>
                        <div className="text-sm text-gray-400">
                          Vui lòng chạy thử code của bạn trước!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
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