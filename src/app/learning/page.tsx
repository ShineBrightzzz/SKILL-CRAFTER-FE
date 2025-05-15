

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useGetAllCoursesQuery } from '@/services/course.service';

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

const categories = ['Tất cả', 'Frontend', 'Backend', 'Mobile', 'DevOps'];
const levels = ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export default function LearningPage() {
  // Fetch courses data from API
  const { data: coursesResponse, isLoading, error } = useGetAllCoursesQuery({});
  const courses = coursesResponse?.data || [];
  console.log('Courses:', courses);
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Khóa học</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-600">Đang tải khóa học...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-red-600">Có lỗi xảy ra khi tải khóa học</p>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (            
              <Link href={`/learning/${course.id}`} key={course.id}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">                <div className="relative h-48">
                  <Image
                    src={'/logo.png'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {course.categoryName || 'Chưa phân loại'}
                    </span>
                    <span className="text-sm text-gray-500">{getLevelText(course.level)}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags && Array.isArray(course.tags) && course.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{course.duration ? `${course.duration} giờ` : 'Không xác định'}</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}