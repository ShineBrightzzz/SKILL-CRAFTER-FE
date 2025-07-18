'use client'

import React from 'react';
import { Card, Empty, Tabs } from 'antd';
import MarkdownCode from '@/components/MarkdownCode';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';
import CodeEditor, { validateProgrammingLanguage } from '@/components/CodeEditor';
import { QuizData } from '@/types/quiz';
import { validateAndProcessQuizData } from '@/utils/quiz';

const { TabPane } = Tabs;

interface LessonPreviewProps {
  lesson: {
    id: string;
    title: string;
    type: number;
    content: string | null;
    videoUrl: string | null;
    duration: number | null;
    initialCode: string | null;
    quizData: any | null;
    contentFile?: File | null;
    videoFile?: File | null;
    programmingLanguage?: string;
  };
}

export default function LessonPreview({ lesson }: LessonPreviewProps) {
  // Function to validate quiz data
  const validateQuizData = (data: any): QuizData | null => {
    const result = validateAndProcessQuizData(data);
    if (!result.isValid) {
      console.error('Quiz validation error:', result.error);
      return null;
    }
    return result.data;
  };

  const renderLessonContent = () => {
    switch (lesson.type) {      case 1: // Quiz
        const quizData = validateQuizData(lesson.quizData);
        if (!quizData || !quizData.questions || !quizData.questions.length) {
          return (
            <Empty
              description="Dữ liệu trắc nghiệm không hợp lệ hoặc chưa có câu hỏi nào."
              className="my-8"
            />
          );
        }
        return <Quiz quizData={quizData} />;

      case 2: // Video
        if (!lesson.videoUrl) {
          return (
            <Empty
              description="Chưa có đường dẫn video."
              className="my-8"
            />
          );
        }
        return (
          <div className="space-y-4">
            <div className="relative w-full">
              <VideoPlayer src={lesson.videoUrl} />
            </div>
            {lesson.content && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Nội dung mô tả:</h3>
                <MarkdownCode content={lesson.content} />
              </div>
            )}
          </div>
        );      case 3: // Programming exercise
        return (
          <div className="grid md:grid-cols-2 gap-4 overflow-hidden">
            <div className="bg-white p-4 rounded-md border overflow-hidden">
              <h3 className="text-lg font-medium mb-4">Yêu cầu bài tập:</h3>
              {lesson.content ? (
                <div className="overflow-auto max-h-[500px]">
                  <MarkdownCode content={lesson.content} />
                </div>
              ) : (
                <Empty description="Chưa có nội dung bài tập." />
              )}
            </div><div className="bg-gray-50 rounded-md border overflow-hidden">
              <h3 className="text-lg font-medium p-4 border-b">Editor:</h3>
                <div className="h-[400px] w-full overflow-hidden">
                <CodeEditor
                  initialCode={lesson.initialCode || '// Mã khởi tạo cho học viên'}
                  programmingLanguage={validateProgrammingLanguage(lesson.programmingLanguage)}
                  lessonId={lesson.id}
                />
                </div>
            </div>
          </div>
        );

      case 4: // Reading
      default:
        if (!lesson.content) {
          return <Empty description="Chưa có nội dung bài đọc." className="my-8" />;
        }
        return <MarkdownCode content={lesson.content} />;
    }
  };

  return (
    <div className="lesson-preview">
      <Card
        title={<h2 className="text-xl">{lesson.title}</h2>}
        className="mb-6"
      >
        <div className="lesson-preview-content">
          {renderLessonContent()}
        </div>
      </Card>
    </div>
  );
}
