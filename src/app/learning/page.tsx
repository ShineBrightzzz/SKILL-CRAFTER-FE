'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGetAllCoursesQuery } from '@/services/course.service';
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';

// Define Course type
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
  status: number; // 2 means approved
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
}

// Helper function to safely get total pages
const getTotalPages = (meta: { page: number; pageSize: number; pages?: number; total: number }) => {
  if ('pages' in meta && meta.pages) return meta.pages;
  return Math.ceil(meta.total / meta.pageSize);
};

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

const levels = ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const PAGE_SIZE = 6; // Number of courses to display per page

const LearningPage = () => {
  // Initialize all state variables first
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');

  // Fetch categories data from API
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const categories = [
    { id: 'all', name: 'Tất cả' },
    ...(categoriesResponse?.data?.result?.map(cat => ({
      id: cat.id,
      name: cat.name
    })) || [])
  ];
  console.log('Categories:', categories);
  // Fetch courses data from API with filters
  const { data: coursesResponse, isLoading, error } = useGetAllCoursesQuery({
    page: currentPage,
    size: PAGE_SIZE,
    search: searchTerm,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    level: selectedLevel !== 'Tất cả' ? levels.indexOf(selectedLevel) : undefined,
    status: 2 // Chỉ lấy các khóa học đã được phê duyệt
  }, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    pollingInterval: 0
  });
    // Extract courses and pagination metadata from the new API response format
  const courses = coursesResponse?.data?.result || [];
  const paginationMeta = coursesResponse?.data?.meta || { page: 1, pageSize: PAGE_SIZE, pages: 1, total: 0 };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    const totalPages = getTotalPages(paginationMeta);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel]);
    // Add animation effect when courses load
  useEffect(() => {
    if (!isLoading && !error && courses.length > 0) {
      setIsLoaded(true);
    }
  }, [isLoading, error, courses]);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Khóa học</h1>
          {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 transform transition duration-300 hover:shadow-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-all duration-300 focus:shadow-md"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 transform transition duration-300 hover:shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 pr-10 transition-all duration-300 hover:border-blue-400"                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 pr-10 transition-all duration-300 hover:border-blue-400" 
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
                  <FiChevronDown className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl text-gray-700 font-medium">Đang tải khóa học...</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center bg-red-50 p-8 rounded-xl shadow-md">
              <div className="text-red-600 text-5xl mb-4">&#9888;</div>
              <p className="text-xl text-red-600 font-medium mb-2">Có lỗi xảy ra khi tải khóa học</p>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {(error as any)?.data?.message || 
                 (error as any)?.error || 
                 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'}
              </p>
              <button 
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
          {/* Results information */}
        {!isLoading && !error && (
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">            <p className="text-gray-700 font-medium">              {paginationMeta.total > 0 
                ? `Trang ${currentPage} - Hiển thị ${((currentPage - 1) * PAGE_SIZE) + 1}-${Math.min(currentPage * PAGE_SIZE, paginationMeta.total)} trong ${paginationMeta.total} khóa học` 
                : "Không tìm thấy khóa học nào"}
            </p>{(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'Tất cả') && (
              <button 
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
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
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <Link href={`/learning/${course.id}`} key={course.id} className="group h-[500px] block">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative h-48 flex-shrink-0">
                      <Image
                        src={course.imageUrl || '/logo.png'}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-full truncate max-w-[60%]">
                          {categories.find(cat => cat.id === course.categoryId)?.name || 'Chưa phân loại'}
                        </span>
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">{getLevelText(course.level)}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4 flex-grow overflow-y-auto">
                        {course.tags && Array.isArray(course.tags) && course.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm border-t pt-4 mt-auto">
                        <span className="font-medium text-gray-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.duration ? `${course.duration} giờ` : 'Không xác định'}
                        </span>
                        <span className="font-bold text-blue-600">{new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-64">
                <div className="text-center bg-white p-10 rounded-xl shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl text-gray-600 font-medium mb-3">Không tìm thấy khóa học nào</p>
                  <p className="text-gray-500">Hãy thử tìm kiếm hoặc lọc theo tiêu chí khác</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('Tất cả');
                      setSelectedLevel('Tất cả');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem tất cả khóa học
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && !error && getTotalPages(paginationMeta) > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-md">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg flex items-center justify-center ${
                  currentPage === 1 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                } transition-colors`}
                aria-label="Previous page"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: getTotalPages(paginationMeta) }, (_, i) => i + 1)
                .filter(page => 
                  // Show first page, last page, current page, and pages around current
                  page === 1 || 
                  page === getTotalPages(paginationMeta) ||
                  Math.abs(currentPage - page) <= 1
                )
                .map((page, index, array) => {
                  // Add ellipsis
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-blue-600 text-white font-medium shadow-md'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                      
                      {showEllipsisAfter && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                    </div>
                  );
                })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === getTotalPages(paginationMeta)}
                className={`p-2 rounded-lg flex items-center justify-center ${
                  currentPage === getTotalPages(paginationMeta)
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                } transition-colors`}
                aria-label="Next page"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default LearningPage;