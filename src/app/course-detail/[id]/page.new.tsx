'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/store/hooks';
import { useGetCourseByIdQuery, useEnrollCourseMutation, useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { useGetLessonProgressByUserIdQuery, useGetLessonByIdQuery, useUpdateLessonStatusMutation } from '@/services/lesson.service';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { skipToken } from '@reduxjs/toolkit/query/react';
import VideoPlayer from '@/components/VideoPlayer';
import MarkdownCode from '@/components/MarkdownCode';
import Quiz from '@/components/Quiz';
import CodeEditor from '@/components/CodeEditor';

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

const CourseDetailPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isLocalEnrolled, setIsLocalEnrolled] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [updateLessonStatus, { isLoading: isUpdatingStatus }] = useUpdateLessonStatusMutation();

  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;
  
  // Fetch selected lesson details
  const { data: lessonData, isLoading: lessonLoading } = useGetLessonByIdQuery(
    selectedLessonId || skipToken
  );

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

  // Helper function to normalize lesson data
  const normalizeLessonData = (rawData: any) => {
    if (!rawData) return null;
    
    let lesson = rawData;
    if ('data' in rawData) {
      lesson = rawData.data;
    }
    
    if (!lesson || typeof lesson !== 'object') {
      console.error("Invalid lesson data structure:", rawData);
      return null;
    }
    
    const type = typeof lesson.type === 'string' ? parseInt(lesson.type, 10) : Number(lesson.type);
    
    return {
      id: lesson.id,
      title: lesson.title || 'Untitled Lesson',
      type: isNaN(type) ? 0 : type,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || null,
      duration: lesson.duration || null,
      initialCode: lesson.initialCode || null,
      language: lesson.language || 'javascript',
      quizData: lesson.quizData ? (typeof lesson.quizData === 'string' ? JSON.parse(lesson.quizData) : lesson.quizData) : null,
      status: typeof lesson.status === 'string' ? parseInt(lesson.status, 10) : Number(lesson.status || 0)
    };
  };

  // Render lesson content based on type
  const renderLessonContent = () => {
    if (!lessonData) return null;
    
    const lesson = normalizeLessonData(lessonData);
    if (!lesson) return null;
    
    switch (lesson.type) {
      case 1: // Quiz
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{lesson.title}</h2>
            {lesson.quizData ? (
              <Quiz data={lesson.quizData} onComplete={() => {}} />
            ) : (
              <p className="text-red-500">Dữ liệu quiz không khả dụng</p>
            )}
          </div>
        );
      
      case 2: // Video
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{lesson.title}</h2>
            {lesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <VideoPlayer src={lesson.videoUrl} />
              </div>
            ) : (
              <p className="text-red-500">Video không khả dụng</p>
            )}
          </div>
        );
      
      case 3: // Programming exercise
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{lesson.title}</h2>
            <CodeEditor
              initialCode={lesson.initialCode || '// Mã code mẫu chưa được cung cấp'}
              language={lesson.language}
              useReduxStore={false}
            />
          </div>
        );
      
      case 4: // Reading content
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{lesson.title}</h2>
            <div className="prose max-w-none">
              <MarkdownCode content={lesson.content} />
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <p className="text-red-500">Loại bài học không được hỗ trợ ({lesson.type})</p>
          </div>
        );
    }
  };

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">Không tìm thấy khóa học</h1>
        <p className="text-gray-600">Khóa học không tồn tại hoặc đã bị xóa</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {selectedLessonId && lessonData ? (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết bài học</h3>
              {normalizeLessonData(lessonData)?.status !== 2 && normalizeLessonData(lessonData)?.status !== 3 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      updateLessonStatus({ id: selectedLessonId, status: 2 }).unwrap();
                    }}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 disabled:opacity-50"
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => {
                      updateLessonStatus({ id: selectedLessonId, status: 3 }).unwrap();
                    }}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
            {renderLessonContent()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p>Chọn một bài học để xem nội dung</p>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
