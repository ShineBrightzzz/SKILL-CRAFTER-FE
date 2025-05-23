'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Form, Input, Select, Button, message, Card, 
  InputNumber, Upload
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCreateLessonMutation } from '@/services/lesson.service';
import { validateAndProcessQuizData } from '@/utils/quiz';

const { Option } = Select;
const { TextArea } = Input;

interface LessonFormValues {
  chapterId: string;
  title: string;
  type: number;
  content?: string;
  quizData?: any;
  quizDataStr?: string;  initialCode?: string;
  solutionCode?: string;
  testCases?: string;
  duration?: number;
  contentFile?: File;
  video?: File;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
    setVideoFile(null);
    form.resetFields(['content', 'quizData', 'video', 'initialCode', 'solutionCode', 'testCases', 'duration']);
  };

  const handleSubmit = async (values: LessonFormValues) => {
    try {
      if (!chapterId) {
        message.error('Thiếu thông tin chương học');
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('type', values.type.toString());
      formData.append('chapterId', chapterId);

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
      }

      // Handle other lesson types
      switch (values.type) {
        case 2: // Video
          if (videoFile) {
            formData.append('video', videoFile);
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
      }      // Handle file uploads
      if (values.contentFile) {
        formData.append('contentFile', values.contentFile);
      }

      // Add progress tracking for video upload
      if (values.type === 2 && values.video instanceof File) {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
      }

      await createLesson({
        body: formData
      }).unwrap();

      setIsUploading(false);
      setUploadProgress(0);
      message.success('Tạo bài học thành công!');
      router.back();
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
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
                  </Form.Item>

                  <div className="space-y-4">
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
            </div>
          </>
        );      case 2: // Video
        return (
          <>
            <Form.Item
              label="Tải lên video"
              required
              help={videoFile ? `File đã chọn: ${videoFile.name}` : undefined}
            >
              <Upload.Dragger
                multiple={false}
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  const isVideo = file.type.startsWith('video/');
                  if (!isVideo) {
                    message.error('Chỉ chấp nhận file video!');
                    return Upload.LIST_IGNORE;
                  }
                  const isLt200M = file.size / 1024 / 1024 < 200;
                  if (!isLt200M) {
                    message.error('Video phải nhỏ hơn 200MB!');
                    return Upload.LIST_IGNORE;
                  }
                  setVideoFile(file);
                  return false;
                }}
                onRemove={() => {
                  setVideoFile(null);
                  setUploadProgress(0);
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc click để tải lên video</p>
                <p className="ant-upload-hint">
                  Hỗ trợ các định dạng: MP4, WebM, Ogg. Kích thước tối đa: 200MB
                </p>
              </Upload.Dragger>
            </Form.Item>
            
            {videoFile && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span>{videoFile.name}</span>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setVideoFile(null);
                      setUploadProgress(0);
                    }}
                  >
                    Xóa video
                  </Button>
                </div>
                {uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Uploading: {uploadProgress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

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

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      const [optionIndex, optionValue] = value;
      newQuestions[index].options[optionIndex] = optionValue;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
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
