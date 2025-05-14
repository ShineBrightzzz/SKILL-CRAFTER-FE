import Image from 'next/image';
import Link from 'next/link';

const courseData = {
  id: 1,
  title: 'Java Cơ Bản',
  description: 'Học lập trình Java từ cơ bản đến nâng cao',
  image: '/images/java-basic.jpg',
  level: 'Cơ bản',
  duration: '8 tuần',
  students: 15000,
  category: 'Backend',
  instructor: {
    name: 'Nguyễn Văn A',
    avatar: '/images/instructor.jpg',
    bio: 'Giảng viên với 10 năm kinh nghiệm lập trình Java'
  },
  syllabus: [
    {
      id: 1,
      title: 'Giới thiệu về Java',
      lessons: [
        {
          id: 1,
          title: 'Java là gì?',
          duration: '15 phút',
          type: 'video'
        },
        {
          id: 2,
          title: 'Cài đặt môi trường',
          duration: '20 phút',
          type: 'video'
        },
        {
          id: 3,
          title: 'Bài tập: Hello World',
          duration: '30 phút',
          type: 'exercise'
        }
      ]
    },
    {
      id: 2,
      title: 'Cú pháp cơ bản',
      lessons: [
        {
          id: 4,
          title: 'Biến và kiểu dữ liệu',
          duration: '25 phút',
          type: 'video'
        },
        {
          id: 5,
          title: 'Toán tử',
          duration: '20 phút',
          type: 'video'
        },
        {
          id: 6,
          title: 'Bài tập: Tính toán',
          duration: '45 phút',
          type: 'exercise'
        }
      ]
    },
    {
      id: 3,
      title: 'Cấu trúc điều khiển',
      lessons: [
        {
          id: 7,
          title: 'Câu lệnh if-else',
          duration: '20 phút',
          type: 'video'
        },
        {
          id: 8,
          title: 'Vòng lặp',
          duration: '25 phút',
          type: 'video'
        },
        {
          id: 9,
          title: 'Bài tập: Game đoán số',
          duration: '60 phút',
          type: 'exercise'
        }
      ]
    }
  ]
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-96">
            <Image
              src={courseData.image}
              alt={courseData.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600">
                {courseData.category}
              </span>
              <span className="text-sm text-gray-500">{courseData.level}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-gray-600 mb-6">{courseData.description}</p>
            
            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courseData.duration}
                </div>
                <div className="text-sm text-gray-500">Thời lượng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courseData.syllabus.length}
                </div>
                <div className="text-sm text-gray-500">Chương</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courseData.students}
                </div>
                <div className="text-sm text-gray-500">Học viên</div>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src={courseData.instructor.avatar}
                  alt={courseData.instructor.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold">{courseData.instructor.name}</div>
                <div className="text-sm text-gray-500">{courseData.instructor.bio}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
          <div className="space-y-6">
            {courseData.syllabus.map((chapter) => (
              <div key={chapter.id} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-xl font-semibold mb-4">{chapter.title}</h3>
                <div className="space-y-3">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-600">
                          {lesson.type === 'video' ? '▶️' : '📝'}
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 