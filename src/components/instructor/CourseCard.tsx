'use client';

import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    price: number;
    level: number;
    status?: number; // 0: Draft, 1: Pending, 2: Approved, 3: Rejected
    categoryName?: string;
    duration?: number;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/instructor/courses/${course.id}`);
  };
  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Không xác định';
    }
  };  const getStatusInfo = (status?: number) => {
    switch (status) {
      case 0: return { text: 'Nháp', color: 'default' }; // Gray
      case 1: return { text: 'Chờ xét duyệt', color: 'warning' }; // Yellow
      case 2: return { text: 'Đã phê duyệt', color: 'success' }; // Green
      case 3: return { text: 'Bị từ chối', color: 'error' }; // Red
      default: return { text: 'Nháp', color: 'default' }; // Default to Draft
    }
  };

  return (
    <Card 
      hoverable 
      className="h-full flex flex-col course-card shadow-md"
      cover={
        <div className="h-40 overflow-hidden">
          <img 
            alt={course.title} 
            src={course.imageUrl || "/images/course-placeholder.jpg"} 
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Khoá+học"; 
            }}
          />
        </div>
      }
      onClick={handleClick}
    >      <div className="flex-1">
        <Title level={4} className="mb-2 line-clamp-2" style={{ height: '48px' }}>
          {course.title}
        </Title>
        <div className="flex justify-between items-center">
          <Text type="secondary">
            {course.categoryName || "Chưa phân loại"}
          </Text>
          <Text type="secondary">
            {getLevelText(course.level)}
          </Text>
        </div>        <div className="mt-2">
          <Tag color={getStatusInfo(course.status).color}>
            {getStatusInfo(course.status).text}
          </Tag>
        </div>
        <div className="mt-4 text-right">
          <Text strong>
            {new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
