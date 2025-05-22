'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Pagination, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, OrderedListOutlined } from '@ant-design/icons';
import { useGetAllCourseByInstructorQuery } from '@/services/course.service';
import { 
  useGetChaptersByCourseIdQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation
} from '@/services/chapter.service';
import { useAuth } from '@/store/hooks';
import { useRouter } from 'next/navigation';

interface Chapter {
  id: string;
  courseId: string;
  name: string;
  estimatedTime: number;
  order: number;
}

const { Option } = Select;

const ChaptersManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const instructorId = user?.id || '';
  
  // Lấy danh sách khóa học của instructor
  const { data: coursesResponse, isLoading: coursesLoading } = useGetAllCourseByInstructorQuery({
    instructorId
  });
  
  const courses = coursesResponse?.data?.result || [];
  
  // Lấy chapters từ API dựa vào courseId
  const { 
    data: chaptersResponse, 
    isLoading: chaptersLoading, 
    refetch 
  } = useGetChaptersByCourseIdQuery({
    courseId: selectedCourseId
  }, {
    skip: !selectedCourseId
  });
  
  // Extract chapters from response
  const chapters = chaptersResponse?.data?.result || [];
  
  const [createChapter] = useCreateChapterMutation();
  const [updateChapter] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  useEffect(() => {
    if (selectedCourseId) {
      // Chapters will be fetched via the useGetChaptersByCourseIdQuery hook
    }
  }, [selectedCourseId]);
  
  const showModal = (chapter?: any) => {
    if (!selectedCourseId) {
      message.error('Vui lòng chọn khóa học trước!');
      return;
    }
    
    if (chapter) {
      setEditingChapter(chapter);
      form.setFieldsValue({
        name: chapter.name,
        estimatedTime: chapter.estimatedTime,
        order: chapter.order
      });
    } else {
      setEditingChapter(null);
      form.resetFields();
      form.setFieldsValue({
        courseId: selectedCourseId,
        order: chapters.length + 1
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleSubmit = async (values: any) => {
    try {
      if (editingChapter) {
        await updateChapter({ 
          id: editingChapter.id, 
          body: { ...values, courseId: selectedCourseId } 
        }).unwrap();
        message.success('Cập nhật chương học thành công!');
      } else {
        await createChapter({ 
          body: { ...values, courseId: selectedCourseId } 
        }).unwrap();
        message.success('Tạo chương học thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa chương học này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteChapter({ id }).unwrap();
          message.success('Xóa chương học thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa chương học!');
          console.error(error);
        }
      },
    });
  };

  const handleManageLessons = (chapterId: string, chapterName: string) => {
    router.push(`/instructor/chapters/${chapterId}/lessons`);
    // Hoặc có thể lưu thông tin vào state để hiển thị trong tab bài học
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Tên chương',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
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
          >
            Sửa
          </Button>
          <Button 
            type="default" 
            icon={<OrderedListOutlined />}
            onClick={() => handleManageLessons(record.id, record.name)}
          >
            Quản lý bài học
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

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  return (
    <div className="instructor-chapters-management">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn khóa học:
        </label>
        <Select
          className="w-full md:w-1/3"
          placeholder="Chọn khóa học để quản lý chương"
          onChange={handleCourseChange}
          loading={coursesLoading}
        >
          {courses.map((course: any) => (
            <Option key={course.id} value={course.id}>{course.title}</Option>
          ))}
        </Select>
      </div>
      
      {selectedCourseId && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Danh sách chương học</h2>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
            >
              Thêm chương mới
            </Button>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={chapters}
            rowKey="id"
            loading={loading}
            pagination={false} // Disable default pagination
          />
          
          {chapters.length > pageSize && (
            <div className="mt-4 flex justify-end">
              <Pagination 
                current={currentPage}
                pageSize={pageSize}
                total={chapters.length}
                showSizeChanger
                onChange={handlePageChange}
                showTotal={(total) => `Tổng cộng ${total} chương học`}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title={editingChapter ? 'Chỉnh sửa chương học' : 'Thêm chương học mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên chương"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương!' }]}
          >
            <Input placeholder="Nhập tên chương học" />
          </Form.Item>
          
          <Form.Item
            name="estimatedTime"
            label="Thời lượng (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Nhập thời lượng (phút)" />
          </Form.Item>
          
          <Form.Item
            name="order"
            label="Thứ tự"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Nhập thứ tự" />
          </Form.Item>
          
          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingChapter ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChaptersManagement;
