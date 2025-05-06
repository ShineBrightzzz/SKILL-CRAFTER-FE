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
import { useGetTopRegisteredEventsQuery } from '@/services/events.service';

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

  useEffect(() => {
    const animateTimeout = setTimeout(() => setAnimateCharts(true), 300);
    return () => clearTimeout(animateTimeout);
  }, []);

  const { data: topEventsData, isLoading: isLoadingTopEvents } = useGetTopRegisteredEventsQuery();

  const topEvents: EventItem[] = topEventsData?.data?.map((event: any) => ({
    name: event.title,
    organizer: event.organizingUnit,
    month: new Date(event.startTime).toLocaleString('vi-VN', { month: 'long' }),
    registrations: event.totalRegisteredStudents,
  })) || [];

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
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Trang tổng quan</Title>

        <Card title="Sự kiện nổi bật" bodyStyle={{ padding: '16px' }}>
          <Table 
            columns={eventColumns} 
            dataSource={topEvents} 
            rowKey="name" 
            pagination={false} 
            scroll={{ x: 600 }} /* Đảm bảo bảng cuộn được trên màn hình nhỏ */
          />
        </Card>

        <Card title="Phân bố điểm rèn luyện" style={{ marginTop: 24 }} bodyStyle={{ padding: '16px' }}>
          <Table 
            columns={scoreColumns} 
            dataSource={scoreDistribution} 
            rowKey="range" 
            pagination={false} 
            scroll={{ x: 600 }} /* Đảm bảo bảng cuộn được trên màn hình nhỏ */
          />
        </Card>
      </div>
    </Sidebar>
  );
}
