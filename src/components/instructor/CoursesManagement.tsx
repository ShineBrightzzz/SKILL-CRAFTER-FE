'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, message, Pagination, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, FileAddOutlined } from '@ant-design/icons';
import { 
  useGetAllCourseByInstructorQuery, 
  useCreateCourseMutation, 
  useUpdateCourseMutation, 
  useDeleteCourseMutation 
} from '@/services/course.service';
import { useAuth } from '@/store/hooks';
import type { UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const CoursesManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { user } = useAuth();
  const instructorId = user?.id || '';
  
  const { data: coursesResponse, isLoading, refetch } = useGetAllCourseByInstructorQuery({
    instructorId,
    page: currentPage,
    pageSize: pageSize
  });

  // Extract courses and pagination metadata from the response
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
        categoryId: course.categoryId,
        price: course.price,
        level: course.level,
        duration: course.duration,
        tags: course.tags?.join(', ') || '',
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
      // Process tags to array
      const tagsArray = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [];
      
      // Prepare submission data
      const courseData = {
        ...values,
        instructorId,
        tags: tagsArray
      };
      
      if (editingCourse) {
        await updateCourse({ id: editingCourse.id, body: courseData }).unwrap();
        message.success('Cập nhật khóa học thành công!');
      } else {
        await createCourse({ body: courseData }).unwrap();
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

  // Upload props for course image
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload', // Replace with your API endpoint
    headers: {
      authorization: 'Bearer ' + user?.accessToken,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
        // Update form with the uploaded image URL
        form.setFieldsValue({
          imageUrl: info.file.response.url
        });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
  };

  const columns = [
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
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => {
        switch (level) {
          case 1: return 'Cơ bản';
          case 2: return 'Trung cấp';
          case 3: return 'Nâng cao';
          default: return 'Không xác định';
        }
      }
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0)
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
            icon={<FileAddOutlined />}
            onClick={() => window.location.href = `/instructor/courses/${record.id}/chapters`}
          >
            Quản lý chương
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
    <div className="instructor-courses-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Khóa học của tôi</h2>
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
      
      {/* Custom pagination */}
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
        width={700}
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
            rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả khóa học" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="frontend">Frontend</Option>
              <Option value="backend">Backend</Option>
              <Option value="mobile">Mobile</Option>
              <Option value="devops">DevOps</Option>
            </Select>
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Giá khóa học (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
            >
              <InputNumber 
                className="w-full" 
                placeholder="Nhập giá" 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            
            <Form.Item
              name="level"
              label="Cấp độ"
              rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
            >
              <Select placeholder="Chọn cấp độ">
                <Option value={1}>Cơ bản</Option>
                <Option value={2}>Trung cấp</Option>
                <Option value={3}>Nâng cao</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Thời lượng (giờ)"
            >
              <InputNumber className="w-full" placeholder="Nhập thời lượng" />
            </Form.Item>
            
            <Form.Item
              name="tags"
              label="Thẻ (phân tách bằng dấu phẩy)"
            >
              <Input placeholder="Ví dụ: javascript, react, web" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="imageUrl"
            label="Ảnh khóa học"
          >
            <Input placeholder="URL ảnh" />
          </Form.Item>
          
          <Form.Item label="Tải lên ảnh mới">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
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
