import Link from 'next/link';

// Giả lập dữ liệu syllabus, có thể import từ file chung nếu cần
const syllabus = [
  {
    id: 1,
    title: 'Giới thiệu về Java',
    lessons: [
      { id: 1, title: 'Java là gì?', type: 'video' },
      { id: 2, title: 'Cài đặt môi trường', type: 'video' },
      { id: 3, title: 'Bài tập: Hello World', type: 'exercise' },
    ],
  },
  {
    id: 2,
    title: 'Cú pháp cơ bản',
    lessons: [
      { id: 4, title: 'Biến và kiểu dữ liệu', type: 'video' },
      { id: 5, title: 'Toán tử', type: 'video' },
      { id: 6, title: 'Bài tập: Tính toán', type: 'exercise' },
    ],
  },
  {
    id: 3,
    title: 'Cấu trúc điều khiển',
    lessons: [
      { id: 7, title: 'Câu lệnh if-else', type: 'video' },
      { id: 8, title: 'Vòng lặp', type: 'video' },
      { id: 9, title: 'Bài tập: Game đoán số', type: 'exercise' },
    ],
  },
];

export default function StudyPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Danh sách bài học</h1>
        <div className="space-y-8">
          {syllabus.map((chapter) => (
            <div key={chapter.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{chapter.title}</h2>
              <div className="space-y-2">
                {chapter.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/learning/${params.id}/study/${lesson.id}`}
                    className="block p-3 rounded hover:bg-blue-50 border border-gray-100 transition"
                  >
                    <span className="mr-2 text-blue-600">{lesson.type === 'video' ? '▶️' : '📝'}</span>
                    {lesson.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 