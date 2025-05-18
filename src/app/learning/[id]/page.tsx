'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGetCourseByIdQuery } from '@/services/course.service';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';

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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {!searchParams.activityId && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="relative h-64 md:h-96">
              <Image
                src={'/logo.png'}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-blue-600">
                  {course.categoryName || 'Chưa phân loại'}
                </span>
                <span className="text-sm text-gray-500">{getLevelText(course.level)}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              {/* Nút đăng ký và vào học */}
              {!registered ? (
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition mb-4"
                  onClick={() => setRegistered(true)}
                >
                  Đăng ký khóa học
                </button>
              ) : (
                <Link
                  href={`/learning/${params.id}${course.chapters && course.chapters[0]?.lessons?.[0] 
                    ? `?activityId=${course.chapters[0].lessons[0].id}` 
                    : ''}`}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition mb-4 inline-block"
                >
                  Vào học ngay
                </Link>
              )}
              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.duration ? `${course.duration} giờ` : 'Không xác định'}
                  </div>
                  <div className="text-sm text-gray-500">Thời lượng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.chapters ? course.chapters.length : 0}
                  </div>
                  <div className="text-sm text-gray-500">Chương</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(course.price || 0)}
                  </div>
                  <div className="text-sm text-gray-500">VNĐ</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar with Chapters and Lessons */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
              <div className="space-y-2">
                {course.chapters?.map((chapter: Chapter, index: number) => (
                  <div key={chapter.id} className="border-b pb-2 last:border-b-0">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Chương {index + 1}:</span>
                        <span className="text-sm">{chapter.name}</span>
                      </div>
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedChapters.has(chapter.id) && chapter.lessons && (
                      <div className="ml-4 space-y-1 mt-1">
                        {chapter.lessons.map((lesson: Lesson, lessonIndex: number) => (
                          <Link
                            key={lesson.id}
                            href={`/learning/${params.id}?activityId=${lesson.id}`}
                            className={`block p-2 text-sm rounded ${
                              currentLesson?.id === lesson.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}.{lessonIndex + 1} {lesson.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content Area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {currentLesson ? (
                <>
                  <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>
                  <div className="prose max-w-none">                    {currentLesson.type === 4 && currentLesson.content && (
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    )}
                    {currentLesson.type === 2 && currentLesson.videoUrl && (
                      <>
                        {/* Video chính */}
                        <VideoPlayer 
                          src={currentLesson.videoUrl}
                          className="w-full relative z-10"
                        />
                        {/* Video nền */}
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
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chọn một bài học để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}