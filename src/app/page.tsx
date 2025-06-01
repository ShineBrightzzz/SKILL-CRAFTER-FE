'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useGetAllCoursesQuery, useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { FiClock, FiBarChart2, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '@/store/hooks';

export default function Home() {
  const { user } = useAuth();
  const { data: coursesResponse, isLoading: isLoadingCourses } = useGetAllCoursesQuery({});
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useGetAllCategoriesQuery();
  const { data: enrollmentsResponse, isLoading: isLoadingEnrollments } = 
    useGetEnrollmentsByUserIdQuery({ userId: user?.id || '' }, { skip: !user });

  // Extract data
  const courses = coursesResponse?.data?.result || [];
  const categories = categoriesResponse?.data?.result || [];
  const myEnrollments = enrollmentsResponse?.data?.result || [];
  
  // Get featured courses (first 3 approved courses)
  const featuredCourses = courses
    .filter(course => course.status === 2) // Only approved courses
    .slice(0, 3);

  // Get level text
  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Không xác định';
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in">
              Học Lập Trình <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Trực Tuyến
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 animate-fade-in-up">
              Khám phá thế giới lập trình với các khóa học chất lượng cao <br/>
              được thiết kế bởi các chuyên gia hàng đầu
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/learning"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
              >
                Bắt đầu học ngay
              </Link>
              <Link
                href="/paths"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition transform hover:scale-105"
              >
                Xem lộ trình
              </Link>
            </div>
            <div className="mt-12 flex justify-center gap-8 text-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{categories.length}+</div>
                <div className="text-sm">Danh mục</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{courses.length}+</div>
                <div className="text-sm">Khóa học</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-sm">Học viên</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Khóa học nổi bật
            </h2>
            <p className="text-gray-600 text-lg">
              Những khóa học được đánh giá cao và được nhiều học viên lựa chọn
            </p>
          </div>
          
          {isLoadingCourses ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Link href={`/course-detail/${course.id}`} key={course.id}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="relative h-48">
                      <Image
                        src={course.imageUrl || '/images/course-default.jpg'}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                        {course.categoryName}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                        <div className="flex items-center">
                          <FiBarChart2 className="mr-2" />
                          <span>{getLevelText(course.level)}</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-2" />
                          <span>{course.duration} tuần</span>
                        </div>
                        <div className="flex items-center text-blue-600 font-semibold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href="/learning"
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Xem tất cả khóa học
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>      </section>

      {/* My Courses - Only shown when logged in */}
      {user && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Khóa học của tôi
              </h2>
              <p className="text-gray-600 text-lg">
                Tiếp tục học tập với các khóa học bạn đã đăng ký
              </p>
            </div>
            
            {isLoadingEnrollments ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : myEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myEnrollments.map((enrollment) => {
                  const course = courses.find(c => c.id === enrollment.courseId);
                  if (!course) return null;
                  
                  return (
                    <Link href={`/learning/${course.id}`} key={enrollment.id}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl border-2 border-blue-100">
                        <div className="relative h-48">
                          <Image
                            src={course.imageUrl || '/images/course-default.jpg'}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold text-white">
                            Đang học
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{course.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-4">
                            <div className="flex items-center">
                              <FiBookOpen className="mr-2" />
                              <span>Tiếp tục học</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <p>Bạn chưa đăng ký khóa học nào</p>
                <Link 
                  href="/learning"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 mt-4"
                >
                  Khám phá khóa học ngay
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Danh mục khóa học
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá các khóa học theo danh mục bạn quan tâm
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  href={`/learning?category=${category.id}`}
                  key={category.id}
                  className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{category.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                  <div className="mt-4 text-blue-600 font-medium text-sm">
                    {courses.filter(course => course.categoryId === category.id).length} khóa học
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/cta-pattern.svg')] opacity-10"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Sẵn sàng bắt đầu hành trình học tập của bạn?
              </h2>
              <p className="text-lg text-gray-200 mb-10">
                Đăng ký ngay hôm nay để khám phá các khóa học chất lượng và bắt đầu xây dựng sự nghiệp trong lĩnh vực lập trình
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition transform hover:scale-105"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/learning"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition transform hover:scale-105"
                >
                  Xem tất cả khóa học
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
