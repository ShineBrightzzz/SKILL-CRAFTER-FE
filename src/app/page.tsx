'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Badge, List, Button, Space, Statistic, Divider, Tooltip, Progress, Avatar, Tag } from 'antd';
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
  BulbOutlined,
  FundProjectionScreenOutlined,
  GroupOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined
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
  icon?: string;
  key?: string;
}

interface ScoreItem {
  range: string;
  count: number;
  type: string;
  key?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
  increase?: number;
}

const StatCard = ({ title, value, icon, color, prefix, suffix, increase }: StatCardProps) => (
  <Card 
    hoverable 
    bodyStyle={{ padding: '20px', height: '100%' }}
    style={{ height: '100%' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <Text type="secondary" style={{ fontSize: '14px' }}>{title}</Text>
        <Statistic 
          value={value} 
          valueStyle={{ color, fontWeight: 'bold' }} 
          prefix={prefix}
          suffix={suffix}
        />
        {increase !== undefined && (
          <div style={{ marginTop: '8px' }}>
            <Text style={{ color: increase >= 0 ? '#52c41a' : '#f5222d' }}>
              <ArrowUpOutlined rotate={increase >= 0 ? 0 : 180} /> {Math.abs(increase)}%
            </Text>
            <Text type="secondary" style={{ marginLeft: '8px' }}>từ tháng trước</Text>
          </div>
        )}
      </div>
      <div style={{ 
        backgroundColor: `${color}22`, 
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '24px', color }}>{icon}</span>
      </div>
    </div>
  </Card>
);

export default function Home() {
  const totalStudents = 1200;
  const activeStudents = 950;
  const totalEvents = 48;
  const averageScore = 75;
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    const animateTimeout = setTimeout(() => setAnimateCharts(true), 300);
    return () => clearTimeout(animateTimeout);
  }, []);

  const { data: topEventsData, isLoading: isLoadingTopEvents } = useGetTopRegisteredEventsQuery();

  const topEvents: EventItem[] = topEventsData?.data?.map((event: any, index: number) => ({
    key: `event-${index}`,
    name: event.title,
    organizer: event.organizingUnit,
    month: new Date(event.startTime).toLocaleString('vi-VN', { month: 'long' }),
    registrations: event.totalRegisteredStudents,
  })) || [];
  
  // Sample data when API returns empty
  const sampleEvents: EventItem[] = [
    { key: '1', name: 'Hội thảo công nghệ', organizer: 'Khoa CNTT', month: 'Tháng 5', registrations: 245 },
    { key: '2', name: 'Workshop kỹ năng mềm', organizer: 'Đoàn trường', month: 'Tháng 6', registrations: 189 },
    { key: '3', name: 'Cuộc thi Hackathon', organizer: 'CLB IT', month: 'Tháng 7', registrations: 156 },
    { key: '4', name: 'Ngày hội việc làm', organizer: 'Phòng CTSV', month: 'Tháng 8', registrations: 320 },
  ];

  const eventsToDisplay = topEvents.length > 0 ? topEvents : sampleEvents;

  const scoreDistribution: ScoreItem[] = [
    { key: '1', range: '0-20', count: 50, type: 'Điểm rèn luyện' },
    { key: '2', range: '21-40', count: 100, type: 'Điểm rèn luyện' },
    { key: '3', range: '41-60', count: 300, type: 'Điểm rèn luyện' },
    { key: '4', range: '61-80', count: 500, type: 'Điểm rèn luyện' },
    { key: '5', range: '81-100', count: 250, type: 'Điểm rèn luyện' },
  ];

  const eventColumns: ColumnsType<EventItem> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
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
    {
      title: 'Tỉ lệ',
      dataIndex: 'count',
      key: 'percent',
      render: (value: number) => (
        <Progress 
          percent={Math.round((value / totalStudents) * 100)} 
          size="small" 
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      ),
    },
  ];

  const pieConfig = {
    appendPadding: 10,
    data: scoreDistribution,
    angleField: 'count',
    colorField: 'range',
    radius: 0.8,
    legend: { position: 'bottom' as const },
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    animation: animateCharts,
  };

  const columnConfig = {
    data: scoreDistribution,
    xField: 'range',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    animation: animateCharts,
    color: ({ range }: { range: string }) => {
      if (range === '0-20') return '#ff4d4f';
      if (range === '21-40') return '#faad14';
      if (range === '41-60') return '#1890ff';
      if (range === '61-80') return '#52c41a';
      return '#722ed1';
    },
  };

  const activeStudentsByMonth = [
    { month: 'T1', students: 780 },
    { month: 'T2', students: 800 },
    { month: 'T3', students: 820 },
    { month: 'T4', students: 840 },
    { month: 'T5', students: 880 },
    { month: 'T6', students: 910 },
    { month: 'T7', students: 930 },
    { month: 'T8', students: 950 },
  ];

  const areaConfig = {
    data: activeStudentsByMonth,
    xField: 'month',
    yField: 'students',
    animation: animateCharts,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
  };

  return (
    <Sidebar>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Card bordered={false}>
              <Title level={3} style={{ margin: 0 }}>
                <FundProjectionScreenOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                Trang tổng quan
              </Title>
              <Text type="secondary">Dữ liệu cập nhật đến ngày {new Date().toLocaleDateString('vi-VN')}</Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Tổng số sinh viên" 
              value={totalStudents} 
              icon={<TeamOutlined />} 
              color="#1890ff"
              increase={3}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Sinh viên tham gia hoạt động" 
              value={activeStudents} 
              icon={<UserOutlined />} 
              color="#52c41a"
              suffix={` (${Math.round((activeStudents/totalStudents)*100)}%)`}
              increase={5}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Sự kiện đã tổ chức" 
              value={totalEvents} 
              icon={<CalendarOutlined />} 
              color="#722ed1"
              increase={12}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Điểm rèn luyện trung bình" 
              value={averageScore} 
              icon={<TrophyOutlined />} 
              color="#fa8c16"
              increase={-2}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <span>Sự kiện nổi bật</span>
                </Space>
              } 
              bordered={false}
              extra={<Button type="link">Xem tất cả</Button>}
            >
              <Table 
                columns={eventColumns} 
                dataSource={eventsToDisplay} 
                rowKey="key" 
                pagination={false} 
                loading={isLoadingTopEvents}
                scroll={{ x: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span>Sinh viên hoạt động</span>
                </Space>
              }
              bordered={false}
            >
              <div style={{ height: 250 }}>
                {animateCharts && <Area {...areaConfig} />}
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="Tăng trưởng" 
                    value={21.8} 
                    precision={1} 
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ArrowUpOutlined />}
                    suffix="%"
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Hoạt động gần đây" 
                    value={24} 
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ClockCircleOutlined />}
                    suffix="h"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <LineChartOutlined style={{ color: '#1890ff' }} />
                  <span>Phân bố điểm rèn luyện</span>
                </Space>
              }
              bordered={false}
            >
              <div style={{ height: 300 }}>
                {animateCharts && <Column {...columnConfig} />}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BulbOutlined style={{ color: '#faad14' }} />
                  <span>Tỉ lệ điểm rèn luyện</span>
                </Space>
              }
              bordered={false}
            >
              <div style={{ height: 300 }}>
                {animateCharts && <Pie {...pieConfig} />}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <GroupOutlined style={{ color: '#722ed1' }} />
                  <span>Chi tiết phân bố điểm</span>
                </Space>
              }
              bordered={false}
            >
              <Table 
                columns={scoreColumns} 
                dataSource={scoreDistribution} 
                rowKey="key" 
                pagination={false} 
                scroll={{ x: 600 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Sidebar>
  );
}
