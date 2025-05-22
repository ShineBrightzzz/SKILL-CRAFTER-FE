'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Form, Input, Select, Button, message, Card, 
  InputNumber, Upload
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useCreateLessonMutation } from '@/services/lesson.service';

const { Option } = Select;
const { TextArea } = Input;

interface LessonFormValues {
  chapterId: string;
  title: string;
  type: number;
  content?: string;
  quizData?: any;
  quizDataStr?: string;
  videoUrl?: string;
  initialCode?: string;
  solutionCode?: string;
  testCases?: string;
  duration?: number;
  contentFile?: File;
  videoFile?: File;
}

const lessonTypes = [
  { value: 1, label: 'Trắc nghiệm' },
  { value: 2, label: 'Video' },
  { value: 3, label: 'Bài tập lập trình' },
  { value: 4, label: 'Bài đọc' }
];

export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');
  const [form] = Form.useForm<LessonFormValues>();
  const [createLesson] = useCreateLessonMutation();
  const [lessonType, setLessonType] = useState<number>(4);

  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
    form.resetFields(['content', 'quizData', 'videoUrl', 'initialCode', 'solutionCode', 'testCases', 'duration']);
  };

  const handleSubmit = async (values: LessonFormValues) => {
    try {
      if (!chapterId) {
        message.error('Thiếu thông tin chương học!');
        return;
      }

      // Đảm bảo chapterId là UUID hợp lệ
      const formData = new FormData();
      try {
        // Thử parse chapterId thành UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chapterId)) {
          message.error('ID chương không hợp lệ!');
          return;
        }
        formData.append('chapterId', chapterId);
      } catch (error) {
        message.error('ID chương không hợp lệ!');
        return;
      }

      formData.append('title', values.title);
      formData.append('type', values.type.toString());

      // Xử lý dữ liệu dựa trên loại bài học
      switch (values.type) {
        case 1: // Quiz
          if (values.quizData) {
            try {
              // Đảm bảo dữ liệu quiz là JSON hợp lệ
              const quizDataObj = typeof values.quizData === 'string' 
                ? JSON.parse(values.quizData) 
                : values.quizData;
              formData.append('quizDataStr', JSON.stringify(quizDataObj));
            } catch (error) {
              message.error('Dữ liệu trắc nghiệm không hợp lệ!');
              return;
            }
          }
          break;

        case 2: // Video
          if (values.videoUrl) {
            formData.append('videoUrl', values.videoUrl);
          }
          if (values.duration) {
            formData.append('duration', values.duration.toString());
          }
          if (values.content) {
            formData.append('content', values.content);
          }
          break;

        case 3: // Programming
          if (values.content) {
            formData.append('content', values.content);
          }
          if (values.initialCode) {
            formData.append('initialCode', values.initialCode);
          }
          if (values.solutionCode) {
            formData.append('solutionCode', values.solutionCode);
          }
          if (values.testCases) {
            formData.append('testCases', values.testCases);
          }
          break;

        case 4: // Reading
          if (values.content) {
            formData.append('content', values.content);
          }
          break;
      }

      // Handle file uploads
      if (values.contentFile) {
        formData.append('contentFile', values.contentFile);
      }
      if (values.videoFile) {
        formData.append('videoFile', values.videoFile);
      }

      await createLesson({
        body: formData
      }).unwrap();

      message.success('Tạo bài học thành công!');
      router.back();
    } catch (error: any) {
      console.error('Failed to create lesson:', error);
      if (error.data?.message) {
        message.error(error.data.message);
      } else {
        message.error('Có lỗi xảy ra khi tạo bài học');
      }
    }
  };

  const renderFormFields = () => {
    switch (lessonType) {
      case 1: // Quiz
        return (
          <>
            <Form.Item
              name="quizData"
              label="Dữ liệu trắc nghiệm (JSON)"
              rules={[
                { 
                  required: true,
                  message: 'Vui lòng nhập dữ liệu trắc nghiệm!',
                  validator: async (_, value) => {
                    if (value) {
                      try {
                        JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
                      } catch (error) {
                        throw new Error('Dữ liệu JSON không hợp lệ!');
                      }
                    }
                  }
                }
              ]}
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
          </>
        );

      case 2: // Video
        return (
          <>
            <Form.Item
              name="videoUrl"
              label="Đường dẫn video"
              rules={[
                { 
                  required: !form.getFieldValue('videoFile'),
                  message: 'Vui lòng nhập đường dẫn video hoặc tải lên tệp!' 
                }
              ]}
            >
              <Input placeholder="Nhập đường dẫn video (YouTube, Vimeo,...)" />
            </Form.Item>

            <Form.Item
              name="videoFile"
              label="Tệp video"
              rules={[
                { 
                  required: !form.getFieldValue('videoUrl'),
                  message: 'Vui lòng tải lên video hoặc nhập đường dẫn!' 
                }
              ]}
            >
              <Input 
                type="file" 
                accept="video/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setFieldsValue({ videoFile: file });
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung mô tả (Markdown)"
            >
              <TextArea rows={6} />
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
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="initialCode"
              label="Mã khởi tạo"
              rules={[{ required: true, message: 'Vui lòng nhập mã khởi tạo!' }]}
            >
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="solutionCode"
              label="Mã giải pháp"
              rules={[{ required: true, message: 'Vui lòng nhập mã giải pháp!' }]}
            >
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="testCases"
              label="Test cases (JSON)"
              rules={[
                { 
                  required: true,
                  message: 'Vui lòng nhập test cases!',
                  validator: async (_, value) => {
                    if (value) {
                      try {
                        JSON.parse(value);
                      } catch (error) {
                        throw new Error('Dữ liệu JSON không hợp lệ!');
                      }
                    }
                  }
                }
              ]}
            >
              <TextArea 
                rows={6}
                placeholder={`Nhập test cases dạng JSON, ví dụ:
[
  {
    "input": "test input 1",
    "expectedOutput": "expected output 1"
  }
]`}
              />
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
            <TextArea rows={10} />
          </Form.Item>
        );
    }
  };

  if (!chapterId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Thiếu thông tin chương học</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            className="mr-4"
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold m-0">
            Thêm bài học mới
          </h1>
        </div>

        <Card className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              chapterId,
              type: 4
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
              <Select onChange={handleLessonTypeChange}>
                {lessonTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {renderFormFields()}

            <Form.Item className="mt-6">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo mới
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
