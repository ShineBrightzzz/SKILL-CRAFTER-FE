'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Table } from 'antd';
import { 
  BookOutlined, 
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useGetAllCoursesQuery } from '@/services/course.service';
import { useGetAllCategoriesQuery } from '@/services/category.service';
import { useGetAllPaymentsQuery } from '@/services/payment.service';
import { useGetAllAccountsQuery } from '@/services/user.service';
import { useGetLast6MonthsRevenueQuery, useGetLast6MonthsRegistrationsQuery } from '@/services/dashboard.service';
import type { Course } from '@/types/course';
import type { ChartData, ChartDataset } from '@/types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;

const AdminPage = () => {
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [revenueData, setRevenueData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }]
  });
  const [enrollmentData, setEnrollmentData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Số lượng đăng ký',
      data: [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  });

  // Fetch data using RTK Query
  const { data: coursesResponse } = useGetAllCoursesQuery({});
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const { data: paymentsResponse } = useGetAllPaymentsQuery();
  const { data: usersResponse } = useGetAllAccountsQuery({});
  const { data: revenueResponse } = useGetLast6MonthsRevenueQuery();
  const { data: registrationsResponse } = useGetLast6MonthsRegistrationsQuery();

  const courses = coursesResponse?.data?.result || [];
  const categories = categoriesResponse?.data?.result || [];
  const payments = paymentsResponse?.data?.result || [];
  const users = usersResponse?.data?.result || [];
  const monthlyRevenue = revenueResponse?.data || {};
  const monthlyRegistrations = registrationsResponse?.data || {};

  // Chart configuration
  const defaultDataset: Record<string, ChartDataset> = {
    revenue: {
      label: 'Doanh thu (VNĐ)',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    enrollment: {
      label: 'Số lượng đăng ký',
      data: [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }
  };

  // Sort month strings helper
  const sortMonthStrings = (months: string[]) => {
    return months.sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(Date.parse(`${monthA} 1, ${yearA}`));
      const dateB = new Date(Date.parse(`${monthB} 1, ${yearB}`));
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Format month label for chart
  const formatMonthLabel = (monthString: string) => {
    try {
      const [monthName, year] = monthString.split(' ');
      const date = new Date(Date.parse(`${monthName} 1, 2000`));
      const monthNumber = date.getMonth() + 1;
      return `${monthNumber.toString().padStart(2, '0')}/${year}`;
    } catch (error) {
      console.error('Error formatting month:', error);
      return monthString;
    }
  };

  // Process revenue data
  useEffect(() => {
    if (monthlyRevenue && Object.keys(monthlyRevenue).length > 0) {
      const sortedMonths = sortMonthStrings(Object.keys(monthlyRevenue));
      const formattedLabels = sortedMonths.map(formatMonthLabel);
      const revenues = sortedMonths.map(month => monthlyRevenue[month]);

      // Cập nhật tổng doanh thu
      const total = revenues.reduce((sum, revenue) => sum + revenue, 0);
      setTotalRevenue(total);

      // Tính toán thay đổi doanh thu
      const currentMonthRevenue = revenues[revenues.length - 1] || 0;
      const previousMonthRevenue = revenues[revenues.length - 2] || 0;
      const revenueChangeValue = previousMonthRevenue 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;
      setRevenueChange(revenueChangeValue);

      // Cập nhật dữ liệu biểu đồ
      setRevenueData({
        labels: formattedLabels,
        datasets: [{
          ...defaultDataset.revenue,
          data: revenues
        }]
      });
    }
  }, [monthlyRevenue]);

  // Process registration data
  useEffect(() => {
    if (monthlyRegistrations && Object.keys(monthlyRegistrations).length > 0) {
      const sortedMonths = sortMonthStrings(Object.keys(monthlyRegistrations));
      const formattedLabels = sortedMonths.map(formatMonthLabel);
      const registrations = sortedMonths.map(month => monthlyRegistrations[month]);

      setEnrollmentData({
        labels: formattedLabels,
        datasets: [{
          ...defaultDataset.enrollment,
          data: registrations
        }]
      });
    }
  }, [monthlyRegistrations]);

  // Update total users count
  useEffect(() => {
    setTotalUsers(users.length);
  }, [users]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            if (context.dataset.label.includes('VNĐ')) {
              return `${context.dataset.label}: ${value.toLocaleString('vi-VN')}đ`;
            }
            return `${context.dataset.label}: ${value} lượt`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          callback: function(this: any, value: any) {
            if (this.chart.canvas.id === 'revenue-chart') {
              return value.toLocaleString('vi-VN') + 'đ';
            }
            return value;
          }
        }
      }
    }
  };  // Recent courses table columns
  const recentCoursesColumns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      width: '70%',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (_: any, record: Course) => categories.find(c => c.id === record.categoryId)?.name || 'Unknown',
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
    <div className="dashboard-content p-6">
      <AntTitle level={2} className="mb-6">Tổng quan</AntTitle>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="h-40 flex flex-col justify-center" onClick={() => router.push('/admin/courses')}>
            <Statistic 
              title="Khóa học" 
              value={courses.length} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="h-40 flex flex-col justify-center" onClick={() => router.push('/admin/categories')}>
            <Statistic 
              title="Danh mục" 
              value={categories.length} 
              prefix={<AppstoreOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="h-40 flex flex-col justify-center" onClick={() => router.push('/admin/users')}>
            <Statistic 
              title="Người dùng" 
              value={users.length} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="h-40 flex flex-col" onClick={() => router.push('/admin/payments')}>
            <div className="flex-1 flex flex-col justify-center">
              <Statistic 
                title="Doanh thu" 
                value={totalRevenue}
                prefix={<DollarOutlined />}
                suffix="đ"
                precision={0}
              />
            </div>
            <div className="mt-auto">
              <span className={revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Biểu đồ doanh thu 6 tháng gần nhất">
            <div style={{ height: '400px', position: 'relative' }}>
              <Line 
                data={revenueData}
                options={chartOptions}
                id="revenue-chart"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Số lượng đăng ký theo tháng">
            <div style={{ height: '400px', position: 'relative' }}>
              <Bar 
                data={enrollmentData}
                options={chartOptions}
                id="registration-chart"
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Khóa học gần đây">
            <Table 
              columns={recentCoursesColumns}              dataSource={courses.slice(0, 5) as unknown as readonly Course[]}
              pagination={false}
              rowKey="key"
            />
            <div className="mt-4">
              <Button type="link" onClick={() => router.push('/admin/courses')}>
                Xem tất cả
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Giao dịch gần đây">
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
