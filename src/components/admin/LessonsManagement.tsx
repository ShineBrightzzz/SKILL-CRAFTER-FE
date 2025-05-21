'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetAllLessonsQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation } from '@/services/lesson.service';
import { useGetAllCoursesQuery } from '@/services/course.service';

const LessonsManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: lessonsResponse, isLoading, refetch } = useGetAllLessonsQuery({
    page: currentPage,
    pageSize: pageSize
  });
  
  const { data: coursesResponse } = useGetAllCoursesQuery({});
  
  // Extract data from the new API response format
  const lessons = lessonsResponse?.data?.result || [];
  const paginationMeta = lessonsResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
  };
  
  const courses = coursesResponse?.data?.result || [];
  
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const showModal = (lesson?: any) => {
    if (lesson) {
      setEditingLesson(lesson);
      form.setFieldsValue({
        title: lesson.title,
        content: lesson.content,
        courseId: lesson.courseId,
        // Add other fields as needed
      });
    } else {
      setEditingLesson(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingLesson) {
        await updateLesson({ id: editingLesson.id, body: values }).unwrap();
        message.success('Cập nhật bài học thành công!');
      } else {
        await createLesson({ body: values }).unwrap();
        message.success('Tạo bài học thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Tên bài học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (courseId: string) => {
        const course = courses.find((c: any) => c.id === courseId);
        return course?.title || courseId;
      }
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
  
  // Set up responsive columns
  const getResponsiveColumns = () => {
    // Get current window width
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Base columns that always show
    let responsiveColumns = [...columns];
    
    // If on mobile, remove less important columns
    if (isMobile) {
      responsiveColumns = responsiveColumns.filter(col => 
        col.key !== 'id' && col.key !== 'description'
      );
    }
    
    return responsiveColumns;
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài học</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Tạo bài học mới
        </Button>
      </div>
      
      <Table 
        columns={typeof window !== 'undefined' ? getResponsiveColumns() : columns} 
        dataSource={lessons}
        rowKey="id"
        loading={isLoading}
        pagination={false} // Disable default pagination
      />
      
      {/* Custom pagination using Ant Design Pagination component */}
      <div className="mt-4 flex justify-end">
        <Pagination 
          current={currentPage}
          pageSize={pageSize}
          total={paginationMeta.total}
          showSizeChanger
          onChange={handlePageChange}
          showTotal={(total) => `Tổng cộng ${total} bài học`}
        />
      </div>

      <Modal
        title={editingLesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
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
            name="courseId"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course: any) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung bài học" />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingLesson ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonsManagement;
