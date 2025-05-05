'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Badge, List, Button, Space } from 'antd';
import dynamic from 'next/dynamic';
import Sidebar from '@/layouts/sidebar';
import {
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  CalendarOutlined,
  FireOutlined,
  ApartmentOutlined,
  UserOutlined,
  LineChartOutlined,
  CarryOutOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMediaQuery } from 'react-responsive';

const Column = dynamic(() => import('@ant-design/plots').then(mod => mod.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/plots').then(mod => mod.Pie), { ssr: false });
const Area = dynamic(() => import('@ant-design/plots').then(mod => mod.Area), { ssr: false });

const { Title, Text, Paragraph } = Typography;

interface EventItem {
  name: string;
  organizer: string;
  month: string;
  registrations: number;
  icon: string;
}

interface ScoreItem {
  range: string;
  count: number;
  type: string;
}

export default function Home() {
  const totalStudents = 1200;
  const [animateCharts, setAnimateCharts] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    const animateTimeout = setTimeout(() => setAnimateCharts(true), 300);
    return () => clearTimeout(animateTimeout);
  }, []);

  const topEvents: EventItem[] = [
    { name: 'Chào đón tân sinh viên 2024', organizer: 'Đoàn Thanh niên', month: 'Tháng 9', registrations: 300, icon: '🎉' },
    { name: 'Hội thảo Kỹ năng mềm', organizer: 'CLB Kỹ năng', month: 'Tháng 10', registrations: 250, icon: '💼' },
    { name: 'Giải bóng đá sinh viên', organizer: 'CLB Thể thao', month: 'Tháng 11', registrations: 200, icon: '⚽' },
    { name: 'Cuộc thi Lập trình', organizer: 'Khoa CNTT', month: 'Tháng 3', registrations: 180, icon: '💻' },
    { name: 'Ngày hội việc làm', organizer: 'Trung tâm QHDN', month: 'Tháng 5', registrations: 150, icon: '🏢' },
  ];

  const scoreDistribution: ScoreItem[] = [
    { range: '0-20', count: 50, type: 'Điểm rèn luyện' },
    { range: '21-40', count: 100, type: 'Điểm rèn luyện' },
    { range: '41-60', count: 300, type: 'Điểm rèn luyện' },
    { range: '61-80', count: 500, type: 'Điểm rèn luyện' },
    { range: '81-100', count: 250, type: 'Điểm rèn luyện' },
  ];

  const eventColumns: ColumnsType<EventItem> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ fontSize: '20px' }}>{record.icon}</span>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizer',
      key: 'organizer',
      render: (text: string) => (
        <Space>
          <ApartmentOutlined style={{ color: '#1890ff' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Tháng tổ chức',
      dataIndex: 'month',
      key: 'month',
      render: (text: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#faad14' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng đăng ký',
      dataIndex: 'registrations',
      key: 'registrations',
      render: (value: number) => (
        <Badge 
          count={value} 
          showZero 
          overflowCount={999} 
          style={{ 
            backgroundColor: '#1668dc', 
            fontWeight: 'bold',
            padding: '0 10px',
            borderRadius: '12px',
            fontSize: '14px'
          }} 
        />
      ),
    },
  ];

  const scoreColumns: ColumnsType<ScoreItem> = [
    {
      title: 'Khoảng điểm',
      dataIndex: 'range',
      key: 'range',
      render: (text: string) => (
        <Space>
          <LineChartOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng sinh viên',
      dataIndex: 'count',
      key: 'count',
      render: (value: number) => (
        <Badge 
          count={value} 
          showZero 
          overflowCount={999} 
          style={{ 
            backgroundColor: '#52c41a', 
            fontWeight: 'bold',
            padding: '0 10px',
            borderRadius: '12px',
            fontSize: '14px'
          }} 
        />
      ),
    },
  ];

  return (
    <Sidebar>
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Title level={3} style={{ textAlign: isMobile ? 'center' : 'left' }}>Trang tổng quan</Title>

        <Card title="Sự kiện nổi bật" style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Table 
            columns={eventColumns} 
            dataSource={topEvents} 
            rowKey="name" 
            pagination={false} 
            scroll={isMobile ? { x: true } : undefined} 
          />
        </Card>

        <Card title="Phân bố điểm rèn luyện">
          <Table 
            columns={scoreColumns} 
            dataSource={scoreDistribution} 
            rowKey="range" 
            pagination={false} 
            scroll={isMobile ? { x: true } : undefined} 
          />
        </Card>
      </div>
    </Sidebar>
  );
}
