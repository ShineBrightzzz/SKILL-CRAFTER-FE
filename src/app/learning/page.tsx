import Image from 'next/image';
import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Java Cơ Bản',
    description: 'Học lập trình Java từ cơ bản đến nâng cao',
    image: '/images/java-basic.jpg',
    level: 'Cơ bản',
    duration: '8 tuần',
    students: 15000,
    category: 'Backend',
    tags: ['Java', 'OOP', 'Spring']
  },
  {
    id: 2,
    title: 'Python Cơ Bản',
    description: 'Làm quen với ngôn ngữ lập trình Python',
    image: '/images/python-basic.jpg',
    level: 'Cơ bản',
    duration: '6 tuần',
    students: 12000,
    category: 'Backend',
    tags: ['Python', 'Data Science']
  },
  {
    id: 3,
    title: 'Web Development',
    description: 'Xây dựng website với HTML, CSS và JavaScript',
    image: '/images/web-dev.jpg',
    level: 'Trung cấp',
    duration: '10 tuần',
    students: 20000,
    category: 'Frontend',
    tags: ['HTML', 'CSS', 'JavaScript']
  },
  {
    id: 4,
    title: 'React.js',
    description: 'Xây dựng ứng dụng web với React.js',
    image: '/images/react.jpg',
    level: 'Trung cấp',
    duration: '8 tuần',
    students: 18000,
    category: 'Frontend',
    tags: ['React', 'JavaScript', 'Web Development']
  },
  {
    id: 5,
    title: 'Node.js',
    description: 'Xây dựng backend với Node.js',
    image: '/images/nodejs.jpg',
    level: 'Trung cấp',
    duration: '8 tuần',
    students: 16000,
    category: 'Backend',
    tags: ['Node.js', 'JavaScript', 'Backend']
  }
];

const categories = ['Tất cả', 'Frontend', 'Backend', 'Mobile', 'DevOps'];
const levels = ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export default function LearningPage() {
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

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link href={`/learning/${course.id}`} key={course.id}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {course.category}
                    </span>
                    <span className="text-sm text-gray-500">{course.level}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{course.duration}</span>
                    <span>{course.students} học viên</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 