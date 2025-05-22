'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, InputNumber, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGetCourseByIdQuery, useUpdateCourseMutation } from '@/services/course.service';
import { useAuth } from '@/store/hooks';
import type { UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface CourseEditProps {
  params: {
    id: string
  }
}

export default function CourseEditPage({ params }: CourseEditProps) {
  const router = useRouter();
  const courseId = params.id;
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
    // Fetch course details
  const { data: courseResponse, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const course = courseResponse?.data;
  
  // Update course mutation
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  
  // Note: Instructor role check removed for testing purposes
  
  useEffect(() => {
    // Redirect if not authenticated (instructor role check removed)
    if (!user && !courseLoading) {
      router.push('/login');
    }
  }, [user, courseLoading, router]);
  
  // Initialize form with course data
  useEffect(() => {
    if (course) {
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        price: course.price,
        level: course.level,
        duration: course.duration,
        tags: course.tags?.join(', ') || '',
      });
      setImageUrl(course.imageUrl || null);
    }
  }, [course, form]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // Process tags to array
      const tagsArray = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [];
      
      // Prepare submission data
      const courseData = {
        ...values,
        instructorId: user?.id,
        tags: tagsArray,
        imageUrl // Include the current image URL
      };
      
      await updateCourse({ id: courseId, body: courseData }).unwrap();
      message.success('Cập nhật khóa học thành công!');
      router.push(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Failed to update course:', error);
      message.error('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };
  
  // Handle image upload
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload', // Replace with your API endpoint
    headers: {
      authorization: 'Bearer ' + user?.accessToken,
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        return;
      }
      if (info.file.status === 'done') {
        // Get the image URL from the server response
        const imageUrl = info.file.response?.url;
        if (imageUrl) {
          setImageUrl(imageUrl);
          message.success('Tải ảnh lên thành công!');
        }
      } else if (info.file.status === 'error') {
        message.error('Lỗi khi tải ảnh lên');
      }
    },
  };
  
  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2">Đang tải thông tin khóa học...</p>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy khóa học</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Button onClick={() => router.back()} className="mb-4">
          ← Quay lại
        </Button>
        
        <Card title="Chỉnh sửa khóa học" className="shadow-md">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmit}
            initialValues={{
              title: course.title,
              description: course.description,
              categoryId: course.categoryId,
              price: course.price,
              level: course.level,
              duration: course.duration,
              tags: course.tags?.join(', ') || '',
            }}
          >
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="1">Lập trình web</Option>
                  <Option value="2">Lập trình di động</Option>
                  <Option value="3">Khoa học dữ liệu</Option>
                  <Option value="4">DevOps</Option>
                  <Option value="5">Trí tuệ nhân tạo</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="price"
                label="Giá (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
              >
                <InputNumber className="w-full" placeholder="Nhập giá khóa học" />
              </Form.Item>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <Form.Item
                name="duration"
                label="Thời lượng (giờ)"
              >
                <InputNumber className="w-full" placeholder="Nhập thời lượng" />
              </Form.Item>
            </div>
            
            <Form.Item
              name="tags"
              label="Thẻ (phân tách bằng dấu phẩy)"
            >
              <Input placeholder="Ví dụ: javascript, react, web" />
            </Form.Item>
            
            <Form.Item
              label="Hình ảnh khóa học"
              extra="Tải lên hình ảnh đại diện cho khóa học"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="Course thumbnail" className="h-20 object-cover rounded" />
                </div>
              )}
            </Form.Item>
            
            <Form.Item className="mt-6">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  Cập nhật khóa học
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
