'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetAllCoursesQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } from '@/services/course.service';

const CoursesManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: coursesResponse, isLoading, refetch } = useGetAllCoursesQuery({
    page: currentPage,
    pageSize: pageSize
  });

  // Extract courses and pagination metadata from the new API response format
  const courses = coursesResponse?.data?.result || [];
  const paginationMeta = coursesResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
  };
  
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const showModal = (course?: any) => {
    if (course) {
      setEditingCourse(course);
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        // Add other fields as needed
      });
    } else {
      setEditingCourse(null);
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
      if (editingCourse) {
        await updateCourse({ id: editingCourse.id, body: values }).unwrap();
        message.success('Cập nhật khóa học thành công!');
      } else {
        await createCourse({ body: values }).unwrap();
        message.success('Tạo khóa học thành công!');
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
      title: 'Bạn có chắc chắn muốn xóa khóa học này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCourse({ id }).unwrap();
          message.success('Xóa khóa học thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa khóa học!');
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
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Tạo khóa học mới
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={courses}
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
          showTotal={(total) => `Tổng cộng ${total} khóa học`}
        />
      </div>

      <Modal
        title={editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tên khóa học"
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
          >
            <Input placeholder="Nhập tên khóa học" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả khóa học" />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingCourse ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesManagement;
