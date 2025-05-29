'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, InputNumber, Button, Upload, message, Card, Spin, Typography } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useGetCourseByIdQuery, useUpdateCourseMutation } from '@/services/course.service';
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { useAuth } from '@/store/hooks';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface CourseEditProps {
  params: {
    id: string
  }
}

interface CourseFormValues {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  duration: number;
  level: number;
}

interface Category {
  id: string;
  name: string;
}

export default function CourseEditPage({ params }: CourseEditProps) {
  const router = useRouter();
  const courseId = params.id;
  const { user } = useAuth();
  const [form] = Form.useForm();
  
  // State for file uploads
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [qrFileList, setQrFileList] = useState<UploadFile[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [paymentQrFile, setPaymentQrFile] = useState<File | null>(null);
    // Fetch course details
  const { data: courseResponse, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const course = courseResponse?.data;
    // Fetch categories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data?.result || [];
  
  // Update course mutation
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  
  useEffect(() => {
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
      });
      
      // Set existing images if available
      if (course.imageUrl) {
        setImageFileList([
          {
            uid: '-1',
            name: 'Current Image',
            status: 'done',
            url: course.imageUrl,
          } as UploadFile
        ]);
      }
      if (course.paymentQrUrl) {
        setQrFileList([
          {
            uid: '-1',
            name: 'Current QR',
            status: 'done',
            url: course.paymentQrUrl,
          } as UploadFile
        ]);
      }
    }
  }, [course, form]);
  
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('instructorId', user?.id || '');
      formData.append('categoryId', values.categoryId);
      formData.append('price', values.price?.toString() || '0');
      formData.append('duration', values.duration?.toString() || '0');
      formData.append('level', values.level?.toString() || '1');
      
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      if (paymentQrFile) {
        formData.append('paymentQrFile', paymentQrFile);
      }
      
      await updateCourse({ id: courseId, body: formData }).unwrap();
      message.success('Cập nhật khóa học thành công!');
      router.push(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Failed to update course:', error);
      message.error('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };
  
  const handleImageUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setImageFileList(newFileList);

    if (info.file.status === 'done') {
      setImageFile(info.file.originFileObj);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };
  
  const handleQrUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setQrFileList(newFileList);

    if (info.file.status === 'done') {
      setPaymentQrFile(info.file.originFileObj);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };
  
  // Prevent actual upload in Upload component
  const customUploadRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess();
    }, 0);
  };
  
  if (courseLoading || categoriesLoading) {
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
                <Select placeholder="Chọn danh mục" loading={categoriesLoading}>
                  {categories.map((category: any) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="price"
                label="Giá (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
              >                <InputNumber
                  className="w-full"
                  placeholder="Nhập giá khóa học"                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined): 0 | number => {
                    if (!value) return 0;
                    const parsed = Number(value.replace(/\$\s?|(,*)/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                />
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
                <InputNumber className="w-full" placeholder="Nhập thời lượng" min={0} />
              </Form.Item>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Ảnh bìa khóa học"
              >
                <Upload
                  name="imageFile"
                  accept="image/*"
                  listType="picture"
                  fileList={imageFileList}
                  maxCount={1}
                  customRequest={customUploadRequest}
                  onChange={handleImageUpload}
                  beforeUpload={(file) => {
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
                  <Button icon={<UploadOutlined />}>Tải lên ảnh bìa</Button>
                </Upload>
                <Text type="secondary" className="block mt-2">
                  Kích thước khuyến nghị: 1280x720 pixels, tối đa 2MB
                </Text>
              </Form.Item>
              
              <Form.Item
                label="Ảnh mã QR thanh toán"
              >
                <Upload
                  name="paymentQrFile"
                  accept="image/*"
                  listType="picture"
                  fileList={qrFileList}
                  maxCount={1}
                  customRequest={customUploadRequest}
                  onChange={handleQrUpload}
                  beforeUpload={(file) => {
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
                  <Button icon={<UploadOutlined />}>Tải lên mã QR</Button>
                </Upload>
                <Text type="secondary" className="block mt-2">
                  Kích thước tối đa: 2MB
                </Text>
              </Form.Item>
            </div>
            
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
