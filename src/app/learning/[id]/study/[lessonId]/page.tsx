'use client'

import { useState, useRef } from 'react';

// Giả lập dữ liệu lý thuyết cho từng bài học
const lessonContents: Record<string, { title: string; theory: string; sampleCode: string }> = {
  '1': {
    title: 'Java là gì?',
    theory: 'Java là một ngôn ngữ lập trình hướng đối tượng phổ biến, được sử dụng rộng rãi trong phát triển ứng dụng web, di động và doanh nghiệp.',
    sampleCode: 'public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}'
  },
  '2': {
    title: 'Cài đặt môi trường',
    theory: 'Để lập trình Java, bạn cần cài đặt JDK và một IDE như IntelliJ IDEA hoặc Eclipse.',
    sampleCode: '// Hướng dẫn cài đặt JDK và IDE...'
  },
  '3': {
    title: 'Bài tập: Hello World',
    theory: 'Viết chương trình in ra dòng chữ "Hello, World!"',
    sampleCode: 'public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}'
  },
  // ... các bài khác tương tự
};

export default function LessonDetailPage({ params }: { params: { id: string; lessonId: string } }) {
  const lesson = lessonContents[params.lessonId] || {
    title: 'Bài học',
    theory: 'Nội dung đang cập nhật...',
    sampleCode: '// Code mẫu',
  };
  const [code, setCode] = useState(lesson.sampleCode);
  const [output, setOutput] = useState('');
  const [leftWidth, setLeftWidth] = useState(400); // px
  const dragging = useRef(false);

  // Kéo thanh chia
  const handleMouseDown = () => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
  };
  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = '';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current) {
      setLeftWidth(Math.max(200, Math.min(e.clientX - 32, 700)));
    }
  };
  // Đăng ký sự kiện kéo/thả
  if (typeof window !== 'undefined') {
    window.onmousemove = handleMouseMove;
    window.onmouseup = handleMouseUp;
  }

  // Giả lập kiểm thử code
  const handleTest = () => {
    if (code.includes('Hello')) {
      setOutput('Kết quả: Đúng!');
    } else {
      setOutput('Kết quả: Sai hoặc chưa đúng yêu cầu.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{lesson.title}</h1>
        <div className="relative flex bg-white rounded-lg shadow min-h-[500px]" style={{height: '70vh'}}>
          {/* Lý thuyết/hướng dẫn */}
          <div
            className="h-full overflow-auto p-6"
            style={{ width: leftWidth, minWidth: 200, maxWidth: 700 }}
          >
            <h2 className="text-xl font-semibold mb-4">Lý thuyết / Hướng dẫn</h2>
            <p className="text-gray-700 whitespace-pre-line">{lesson.theory}</p>
          </div>
          {/* Thanh chia */}
          <div
            className="w-2 cursor-col-resize bg-gray-200 hover:bg-blue-400 transition"
            onMouseDown={handleMouseDown}
            style={{ zIndex: 10 }}
          />
          {/* Code editor + kiểm thử */}
          <div className="flex-1 h-full flex flex-col p-6">
            <h2 className="text-xl font-semibold mb-4">Viết code của bạn</h2>
            <textarea
              className="w-full h-48 border rounded p-2 font-mono mb-4 flex-1"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mb-4"
              onClick={handleTest}
            >
              Kiểm thử
            </button>
            {output && (
              <div className="bg-gray-100 rounded p-3 text-green-700 font-semibold">{output}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 