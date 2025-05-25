# Phân loại bài học trong hệ thống

Hệ thống hiện tại có 4 loại bài học khác nhau, mỗi loại có cách hiển thị và xử lý riêng. Dưới đây là chi tiết về từng loại:

## 1. Bài trắc nghiệm (`type === 1`)

### Đặc điểm
- **ID**: 1
- **Tên hiển thị**: Trắc nghiệm
- **Dữ liệu chính**: `quizData` - chứa các câu hỏi và đáp án
- **Component hiển thị**: `<Quiz data={currentLesson.quizData} />`

### Cấu trúc dữ liệu
```typescript
quizData: {
  questions: [
    {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }
  ]
}
```

### Lưu ý khi phát triển
- Cần kiểm tra cấu trúc dữ liệu `quizData` trước khi hiển thị
- Có thể thêm logic xử lý kết quả và hiển thị giải thích sau khi hoàn thành

## 2. Bài học video (`type === 2`)

### Đặc điểm
- **ID**: 2
- **Tên hiển thị**: Video
- **Dữ liệu chính**: `videoUrl` - đường dẫn đến video
- **Component hiển thị**: `<VideoPlayer src={currentLesson.videoUrl} />`
- **Thêm thuộc tính**: `duration` - thời lượng video (phút)

### Tính năng
- Có nút "Đánh dấu hoàn thành" sau khi xem video
- Hiển thị trạng thái đã hoàn thành bằng icon và màu sắc

### Lưu ý khi phát triển
- Cần kiểm tra `videoUrl` tồn tại trước khi render
- Có thể thêm tính năng theo dõi tiến độ xem video

## 3. Bài tập lập trình (`type === 3`)

### Đặc điểm
- **ID**: 3
- **Tên hiển thị**: Bài tập lập trình
- **Dữ liệu chính**: 
  - `content` - nội dung hướng dẫn và yêu cầu bài tập
  - `initialCode` - code mẫu ban đầu
  - `language` - ngôn ngữ lập trình (javascript, java, python...)
- **Component hiển thị**: Layout chia đôi với `<MarkdownCode />` và `<CodeEditor />`

### Cấu trúc giao diện
- Layout chia đôi (grid-cols-2):
  - Bên trái: Hiển thị nội dung hướng dẫn bài tập
  - Bên phải: Trình soạn thảo code và phần kiểm thử

### Lưu ý khi phát triển
- Dữ liệu code người dùng được lưu trong Redux store (xem `useUserCode` hook)
- Có thể cần thêm chức năng chạy và kiểm tra code

## 4. Bài đọc (`type === 4`)

### Đặc điểm
- **ID**: 4
- **Tên hiển thị**: Bài đọc
- **Dữ liệu chính**: `content` - nội dung bài học dạng Markdown
- **Component hiển thị**: `<MarkdownCode content={currentLesson.content} />`

### Tính năng
- Có nút "Đánh dấu hoàn thành" sau khi đọc
- Hiển thị trạng thái đã hoàn thành bằng icon và màu sắc

### Lưu ý khi phát triển
- Sử dụng component `MarkdownCode` để render nội dung Markdown
- Cần kiểm tra `content` tồn tại trước khi render

## Các thành phần chung cho mọi loại bài học

### Thuộc tính chung
```typescript
interface Lesson {
  id: string;
  chapterId: string;
  chapterName: string;
  title: string;
  type: number; // 1-4 tương ứng với các loại trên
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order?: number;
  initialCode?: string;
  language?: string;
  quizData?: any;
  isCompleted?: boolean;
}
```

### Tính năng chung
- Điều hướng giữa các bài học (nút Previous/Next)
- Hiển thị trạng thái hoàn thành
- Menu sidebar hiển thị cấu trúc khóa học

## Vấn đề thường gặp và cách khắc phục

### 1. Sai kiểu dữ liệu
- **Vấn đề**: `quizData` có thể là chuỗi JSON hoặc đối tượng
- **Xử lý**: Kiểm tra và parse nếu cần
```typescript
const quizData = typeof lesson.quizData === 'string' 
  ? JSON.parse(lesson.quizData) 
  : lesson.quizData;
```

### 2. Dữ liệu thiếu
- **Vấn đề**: Các thuộc tính như `content`, `videoUrl` có thể là null
- **Xử lý**: Luôn kiểm tra trước khi sử dụng và cung cấp giá trị mặc định
```typescript
initialCode={currentLesson.initialCode || '// Write your code here'}
language={currentLesson.language || 'javascript'}
```

### 3. Tham chiếu null/undefined
- **Vấn đề**: Tham chiếu đến thuộc tính của đối tượng null/undefined
- **Xử lý**: Sử dụng optional chaining và nullish coalescing
```typescript
currentLesson?.type === 4 && currentLesson?.content
(loadedLessons[chapter.id] || [])
```
