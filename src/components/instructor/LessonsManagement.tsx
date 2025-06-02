'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Pagination, InputNumber, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useGetAllCourseByInstructorQuery } from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { useGetLessonsByChapterIdQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation } from '@/services/lesson.service';
import { useAuth } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/store/hooks/abilityHooks';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface LessonFormValues {
  title: string;
  chapterId: string;
  type: number;
  content?: string;
  videoUrl?: string;
  duration?: number;
  initialCode?: string;
  language?: string;
  quizData?: string;
}

const lessonTypes = [
  { value: 1, label: 'Trắc nghiệm' },
  { value: 2, label: 'Video' },
  { value: 3, label: 'Bài tập lập trình' },
  { value: 4, label: 'Bài đọc' }
];

const LessonsManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('1');
  const [lessonType, setLessonType] = useState<number>(4);
  const router = useRouter();
  const { user } = useAuth();
  const ability = useAbility();
  const instructorId = user?.id || '';

  // Check abilities
  const canCreate = ability.can(Action.Create, Subject.Lesson);
  const canUpdate = ability.can(Action.Update, Subject.Lesson);
  const canDelete = ability.can(Action.Delete, Subject.Lesson);
  const canViewDetails = ability.can(Action.Read, Subject.Lesson);
  
  // Lấy danh sách khóa học của instructor
  const { data: coursesResponse, isLoading: coursesLoading } = useGetAllCourseByInstructorQuery({
    instructorId
  });
  
  const courses = coursesResponse?.data?.result || [];
  
  // Lấy danh sách chapters dựa vào courseId
  const { 
    data: chaptersResponse, 
    isLoading: chaptersLoading 
  } = useGetChaptersByCourseIdQuery({
    courseId: selectedCourseId
  }, {
    skip: !selectedCourseId
  });
  
  const chapters = chaptersResponse?.data?.result || [];
  
  // Lấy danh sách bài học dựa vào chapterId
  const { 
    data: lessonsResponse, 
    isLoading: lessonsLoading, 
    refetch 
  } = useGetLessonsByChapterIdQuery(
    selectedChapterId, 
    { skip: !selectedChapterId }
  );
  
  const lessons = lessonsResponse?.data?.result || [];
    // Lọc lessons theo chapterId nếu đã chọn
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  
  useEffect(() => {
    if (selectedCourseId) {
      // Chapters will be fetched via the useGetChaptersByCourseIdQuery hook
      setSelectedChapterId(''); // Reset chapter selection when course changes
    }
  }, [selectedCourseId]);
  
  const showModal = (lesson?: any) => {
    if (!selectedChapterId) {
      message.error('Vui lòng chọn chương học trước!');
      return;
    }
    
    if (lesson) {
      if (!canUpdate) {
        message.error('Bạn không có quyền chỉnh sửa bài học!');
        return;
      }
      setEditingLesson(lesson);
      setLessonType(lesson.type);
      form.setFieldsValue({
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        initialCode: lesson.initialCode,
        language: lesson.language,
        quizData: lesson.quizData ? JSON.stringify(lesson.quizData, null, 2) : undefined
      });
    } else {
      if (!canCreate) {
        message.error('Bạn không có quyền tạo bài học mới!');
        return;
      }
      setEditingLesson(null);
      setLessonType(4);
      form.resetFields();
      form.setFieldsValue({
        chapterId: selectedChapterId,
        type: 4 // Default to reading lesson
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleSubmit = async (values: LessonFormValues) => {
    try {
      const formData = new FormData();
      
      // Required fields
      formData.append('title', values.title);
      formData.append('chapterId', values.chapterId);
      formData.append('type', values.type.toString());
      
      // Optional fields based on lesson type
      if (values.type === 1 && values.quizData) { // Quiz
        try {
          const parsedQuizData = JSON.parse(values.quizData);
          formData.append('quizData', JSON.stringify(parsedQuizData));
        } catch (error) {
          message.error('Dữ liệu trắc nghiệm không hợp lệ!');
          console.error('JSON parse error:', error);
          return;
        }
      }
      
      if (values.type === 2) { // Video
        if (values.videoUrl) formData.append('videoUrl', values.videoUrl);
        if (values.duration) formData.append('duration', values.duration.toString());
      }
      
      if (values.type === 3) { // Programming
        if (values.initialCode) formData.append('initialCode', values.initialCode);
        if (values.language) formData.append('language', values.language);
      }
      
      if (values.content) {
        formData.append('content', values.content);
      }
      
      if (editingLesson) {
        await updateLesson({ id: editingLesson.id, body: formData }).unwrap();
        message.success('Cập nhật bài học thành công!');
      } else {
        await createLesson({ body: formData }).unwrap();
        message.success('Tạo bài học thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      message.error('Bạn không có quyền xóa bài học!');
      return;
    }

    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa bài học này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteLesson({ id }).unwrap();
          message.success('Xóa bài học thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa bài học!');
          console.error(error);
        }
      },
    });
  };

  const getLessonTypeName = (type: number) => {
    const lessonType = lessonTypes.find(lt => lt.value === type);
    return lessonType ? lessonType.label : 'Không xác định';
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
      render: (type: number) => getLessonTypeName(type)
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
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            disabled={!canUpdate}
          >
            Sửa
          </Button>
          <Button 
            type="default" 
            icon={<FileTextOutlined />}
            onClick={() => router.push(`/instructor/lessons/${record.id}`)}
            disabled={!canViewDetails}
          >
            Chi tiết
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={!canDelete}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedChapterId(''); // Reset chapter selection
  };

  // Handle chapter selection
  const handleChapterChange = (chapterId: string) => {
    setSelectedChapterId(chapterId);
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
              placeholder={`Nhập dữ liệu trắc nghiệm dạng JSON, ví dụ:
{
  "questions": [
    {
      "question": "Câu hỏi 1?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
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
              label="URL Video"
              rules={[{ required: true, message: 'Vui lòng nhập URL video!' }]}
            >
              <Input placeholder="Nhập URL video" />
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
              <TextArea rows={6} placeholder="Nhập nội dung mô tả bằng Markdown" />
            </Form.Item>
          </>
        );
        
      case 3: // Coding exercise
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

  return (
    <div className="instructor-lessons-management">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn khóa học:
          </label>
          <Select
            className="w-full"
            placeholder="Chọn khóa học"
            onChange={handleCourseChange}
            loading={coursesLoading}
          >
            {courses.map((course: any) => (
              <Option key={course.id} value={course.id}>{course.title}</Option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn chương học:
          </label>
          <Select
            className="w-full"
            placeholder="Chọn chương học"
            onChange={handleChapterChange}
            disabled={!selectedCourseId}
            value={selectedChapterId || undefined}
          >
            {chapters.map((chapter: any) => (
              <Option key={chapter.id} value={chapter.id}>{chapter.name}</Option>
            ))}
          </Select>
        </div>
      </div>
      
      {selectedChapterId && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Danh sách bài học</h2>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
              disabled={!canCreate}
            >
              Thêm bài học mới
            </Button>
          </div>
            <Table 
            columns={columns} 
            dataSource={lessons}
            rowKey="id"
            loading={lessonsLoading}
            pagination={false} // Disable default pagination
          />
          
          {lessons.length > pageSize && (
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
        </>
      )}

      <Modal
        title={editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
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
            <Select placeholder="Chọn loại bài học" onChange={handleLessonTypeChange}>
              {lessonTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Render dynamic fields based on lesson type */}
          {renderLessonTypeFields()}
          
          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingLesson ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default withPermission(LessonsManagement, Action.Manage, Subject.Lesson);
