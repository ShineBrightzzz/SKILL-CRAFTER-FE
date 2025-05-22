'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, InputNumber, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  useGetChapterByIdQuery,
  useUpdateChapterMutation
} from '@/services/chapter.service';
import { useAuth } from '@/store/hooks';

export default function EditChapterPage({ params }: { params: { chapterId: string } }) {
  const router = useRouter();
  const chapterId = params.chapterId;
  const [form] = Form.useForm();
  const { user } = useAuth();
  
  // Fetch chapter details
  const { data: chapterResponse, isLoading: chapterLoading } = useGetChapterByIdQuery(chapterId);
  const chapter = chapterResponse?.data;
  
  // Update chapter mutation
  const [updateChapter, { isLoading: isUpdating }] = useUpdateChapterMutation();
  
  // Initialize form with chapter data
  useEffect(() => {
    if (chapter) {
      form.setFieldsValue({
        name: chapter.name,
        estimatedTime: chapter.estimatedTime,
        order: chapter.order
      });
    }
  }, [chapter, form]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      await updateChapter({ 
        id: chapterId,
        body: {
          ...values,
          courseId: chapter?.courseId
        }
      }).unwrap();
      message.success('Cập nhật chương học thành công!');
      router.push(`/instructor/courses/${chapter?.courseId}`);
    } catch (error) {
      console.error('Failed to update chapter:', error);
      message.error('Có lỗi xảy ra khi cập nhật chương học');
    }
  };
  
  if (chapterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2">Đang tải thông tin chương học...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy chương học</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push(`/instructor/courses/${chapter.courseId}`)}
          className="mb-4"
        >
          Quay lại khóa học
        </Button>
        
        <Card title="Chỉnh sửa chương học" className="shadow-md">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmit}
            initialValues={{
              name: chapter.name,
              estimatedTime: chapter.estimatedTime,
              order: chapter.order
            }}
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
            >
              <InputNumber className="w-full" placeholder="Nhập thứ tự hiển thị" />
            </Form.Item>
            
            <Form.Item className="mt-6">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  Cập nhật
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
