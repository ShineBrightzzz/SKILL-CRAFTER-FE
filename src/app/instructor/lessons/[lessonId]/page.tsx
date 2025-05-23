'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, Form, Input, Select, InputNumber, Button, 
  message, Tabs, Spin, Typography 
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetLessonByIdQuery, useUpdateLessonMutation } from '@/services/lesson.service';
import { QuizQuestion, LessonUpdateDTO } from '@/types/quiz';
import { useAuth } from '@/store/hooks';
import LessonPreview from '@/components/instructor/LessonPreview';
import { validateAndProcessQuizData } from '@/utils/quiz';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const lessonTypes = [
  { value: 1, label: 'Trắc nghiệm' },
  { value: 2, label: 'Video' },
  { value: 3, label: 'Bài tập lập trình' },
  { value: 4, label: 'Bài đọc' }
];

export default function LessonDetailPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const lessonId = params.lessonId;
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('edit');
  const [lessonType, setLessonType] = useState<number>(4);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Fetch lesson details
  const { data: lessonResponse, isLoading: lessonLoading } = useGetLessonByIdQuery(lessonId);
  const lesson = lessonResponse?.data;
  
  // Update lesson mutation
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();
  
  // Initialize form with lesson data
  useEffect(() => {
    if (lesson) {
      setLessonType(lesson.type);
      form.setFieldsValue({
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        initialCode: lesson.initialCode,
        language: lesson.language
      });
    }
  }, [lesson, form]);
  
  // Initialize questions when lesson data is loaded
  useEffect(() => {
    if (lesson?.quizData) {
      try {
        const quizData = typeof lesson.quizData === 'string' 
          ? JSON.parse(lesson.quizData) 
          : lesson.quizData;
        if (quizData.questions) {
          setQuestions(quizData.questions);
        }
      } catch (error) {
        console.error('Error parsing quiz data:', error);
      }
    }
  }, [lesson]);

  // Validate questions whenever they change
  useEffect(() => {
    const validateQuestions = () => {
      questions.forEach((q, index) => {
        // Ensure all questions have 4 options
        if (q.options.length !== 4) {
          message.error(`Question ${index + 1} must have exactly 4 options`);
          return;
        }
        
        // Validate correct answer
        if (q.correctAnswer < 0 || q.correctAnswer > 3) {
          message.error(`Question ${index + 1} has an invalid correct answer`);
          return;
        }
      });
    };
    
    validateQuestions();
  }, [questions]);
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('title', values.title?.trim());
      formData.append('type', values.type.toString());

      // Process quiz data if it's a quiz lesson
      if (values.type === 1) {
        const quizValidation = validateAndProcessQuizData({
          questions: questions.map(q => ({
            ...q,
            question: q.question.trim(),
            options: q.options.map(opt => opt.trim())
          }))
        });

        if (!quizValidation.isValid) {
          message.error(quizValidation.error || 'Dữ liệu trắc nghiệm không hợp lệ');
          return;
        }

        formData.append('quizData', JSON.stringify(quizValidation.data));
        // Clear other type-specific fields
        formData.append('content', '');
        formData.append('videoUrl', '');
        formData.append('initialCode', '');
        formData.append('duration', '0');
      }

      // Handle other lesson types
      switch (values.type) {
        case 2: // Video
          formData.append('quizData', '');
          if (values.videoUrl) formData.append('videoUrl', values.videoUrl.trim());
          if (values.duration) formData.append('duration', values.duration.toString());
          if (values.content) formData.append('content', values.content.trim());
          break;

        case 3: // Programming
          formData.append('quizData', '');
          if (values.content) formData.append('content', values.content.trim());
          if (values.initialCode) formData.append('initialCode', values.initialCode.trim());
          if (values.solutionCode) formData.append('solutionCode', values.solutionCode.trim());
          if (values.testCases) formData.append('testCases', values.testCases.trim());
          if (values.language) formData.append('language', values.language);
          break;

        case 4: // Reading
          formData.append('quizData', '');
          if (values.content) formData.append('content', values.content.trim());
          break;
      }

      // Send the update
      await updateLesson({
        id: lessonId,
        body: formData
      }).unwrap();

      message.success('Cập nhật bài học thành công!');
      router.push(`/instructor/chapters/${lesson?.chapterId}`);
    } catch (error) {
      console.error('Failed to update lesson:', error);
      message.error('Có lỗi xảy ra khi cập nhật bài học');
    }
  };
  
  // Handle lesson type change
  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: new Array(4).fill(''),  // Always initialize with 4 empty options
      correctAnswer: 0,
      explanation: ''  // Initialize empty explanation
    };
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i !== index) return q;
      
      if (field === 'options') {
        const [optionIndex, optionValue] = value;
        // Ensure optionIndex is valid
        if (optionIndex < 0 || optionIndex > 3) {
          message.error('Invalid option index');
          return q;
        }
        // Create new options array with updated value at index
        const newOptions = [...q.options];
        newOptions[optionIndex] = optionValue;
        return {
          ...q,
          options: newOptions
        };
      }
      
      if (field === 'correctAnswer') {
        // Validate correct answer is between 0-3
        const answer = Number(value);
        if (isNaN(answer) || answer < 0 || answer > 3) {
          message.error('Correct answer must be between 0 and 3');
          return q;
        }
        return {
          ...q,
          correctAnswer: answer
        };
      }
      
      // Handle other fields
      return {
        ...q,
        [field]: value
      };
    });
    
    setQuestions(updatedQuestions);
  };
  
  // Render different form fields based on lesson type
  const renderLessonTypeFields = () => {
    switch (lessonType) {      case 1: // Quiz
        return (
          <>
            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <Card 
                  key={questionIndex} 
                  className="bg-gray-50"
                  extra={
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Xóa câu hỏi
                    </Button>
                  }
                >
                  <Form.Item
                    label={`Câu hỏi ${questionIndex + 1}`}
                    required
                  >
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      placeholder="Nhập câu hỏi"
                    />
                  </Form.Item>                  <div className="space-y-4">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Form.Item
                          className="flex-1 mb-0"
                          required
                        >
                          <Input
                            value={option}
                            onChange={(e) => updateQuestion(questionIndex, 'options', [optionIndex, e.target.value])}
                            placeholder={`Đáp án ${optionIndex + 1}`}
                            className={question.correctAnswer === optionIndex ? 'border-green-500' : ''}
                          />
                        </Form.Item>
                        <Form.Item className="mb-0">
                          <Button
                            type={question.correctAnswer === optionIndex ? 'primary' : 'default'}
                            onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                          >
                            Đáp án đúng
                          </Button>
                        </Form.Item>
                      </div>
                    ))}

                    <Form.Item
                      label="Giải thích đáp án (tùy chọn)"
                    >
                      <Input.TextArea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                        placeholder="Nhập giải thích cho đáp án đúng (không bắt buộc)"
                        rows={2}
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
              
              <Button 
                type="dashed" 
                onClick={addQuestion} 
                block
                icon={<PlusOutlined />}
              >
                Thêm câu hỏi
              </Button>

              {questions.length === 0 && (
                <div className="text-center text-gray-500 my-4">
                  Chưa có câu hỏi nào. Nhấn nút "Thêm câu hỏi" để bắt đầu.
                </div>
              )}
              
              <Form.Item name="quizData" hidden>
                <Input />
              </Form.Item>
            </div>
          </>
        );
        
      case 2: // Video
        return (
          <>
            <Form.Item
              name="videoUrl"
              label="Đường dẫn video"
              rules={[{ required: true, message: 'Vui lòng nhập đường dẫn video!' }]}
            >
              <Input placeholder="Nhập đường dẫn video (YouTube, Vimeo,...)" />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng video!' }]}
            >
              <InputNumber className="w-full" placeholder="Nhập thời lượng video" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung mô tả (Markdown - tùy chọn)"
            >
              <TextArea rows={6} placeholder="Nhập nội dung mô tả bằng Markdown (tùy chọn)" />
            </Form.Item>
          </>
        );
        
      case 3: // Programming exercise
        return (
          <>
            <Form.Item
              name="content"
              label="Nội dung bài tập (Markdown)"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung bài tập!' }]}
            >
              <TextArea rows={6} placeholder="Nhập nội dung bài tập bằng Markdown" />
            </Form.Item>
            <Form.Item
              name="initialCode"
              label="Mã khởi tạo"
              rules={[{ required: true, message: 'Vui lòng nhập mã khởi tạo!' }]}
            >
              <TextArea rows={6} placeholder="Nhập mã khởi tạo cho học viên" />
            </Form.Item>
            <Form.Item
              name="language"
              label="Ngôn ngữ lập trình"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ lập trình!' }]}
            >
              <Select placeholder="Chọn ngôn ngữ lập trình">
                <Option value="javascript">JavaScript</Option>
                <Option value="python">Python</Option>
                <Option value="java">Java</Option>
                <Option value="csharp">C#</Option>
              </Select>
            </Form.Item>
          </>
        );
        
      case 4: // Reading
      default:
        return (
          <Form.Item
            name="content"
            label="Nội dung bài đọc (Markdown)"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bài đọc!' }]}
          >
            <TextArea rows={10} placeholder="Nhập nội dung bài đọc bằng Markdown" />
          </Form.Item>
        );
    }
  };
  
  if (lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2">Đang tải thông tin bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy bài học</p>
      </div>
    );
  }
  
  const getLessonTypeName = (type: number) => {
    const lessonType = lessonTypes.find(lt => lt.value === type);
    return lessonType ? lessonType.label : 'Không xác định';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push(`/instructor/chapters/${lesson.chapterId}`)}
            className="mb-4"
          >
            Quay lại danh sách bài học
          </Button>
        </div>
        
        <Card className="shadow-md">
          <Title level={3}>{lesson.title}</Title>
          <div className="mb-4 flex flex-wrap gap-4">
            <Text type="secondary">Chương: {lesson.chapterName}</Text>
            <Text type="secondary">Loại: {getLessonTypeName(lesson.type)}</Text>
            {lesson.duration && <Text type="secondary">Thời lượng: {lesson.duration} phút</Text>}
          </div>
          
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Chỉnh sửa bài học" key="edit">
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                initialValues={{
                  title: lesson.title,
                  type: lesson.type,
                  content: lesson.content,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration,
                  initialCode: lesson.initialCode,
                  language: lesson.language
                }}
              >
                <Form.Item
                  name="title"
                  label="Tên bài học"
                  rules={[{ required: true, message: 'Vui lòng nhập tên bài học!' }]}
                >
                  <Input placeholder="Nhập tên bài học" />
                </Form.Item>
                
                <Form.Item
                  name="type"
                  label="Loại bài học"
                  rules={[{ required: true, message: 'Vui lòng chọn loại bài học!' }]}
                >
                  <Select 
                    placeholder="Chọn loại bài học" 
                    onChange={handleLessonTypeChange}
                  >
                    {lessonTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {/* Render different fields based on lesson type */}
                {renderLessonTypeFields()}
                
                <Form.Item className="mt-6">
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => router.back()}>
                      Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isUpdating}>
                      Cập nhật bài học
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </TabPane>
              <TabPane tab="Xem trước" key="preview">
              <div className="bg-white p-4 rounded-md">
                {lesson ? (
                  <LessonPreview lesson={lesson} />
                ) : (
                  <p className="text-gray-500 mb-4">Không thể tải dữ liệu bài học.</p>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="Phản hồi học viên" key="feedback">
              <div className="bg-white p-4 rounded-md">
                <p className="text-gray-500 mb-4">Tính năng xem phản hồi của học viên sẽ được phát triển sau.</p>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
