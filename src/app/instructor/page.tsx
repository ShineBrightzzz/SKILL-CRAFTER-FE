'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin, Typography, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import { useGetAllCourseByInstructorQuery } from '@/services/course.service';
import CourseCard from '@/components/instructor/CourseCard';

const { Title, Text } = Typography;

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
    // Role check removed for testing
  }, [isAuthenticated, router]);

  // Fetch instructor's courses
  const { data: coursesResponse, isLoading } = useGetAllCourseByInstructorQuery({
    instructorId: user?.id || '',
  }, {
    skip: !user?.id
  });

  const courses = coursesResponse?.data?.result || [];

  const handleAddNewCourse = () => {
    // Navigate to course creation page or show modal
    router.push('/instructor/courses/create');
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}`);
  };
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Đang xác thực...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0">Các khóa học của tôi</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddNewCourse}
          >
            Tạo khóa học mới
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
            <Text className="ml-2">Đang tải danh sách khóa học...</Text>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Empty 
              description="Bạn chưa có khóa học nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddNewCourse}
              className="mt-4"
            >
              Tạo khóa học đầu tiên
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {courses.map((course: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
