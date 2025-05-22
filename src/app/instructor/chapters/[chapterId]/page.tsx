'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, Button, Space, Modal, Form, Input, Select, 
  message, Pagination, InputNumber, Card, Spin
} from 'antd';
import { 
  DeleteOutlined, PlusOutlined, 
  ArrowLeftOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useGetChapterByIdQuery } from '@/services/chapter.service';
import { 
  useGetLessonsByChapterIdQuery, 
  useCreateLessonMutation, 
  useDeleteLessonMutation
} from '@/services/lesson.service';
import { useAuth } from '@/store/hooks';

const { Option } = Select;
const { TextArea } = Input;

interface LessonFormValues {
  title: string;
  chapterId: string;
  type: number;
  content?: string;
  contentFile?: File;  // For markdown content files, quiz JSON files
  videoUrl?: string;
  videoFile?: File;  // For video files
  duration?: number;
  initialCode?: string;
  language?: string;
  quizData?: string;  // For quiz data in JSON format
}

const lessonTypes = [
  { value: 1, label: 'Trắc nghiệm' },
  { value: 2, label: 'Video' },
  { value: 3, label: 'Bài tập lập trình' },
  { value: 4, label: 'Bài đọc' }
];

export default function ChapterLessonsPage({ params }: { params: { chapterId: string } }) {
  const router = useRouter();
  const { chapterId } = params;  // Destructure chapterId directly from params
  const [form] = Form.useForm<LessonFormValues>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lessonType, setLessonType] = useState<number>(4); // Default to reading lesson
  
  const { user } = useAuth();
  
  // Fetch chapter details
  const { data: chapterResponse, isLoading: chapterLoading } = useGetChapterByIdQuery(chapterId);
  const chapter = chapterResponse?.data;
  
  // Fetch lessons for this chapter
  const { 
    data: lessonsResponse, 
    isLoading: lessonsLoading, 
    refetch 
  } = useGetLessonsByChapterIdQuery(chapterId);
  
  const lessons = lessonsResponse?.data?.result || [];
  // Lesson mutations
  const [createLesson] = useCreateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
    const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      chapterId: chapterId,
      type: 4 
    });
  };
  
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    form.setFieldsValue({ chapterId }); // Ensure chapterId is set after reset
  };  
  const handleSubmit = async (values: LessonFormValues) => {
    try {
      // Create a new FormData object for our form submission
      const formData = new FormData();

      // Ensure we have the chapterId
      if (!values.chapterId) {
        values.chapterId = chapterId; // Set from URL param if not in form
      }
      
      if (!values.chapterId) {
        message.error('Thiếu thông tin chương học!');
        return;
      }
      // Add basic fields
      formData.append('chapterId', chapterId);
      formData.append('title', values.title);
      formData.append('type', values.type.toString());

      // Handle quiz data
      if (values.type === 1 && values.quizData) {
        try {
          const quizDataObj = JSON.parse(values.quizData);
          formData.append('quizData', JSON.stringify(quizDataObj));
        } catch (error) {
          message.error('Dữ liệu trắc nghiệm không hợp lệ!');
          console.error('JSON parse error:', error);
          return;
        }
      }

      // Handle content file or text content
      if (values.contentFile) {
        formData.append('contentFile', values.contentFile);
      } else if (values.content) {
        formData.append('content', values.content);
      }

      // Handle video file or URL
      if (values.videoFile) {
        formData.append('videoFile', values.videoFile);
      } else if (values.videoUrl) {
        formData.append('videoUrl', values.videoUrl);
      }

      // Add other fields if they exist
      if (values.duration) formData.append('duration', values.duration.toString());
      if (values.initialCode) formData.append('initialCode', values.initialCode);
      if (values.language) formData.append('language', values.language);

      await createLesson({
        body: formData
      }).unwrap();
      message.success('Tạo bài học thành công!');
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      console.error('Failed to submit lesson:', error);
      message.error('Có lỗi xảy ra khi lưu bài học');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài học này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteLesson(id).unwrap();
          message.success('Xóa bài học thành công!');
          refetch();
        } catch (error) {
          console.error('Failed to delete lesson:', error);
          message.error('Có lỗi xảy ra khi xóa bài học');
        }
      }
    });
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // Handle lesson type change
  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
  };

  const columns = [
    {
      title: 'Tên bài học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại bài học',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const lessonType = lessonTypes.find(lt => lt.value === type);
        return lessonType ? lessonType.label : 'Không xác định';
      }
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number | null) => duration ? `${duration} phút` : 'N/A'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="default" 
            icon={<FileTextOutlined />}
            onClick={() => router.push(`/instructor/lessons/${record.id}`)}
          >
            Chi tiết
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Render different form fields based on lesson type
  const renderLessonTypeFields = () => {
    switch (lessonType) {
      case 1: // Quiz
        return (
          <>
            <Form.Item
              name="quizData"
              label="Dữ liệu trắc nghiệm (JSON)"
              rules={[
                {
                  required: form.getFieldValue('contentFile') === undefined,
                  message: 'Vui lòng nhập dữ liệu trắc nghiệm hoặc tải lên tệp JSON!',
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
              dependencies={['contentFile']}
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
            <Form.Item
              name="contentFile"
              label="Tệp dữ liệu trắc nghiệm (JSON)"
              rules={[
                {
                  required: !form.getFieldValue('quizData'),
                  message: 'Vui lòng nhập dữ liệu trắc nghiệm hoặc tải lên tệp JSON!',
                }
              ]}
              dependencies={['quizData']}
            >
              <Input 
                type="file" 
                accept=".json" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const jsonContent = event.target?.result;
                        if (typeof jsonContent === 'string') {
                          JSON.parse(jsonContent); // Validate JSON
                          form.setFieldsValue({ contentFile: file });
                        }
                      } catch (error) {
                        message.error('Tệp JSON không hợp lệ!');
                        form.setFieldsValue({ contentFile: undefined });
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </Form.Item>
          </>
        );          case 2: // Video
        return (
          <>
            <Form.Item
              name="videoUrl"
              label="Đường dẫn video"
              rules={[
                {
                  required: !form.getFieldValue('videoFile'),
                  message: 'Vui lòng nhập đường dẫn video hoặc tải lên tệp video!',
                }
              ]}
              dependencies={['videoFile']}
            >
              <Input placeholder="Nhập đường dẫn video (YouTube, Vimeo,...)" />
            </Form.Item>
            <Form.Item
              name="videoFile"
              label="Tệp video"
              rules={[
                {
                  required: !form.getFieldValue('videoUrl'),
                  message: 'Vui lòng tải lên video hoặc nhập đường dẫn!',
                }
              ]}
              dependencies={['videoUrl']}
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
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng video!' }]}
            >
              <InputNumber min={1} className="w-full" placeholder="Nhập thời lượng video" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung mô tả (Markdown - tùy chọn)"
            >
              <TextArea rows={6} placeholder="Nhập nội dung mô tả bằng Markdown (tùy chọn)" />
            </Form.Item>
            <Form.Item
              name="contentFile"
              label="Tệp nội dung mô tả (Markdown)"
            >
              <Input 
                type="file" 
                accept=".md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setFieldsValue({ contentFile: file });
                  }
                }}
              />
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
              name="contentFile"
              label="Tệp nội dung bài tập (Markdown)"
            >
              <Input type="file" accept=".md" />
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
          <>
            <Form.Item
              name="content"
              label="Nội dung bài đọc (Markdown)"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung bài đọc!' }]}
            >
              <TextArea rows={10} placeholder="Nhập nội dung bài đọc bằng Markdown" />
            </Form.Item>
            <Form.Item
              name="contentFile"
              label="Tệp nội dung (Markdown)"
            >
              <Input type="file" accept=".md" />
            </Form.Item>
          </>
        );
    }
  };

  if (chapterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2">Đang tải thông tin chương học...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy chương học</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/instructor/courses/${chapter.courseId}`)}
              className="mr-4"
            >
              Quay lại khóa học
            </Button>
            <h1 className="text-2xl font-bold m-0">
              Quản lý bài học: {chapter.name}
            </h1>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => router.push(`/instructor/lessons/create?chapterId=${chapterId}`)}
          >
            Thêm bài học mới
          </Button>
        </div>
        
        <Card className="shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500">Khóa học: {chapter.courseName}</p>
              <p className="text-gray-500">Thời lượng: {chapter.estimatedTime || 0} phút</p>
            </div>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={lessons} 
            rowKey="id"
            loading={lessonsLoading}
            pagination={false}
          />
          
          {/* Custom pagination */}
          {lessons.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Pagination 
                current={currentPage}
                pageSize={pageSize}
                total={lessons.length}
                showSizeChanger
                onChange={handlePageChange}
                showTotal={(total) => `Tổng cộng ${total} bài học`}
              />
            </div>
          )}
        </Card>
      </div>

      <Modal
        title="Thêm bài học mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          
          {/* Hidden form field for chapterId */}
          <Form.Item
            name="chapterId"
            hidden
          >
            <Input />
          </Form.Item>
          
          {/* Render different fields based on lesson type */}
          {renderLessonTypeFields()}
          
          <Form.Item className="mt-6">
            <div className="flex justify-end space-x-2">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
