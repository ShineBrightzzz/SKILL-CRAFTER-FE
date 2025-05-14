import Image from 'next/image';
import Link from 'next/link';

const featuredCourses = [
  {
    id: 1,
    title: 'Java Cơ Bản',
    description: 'Học lập trình Java từ cơ bản đến nâng cao',
    image: '/images/java-basic.jpg',
    level: 'Cơ bản',
    duration: '8 tuần',
    students: 15000
  },
  {
    id: 2,
    title: 'Python Cơ Bản',
    description: 'Làm quen với ngôn ngữ lập trình Python',
    image: '/images/python-basic.jpg',
    level: 'Cơ bản',
    duration: '6 tuần',
    students: 12000
  },
  {
    id: 3,
    title: 'Web Development',
    description: 'Xây dựng website với HTML, CSS và JavaScript',
    image: '/images/web-dev.jpg',
    level: 'Trung cấp',
    duration: '10 tuần',
    students: 20000
  }
];

const learningPaths = [
  {
    id: 1,
    title: 'Lộ trình Backend Developer',
    description: 'Trở thành Backend Developer chuyên nghiệp',
    courses: 8,
    duration: '6 tháng'
  },
  {
    id: 2,
    title: 'Lộ trình Frontend Developer',
    description: 'Trở thành Frontend Developer chuyên nghiệp',
    courses: 6,
    duration: '4 tháng'
  },
  {
    id: 3,
    title: 'Lộ trình Fullstack Developer',
    description: 'Trở thành Fullstack Developer chuyên nghiệp',
    courses: 12,
    duration: '8 tháng'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Học Lập Trình Trực Tuyến
            </h1>
            <p className="text-xl mb-8">
              Khám phá thế giới lập trình với các khóa học chất lượng cao
            </p>
            <Link
              href="/learning"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
            >
              Bắt đầu học ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Khóa học nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{course.level}</span>
                    <span>{course.duration}</span>
                    <span>{course.students} học viên</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lộ trình học tập</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningPaths.map((path) => (
              <div key={path.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                <p className="text-gray-600 mb-4">{path.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{path.courses} khóa học</span>
                  <span>{path.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
