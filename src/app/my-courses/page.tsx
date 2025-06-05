'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/hooks';
import { useGetEnrollmentsByUserIdQuery } from '@/services/course.service';
import { Card, Col, Row, Spin, Empty, Progress } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { skipToken } from '@reduxjs/toolkit/query/react';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;
  const { data: enrollmentsResponse, isLoading } = useGetEnrollmentsByUserIdQuery(
    user?.id ? {
      userId: user.id,
      page: currentPage,
      size: PAGE_SIZE
    } : skipToken
  );

  const enrollments = enrollmentsResponse?.data?.result || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Empty description="Vui lòng đăng nhập để xem khóa học của bạn" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Khóa học của tôi</h1>
        <Empty description="Bạn chưa đăng ký khóa học nào" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Khóa học của tôi</h1>
      <Row gutter={[16, 16]}>
        {enrollments.map((enrollment: any) => (
          <Col xs={24} sm={12} md={8} lg={6} key={enrollment.id}>
            <Link href={`/learning/${enrollment.courseId}`}>              
            <Card
                hoverable
                cover={
                  enrollment?.imageUrl ? (
                    <Image
                      src={enrollment.imageUrl}
                      alt={enrollment.courseName}
                      width={300}
                      height={200}
                      className="object-cover h-48"
                    />
                  ) : (
                    <div className="bg-gray-200 h-48 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )
                }
                className="h-full"
              >
                <Card.Meta
                  title={enrollment.courseName}
                  description={
                    <div className="space-y-2">
                      <Progress
                        percent={Math.round(enrollment.progressPercentage || 0)}
                        size="small"
                        status={enrollment.completedAt ? "success" : "active"}
                      />
                      <p className="text-sm text-gray-500">
                        Hoàn thành: {Math.round(enrollment.progressPercentage || 0)}%
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>Ngày đăng ký: {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}</p>
                        {enrollment.lastAccessedAt && (
                          <p>Truy cập cuối: {new Date(enrollment.lastAccessedAt).toLocaleString('vi-VN')}</p>
                        )}
                        {enrollment.completedAt && (
                          <p className="text-green-600">
                            Hoàn thành: {new Date(enrollment.completedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
