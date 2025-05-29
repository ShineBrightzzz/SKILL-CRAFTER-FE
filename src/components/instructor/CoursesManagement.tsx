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
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { useAuth } from '@/store/hooks';
import type { UploadFile, UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const CoursesManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  
  const { user } = useAuth();
  const instructorId = user?.id || '';
  
  // Fetch courses
  const { data: coursesResponse, isLoading, refetch } = useGetAllCourseByInstructorQuery({
    instructorId,
    page: currentPage,
    pageSize: pageSize
  });

  // Fetch categories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data?.result || [];

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
      setImageFileList(course.imageUrl ? [{
        uid: '-1',
        name: 'Current Image',
        status: 'done',
        url: course.imageUrl,
      }] : []);
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
      setImageFileList([]);
      setImageFile(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageFileList([]);
    setImageFile(null);
  };
  const handleSubmit = async (values: any) => {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Required fields
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('instructorId', instructorId);
      formData.append('categoryId', values.categoryId);
      
      // Optional fields with defaults
      formData.append('price', values.price?.toString() || '0');
      formData.append('duration', values.duration?.toString() || '0');
      formData.append('level', values.level?.toString() || '1');
      
      // Process tags
      if (values.tags) {
        const tagsArray = values.tags.split(',').map((tag: string) => tag.trim());
        formData.append('tags', JSON.stringify(tagsArray));
      }

      // Add image file if present
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      
      if (editingCourse) {
        await updateCourse({ id: editingCourse.id, body: formData }).unwrap();
        message.success('Cập nhật khóa học thành công!');
      } else {
        await createCourse(formData).unwrap();
        message.success('Tạo khóa học thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };
  const handleDelete = async (courseId: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa khóa học này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCourse({ courseId }).unwrap();
          message.success('Xóa khóa học thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa khóa học!');
          console.error(error);
        }
      },
    });
  };
  // Custom request function for Upload component
  const customRequest = async ({ file, onSuccess, onError }: any) => {
    if (file instanceof File) {
      setImageFile(file);
      setImageFileList([{
        uid: '-1',
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]);
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError(new Error('Not a valid file'));
    }
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
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
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
            label="Ảnh khóa học"
            required
            extra="Kích thước khuyến nghị: 1280x720 pixels, tối đa 2MB"
          >
            <Upload
              accept="image/*"
              customRequest={customRequest}
              fileList={imageFileList}
              maxCount={1}
              listType="picture-card"
              onRemove={() => {
                setImageFile(null);
                setImageFileList([]);
              }}
              beforeUpload={file => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Bạn chỉ có thể tải lên file ảnh!');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Ảnh phải nhỏ hơn 2MB!');
                }
                return isImage && isLt2M;
              }}
            >
              {imageFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
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
