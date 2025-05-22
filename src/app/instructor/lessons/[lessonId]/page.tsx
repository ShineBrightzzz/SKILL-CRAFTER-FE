'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, Form, Input, Select, InputNumber, Button, 
  message, Tabs, Spin, Typography 
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetLessonByIdQuery, useUpdateLessonMutation } from '@/services/lesson.service';
import { useAuth } from '@/store/hooks';
import LessonPreview from '@/components/instructor/LessonPreview';

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
        language: lesson.language,
        quizData: lesson.quizData
      });
    }
  }, [lesson, form]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      await updateLesson({
        id: lessonId,
        body: {
          ...values,
          chapterId: lesson?.chapterId
        }
      }).unwrap();
      message.success('Cập nhật bài học thành công!');
      router.push(`/instructor/chapters/${lesson?.chapterId}/lessons`);
    } catch (error) {
      console.error('Failed to update lesson:', error);
      message.error('Có lỗi xảy ra khi cập nhật bài học');
    }
  };
  
  // Handle lesson type change
  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
  };
  
  // Render different form fields based on lesson type
  const renderLessonTypeFields = () => {
    switch (lessonType) {
      case 1: // Quiz
        return (
          <Form.Item
            name="quizData"
            label="Dữ liệu trắc nghiệm (JSON)"
            rules={[{ required: true, message: 'Vui lòng nhập dữ liệu trắc nghiệm!' }]}
          >
            <TextArea
              rows={10}
              placeholder={`Nhập dữ liệu JSON, ví dụ:
{
  "questions": [
    {
      "question": "Câu hỏi của bạn ở đây?",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": 0
    }
  ]
}`}
            />
          </Form.Item>
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
            onClick={() => router.push(`/instructor/chapters/${lesson.chapterId}/lessons`)}
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
                  language: lesson.language,
                  quizData: lesson.quizData
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
