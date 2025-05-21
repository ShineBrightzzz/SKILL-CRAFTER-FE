'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGetAllCoursesQuery } from '@/services/course.service';
import { FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Define Course type
interface Course {
  id: string | number;
  title: string;
  description?: string;
  categoryName?: string;
  level: number;
  tags?: string[];
  duration?: number;
  price?: number;
}

// Define Pagination Metadata type
interface PaginationMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
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

const categories = ['Tất cả', 'Frontend', 'Backend', 'Mobile', 'DevOps'];
const levels = ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const PAGE_SIZE = 9; // Number of courses to display per page

export default function LearningPage() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch courses data from API
  const { data: coursesResponse, isLoading, error } = useGetAllCoursesQuery({
    // Add pagination parameters if needed in your API
    page: currentPage,
    pageSize: PAGE_SIZE
  });
  
  // Extract courses and pagination metadata from the new API response format
  const allCourses = coursesResponse?.data?.result || [];
  const paginationMeta = coursesResponse?.data?.meta || { page: 1, pageSize: PAGE_SIZE, pages: 1, total: 0 };
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  
  // Filter courses based on search term and filters
  useEffect(() => {
    if (!allCourses.length) return;
    
    let result = [...allCourses];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(course => course.categoryName === selectedCategory);
    }
    
    // Apply level filter
    if (selectedLevel !== 'Tất cả') {
      const levelNumber = levels.indexOf(selectedLevel);
      if (levelNumber > 0) {
        result = result.filter(course => course.level === levelNumber);
      }
    }
    
    setFilteredCourses(result);
    setFilteredTotal(result.length);
  }, [allCourses, searchTerm, selectedCategory, selectedLevel]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.pages) {
      setCurrentPage(newPage);
    }
  };
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel]);
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Khóa học</h1>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 pr-10" 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 pr-10" 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                </div>
              </div>
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
        
        {/* Results information */}
        {!isLoading && !error && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {filteredCourses.length > 0 
                ? `Hiển thị ${filteredCourses.length} trong tổng số ${paginationMeta.total} khóa học` 
                : "Không tìm thấy khóa học nào"}
            </p>
            {(searchTerm || selectedCategory !== 'Tất cả' || selectedLevel !== 'Tất cả') && (
              <button 
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Tất cả');
                  setSelectedLevel('Tất cả');
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course: Course) => (            
                <Link href={`/learning/${course.id}`} key={course.id}>
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="relative h-48">
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
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-64">
                <div className="text-center">
                  <p className="text-xl text-gray-500 mb-3">Không tìm thấy khóa học nào</p>
                  <p className="text-gray-400">Hãy thử tìm kiếm hoặc lọc theo tiêu chí khác</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && !error && paginationMeta.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                }`}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: paginationMeta.pages }, (_, i) => i + 1)
                .filter(page => 
                  // Show first page, last page, current page, and pages around current
                  page === 1 || 
                  page === paginationMeta.pages ||
                  Math.abs(currentPage - page) <= 1
                )
                .map((page, index, array) => {
                  // Add ellipsis
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {page}
                      </button>
                      
                      {showEllipsisAfter && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                    </div>
                  );
                })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationMeta.pages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === paginationMeta.pages 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
