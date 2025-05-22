'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, InputNumber, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  useGetCourseByIdQuery
} from '@/services/course.service';
import {
  useCreateChapterMutation
} from '@/services/chapter.service';
import { useAuth } from '@/store/hooks';

export default function AddChapterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const courseId = params.id;
  const [form] = Form.useForm();
  const { user } = useAuth();
    // Fetch course details to ensure it exists
  const { data: courseResponse, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const course = courseResponse?.data;
  
  // Create chapter mutation
  const [createChapter, { isLoading: isCreating }] = useCreateChapterMutation();
  
  // Note: Instructor role check removed for testing purposes
  
  useEffect(() => {
    // Redirect if not authenticated (instructor role check removed)
    if (!user && !courseLoading) {
      router.push('/login');
    }
  }, [user, courseLoading, router]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      await createChapter({ 
        body: {
          ...values,
          courseId: courseId
        }
      }).unwrap();
      message.success('Thêm chương học thành công!');
      router.push(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Failed to create chapter:', error);
      message.error('Có lỗi xảy ra khi thêm chương học');
    }
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
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push(`/instructor/courses/${courseId}`)}
          className="mb-4"
        >
          Quay lại khóa học
        </Button>
        
        <Card title={`Thêm chương học mới cho: ${course.title}`} className="shadow-md">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên chương học"
              rules={[{ required: true, message: 'Vui lòng nhập tên chương học!' }]}
            >
              <Input placeholder="Nhập tên chương học" />
            </Form.Item>
            
            <Form.Item
              name="estimatedTime"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
            >
              <InputNumber className="w-full" placeholder="Nhập thời lượng ước tính" />
            </Form.Item>
            
            <Form.Item
              name="order"
              label="Thứ tự"
              rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
              initialValue={1}
            >
              <InputNumber className="w-full" placeholder="Nhập thứ tự hiển thị" />
            </Form.Item>
            
            <Form.Item className="mt-6">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={isCreating}>
                  Thêm chương học
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
