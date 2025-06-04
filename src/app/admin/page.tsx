'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Table, Space } from 'antd';
import { 
  BookOutlined, 
  UserOutlined,
  UserSwitchOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGetAllCoursesQuery } from '@/services/course.service';
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { useGetAllPaymentsQuery } from '@/services/payment.service';
import type { Payment } from '@/types/payment';
import type { Course } from '@/types/course';
import type { Category } from '@/types/category';

const { Title } = Typography;

const AdminPage = () => {
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);

  // Fetch data using RTK Query
  const { data: coursesResponse } = useGetAllCoursesQuery({});
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const { data: paymentsResponse } = useGetAllPaymentsQuery();

  const courses = coursesResponse?.data?.result || [];
  const payments = paymentsResponse?.data?.result || [];
  const categories = categoriesResponse?.data?.result || [];

  // Calculate statistics
  useEffect(() => {
    if (payments.length > 0) {
      // Calculate total revenue
      const total = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      setTotalRevenue(total);

      // Calculate revenue change (compare with last month)
      const currentMonth = new Date().getMonth();
      const currentMonthRevenue = payments
        .filter((p) => p.status === 'completed' && new Date(p.createdAt).getMonth() === currentMonth)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const lastMonthRevenue = payments
        .filter((p) => p.status === 'completed' && new Date(p.createdAt).getMonth() === currentMonth - 1)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const change = lastMonthRevenue ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      setRevenueChange(change);
    }
  }, [payments]);

  // Recent courses table columns
  const recentCoursesColumns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: Course) => record.category?.name
    },
    {
      title: 'Học viên',
      dataIndex: 'enrollmentsCount',
      key: 'enrollmentsCount',
      render: (_: any, record: Course) => record.enrollments?.length || 0
    }
  ];

  // Recent transactions table columns
  const recentTransactionsColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (user: { username: string }) => user?.username
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course: { title: string }) => course?.title
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')}đ`
    }
  ];

  return (
    <div className="dashboard-content">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/courses')}>
            <Statistic 
              title="Khóa học" 
              value={courses.length} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/categories')}>
            <Statistic 
              title="Danh mục" 
              value={categories.length} 
              prefix={<AppstoreOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/payments')}>
            <Statistic 
              title="Doanh thu" 
              value={totalRevenue}
              prefix={<DollarOutlined />}
              suffix="đ"
              precision={0}
            />
            <div className="mt-2">
              <span className={revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>          <Card title="Khóa học gần đây">
            <Table 
              columns={recentCoursesColumns}
              dataSource={courses.slice(0, 5) as any}
              pagination={false}
              rowKey="id"
            />
            <div className="mt-4">
              <Button type="link" onClick={() => router.push('/admin/courses')}>
                Xem tất cả
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>          <Card title="Giao dịch gần đây">
            <Table 
              columns={recentTransactionsColumns}
              dataSource={payments.slice(0, 5) as any}
              pagination={false}
              rowKey="id"
            />
            <div className="mt-4">
              <Button type="link" onClick={() => router.push('/admin/payments')}>
                Xem tất cả
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPage;
