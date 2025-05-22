'use client';

import React, { useState } from 'react';
import { 
  Form, Input, Select, InputNumber, Button, 
  Upload, message, Card, Typography, Spin 
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCreateCourseMutation } from '@/services/course.service';
import { useAuth } from '@/store/hooks';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function CreateCoursePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [fileList, setFileList] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  
  const handleSubmit = async (values: any) => {
    try {
      // Add instructor ID to the form data
      const courseData = {
        ...values,
        instructorId: user?.id,
        imageUrl: imageUrl || undefined,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : []
      };
      
      await createCourse({ body: courseData }).unwrap();
      message.success('Tạo khóa học thành công!');
      router.push('/instructor');
    } catch (error) {
      console.error('Failed to create course:', error);
      message.error('Có lỗi xảy ra khi tạo khóa học!');
    }
  };
  
  const handleUploadChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1); // Keep only the latest file
    
    setFileList(fileList);
    
    if (info.file.status === 'done') {
      // Get the image URL from the response
      setImageUrl(info.file.response.url);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };
  
  // Mock function for uploading - in a real app this would connect to your backend
  const customUploadRequest = ({ file, onSuccess }: any) => {
    // This is a mock function - in real app, you'd upload to your server
    setTimeout(() => {
      // Mock response with a placeholder URL
      onSuccess({ url: URL.createObjectURL(file) });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/instructor')}
          className="mb-6"
        >
          Quay lại danh sách khóa học
        </Button>
        
        <Card className="shadow-md">
          <Title level={2} className="mb-6">Tạo khóa học mới</Title>
          
          <Form 
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              level: 1,
              price: 0,
              duration: 0
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
              label="Mô tả khóa học"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học!' }]}
            >
              <TextArea rows={4} placeholder="Nhập mô tả chi tiết về khóa học" />
            </Form.Item>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="1">Lập trình</Option>
                  <Option value="2">Thiết kế</Option>
                  <Option value="3">Kinh doanh</Option>
                  <Option value="4">Marketing</Option>
                  <Option value="5">Ngoại ngữ</Option>
                </Select>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              <Form.Item
                name="price"
                label="Giá (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Nhập giá khóa học"
                  min={0}
                />
              </Form.Item>
              
              <Form.Item
                name="duration"
                label="Thời lượng (giờ)"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
              >
                <InputNumber className="w-full" placeholder="Nhập thời lượng" min={0} />
              </Form.Item>
            </div>
            
            <Form.Item
              name="tags"
              label="Thẻ (cách nhau bởi dấu phẩy)"
            >
              <Input placeholder="Ví dụ: javascript, web, react" />
            </Form.Item>
            
            <Form.Item
              name="imageUrl"
              label="Ảnh bìa khóa học"
            >
              <Upload
                name="image"
                listType="picture"
                fileList={fileList}
                onChange={handleUploadChange}
                customRequest={customUploadRequest}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Tải lên ảnh bìa</Button>
              </Upload>
              <Text type="secondary" className="block mt-2">
                Kích thước khuyến nghị: 1280x720 pixels
              </Text>
            </Form.Item>
            
            <Form.Item className="mt-6">
              <div className="flex justify-end">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={isLoading}
                >
                  Tạo khóa học
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
