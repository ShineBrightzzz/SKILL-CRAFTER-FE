'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/store/hooks';
import { useGetCourseByIdQuery, useEnrollCourseMutation, useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { skipToken } from '@reduxjs/toolkit/query/react';

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

  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;

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

  const chapters = useMemo(() => {
    const result = chaptersResponse?.data?.result || [];
    // Sort chapters by order if available
    return result;
  }, [chaptersResponse]);

  // Course enrollment mutation
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  // Function to handle enrollment
  const handleEnrollment = async () => {
    if (!currentUser || !course) return;
    
    try {      const result = await enrollCourse({ 
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Không tìm thấy khóa học</h1>
          <p className="mt-2 text-gray-600">Khóa học không tồn tại hoặc đã bị xóa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero section with course banner */}
      <div className="relative h-[300px]">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getLevelText(course.level)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {course.duration} giờ học
                </span>
                {course.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-3">Mô tả khóa học</h3>
                <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Chapters and lessons */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Nội dung khóa học</h3>
              
              {chaptersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải nội dung...</p>
                </div>
              ) : chapters.length > 0 ? (
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleChapterClick(chapter.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                          )}                          <div className="flex flex-col text-left">
                            <span className="font-medium text-gray-900">{chapter.name}</span>
                            <span className="text-sm text-gray-500">
                              {chapter.estimatedTime} phút
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có nội dung</p>
              )}
            </div>
          </div>

          {/* Enrollment card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} đ`}
                </div>

                {effectivelyEnrolled ? (
                  <button
                    onClick={handleStartCourse}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Vào học ngay
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={isEnrolling || !currentUser}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEnrolling ? 'Đang xử lý...' : 'Đăng ký khóa học'}
                  </button>
                )}

                {!currentUser && (
                  <p className="mt-2 text-sm text-gray-500">
                    Vui lòng đăng nhập để đăng ký khóa học
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Khóa học bao gồm:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    {chapters.length} chương học
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    {course.duration} giờ học
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    Truy cập không giới hạn
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    Giấy chứng nhận hoàn thành
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
