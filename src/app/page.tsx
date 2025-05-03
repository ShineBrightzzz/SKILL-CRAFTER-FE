'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Statistic, Divider, Badge, List, Tooltip, Button, Space, Avatar } from 'antd';
import { Column, Pie, Area } from '@ant-design/plots';
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
import Image from 'next/image';

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  // Mock data for demonstration
  const totalStudents = 1200;
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [animateCharts, setAnimateCharts] = useState(false);

  // Simulate data loading and trigger animations
  useEffect(() => {
    // Only animate charts for visual appeal
    const animateTimeout = setTimeout(() => {
      setAnimateCharts(true);
    }, 300);

    return () => {
      clearTimeout(animateTimeout);
    };
  }, []);

  const topEvents = [
    { name: 'Chào đón tân sinh viên 2024', organizer: 'Đoàn Thanh niên', month: 'Tháng 9', registrations: 300, icon: '🎉' },
    { name: 'Hội thảo Kỹ năng mềm', organizer: 'CLB Kỹ năng', month: 'Tháng 10', registrations: 250, icon: '💼' },
    { name: 'Giải bóng đá sinh viên', organizer: 'CLB Thể thao', month: 'Tháng 11', registrations: 200, icon: '⚽' },
    { name: 'Cuộc thi Lập trình', organizer: 'Khoa CNTT', month: 'Tháng 3', registrations: 180, icon: '💻' },
    { name: 'Ngày hội việc làm', organizer: 'Trung tâm QHDN', month: 'Tháng 5', registrations: 150, icon: '🏢' },
  ];

  const scoreDistribution = [
    { range: '0-20', count: 50, type: 'Điểm rèn luyện' },
    { range: '21-40', count: 100, type: 'Điểm rèn luyện' },
    { range: '41-60', count: 300, type: 'Điểm rèn luyện' },
    { range: '61-80', count: 500, type: 'Điểm rèn luyện' },
    { range: '81-100', count: 250, type: 'Điểm rèn luyện' },
  ];

  // New monthly student activity data
  const monthlyActivities = [
    { month: '1', value: 350, category: 'Tham gia sự kiện' },
    { month: '2', value: 420, category: 'Tham gia sự kiện' },
    { month: '3', value: 380, category: 'Tham gia sự kiện' },
    { month: '4', value: 450, category: 'Tham gia sự kiện' },
    { month: '5', value: 520, category: 'Tham gia sự kiện' },
    { month: '6', value: 480, category: 'Tham gia sự kiện' },
    { month: '7', value: 390, category: 'Tham gia sự kiện' },
    { month: '8', value: 430, category: 'Tham gia sự kiện' },
    { month: '9', value: 470, category: 'Tham gia sự kiện' },
    { month: '10', value: 510, category: 'Tham gia sự kiện' },
    { month: '11', value: 540, category: 'Tham gia sự kiện' },
    { month: '12', value: 580, category: 'Tham gia sự kiện' },
  ];

  // Distribution by category pie chart
  const categoryDistribution = [
    { type: 'Văn hóa - Nghệ thuật', value: 30, color: '#ff7a45' },
    { type: 'Học thuật', value: 25, color: '#36cfc9' },
    { type: 'Thể thao', value: 20, color: '#52c41a' },
    { type: 'Tình nguyện', value: 15, color: '#722ed1' },
    { type: 'Kỹ năng', value: 10, color: '#f5222d' },
  ];

  const eventColumns = [
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
      render: (text) => (
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
      render: (text) => (
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
      render: (value) => (
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

  const scoreColumns = [
    {
      title: 'Khoảng điểm',
      dataIndex: 'range',
      key: 'range',
      render: (text) => (
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
      render: (value) => (
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

  // Column chart config
  const columnConfig = {
    data: scoreDistribution,
    xField: 'range',
    yField: 'count',
    seriesField: 'type',
    legend: {
      position: 'top',
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
      title: {
        text: 'Khoảng điểm',
        style: {
          fontSize: 14,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Số lượng sinh viên',
        style: {
          fontSize: 14,
        },
      },
    },
    meta: {
      count: {
        alias: 'Số lượng',
      },
    },
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
    color: ['#1677ff'],
    columnBackground: {
      style: {
        fill: 'rgba(0,0,0,0.05)',
      },
    },
    // Add animations
    animation: animateCharts ? {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    } : false,
  };

  // Pie chart config
  const pieConfig = {
    appendPadding: 10,
    data: categoryDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '14px',
        },
        content: 'Hoạt động\nsự kiện',
      },
    },
    // Add animations
    animation: animateCharts ? {
      appear: {
        animation: 'wave-in',
        duration: 1500,
        delay: 300,
      },
    } : false,
    // Custom colors for each category
    color: ({ type }) => {
      const item = categoryDistribution.find(item => item.type === type);
      return item ? item.color : '#1890ff';
    },
  };

  // Area chart config
  const areaConfig = {
    data: monthlyActivities,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
    },
    xAxis: {
      title: {
        text: 'Tháng',
        style: {
          fontSize: 14,
        },
      },
      tickCount: 12,
    },
    yAxis: {
      title: {
        text: 'Số lượng sinh viên',
        style: {
          fontSize: 14,
        },
      },
    },
    meta: {
      value: {
        alias: 'Số sinh viên',
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Số sinh viên', value: datum.value + ' sinh viên' };
      },
    },
    // Add animations
    animation: animateCharts ? {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    } : false,
  };

  // Welcome overlay
  if (showWelcome) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          zIndex: 1000,
        }}
      >
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s ease-in-out' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>👋</div>
          <Title level={1} style={{ color: '#1890ff', margin: 0 }}>Chào mừng trở lại!</Title>
          <Paragraph style={{ fontSize: 18, color: '#666' }}>
            Hệ thống quản lý sự kiện và điểm rèn luyện sinh viên
          </Paragraph>
        </div>
        
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Sidebar>
      <div style={{ 
        padding: 24, 
        background: 'linear-gradient(180deg, #f0f5ff 0%, #f5f5f5 100%)',
        minHeight: 'calc(100vh - 64px)',
      }}>
        {/* Header Section */}
        <div 
          style={{ 
            marginBottom: 24,
            opacity: animateCharts ? 1 : 0,
            transform: animateCharts ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease',
          }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Title level={2} style={{ margin: 0, color: '#1668dc' }}>Tổng quan hệ thống</Title>
              <Paragraph style={{ fontSize: 16, color: '#666', margin: '8px 0 0 0' }}>
                Thống kê và báo cáo về các hoạt động, sự kiện và điểm rèn luyện sinh viên
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" icon={<FireOutlined />} style={{ borderRadius: 8 }}>
                  Xem sự kiện mới
                </Button>
                <Button icon={<CarryOutOutlined />} style={{ borderRadius: 8 }}>
                  Báo cáo
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Main Statistics */}
        <Row 
          gutter={[24, 24]}
          style={{ 
            opacity: animateCharts ? 1 : 0,
            transform: animateCharts ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.1s',
          }}
        >
          {/* Total Students Card */}
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              className="dashboard-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '24px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Tổng số sinh viên</Text>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1668dc', margin: '8px 0' }}>
                    {totalStudents}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tính đến tháng 05/2025</Text>
                </div>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(22, 104, 220, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TeamOutlined style={{ fontSize: 24, color: '#1668dc' }} />
                </div>
              </div>
              <div 
                style={{ 
                  marginTop: 16, 
                  height: 4, 
                  background: '#f0f0f0', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '70%', 
                    height: '100%', 
                    background: '#1668dc',
                    borderRadius: 2,
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* Top Events */}
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              className="dashboard-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '24px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Sự kiện đã tổ chức</Text>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16', margin: '8px 0' }}>
                    87
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Năm học 2024-2025</Text>
                </div>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(250, 140, 22, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                </div>
              </div>
              <div 
                style={{ 
                  marginTop: 16, 
                  height: 4, 
                  background: '#f0f0f0', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '60%', 
                    height: '100%', 
                    background: '#fa8c16',
                    borderRadius: 2,
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* Average Score */}
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              className="dashboard-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '24px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Điểm rèn luyện trung bình</Text>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a', margin: '8px 0' }}>
                    78.5
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Học kỳ gần nhất</Text>
                </div>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(82, 196, 26, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrophyOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                </div>
              </div>
              <div 
                style={{ 
                  marginTop: 16, 
                  height: 4, 
                  background: '#f0f0f0', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '78.5%', 
                    height: '100%', 
                    background: '#52c41a',
                    borderRadius: 2,
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* Participation Rate */}
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              className="dashboard-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '24px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Tỷ lệ tham gia sự kiện</Text>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#722ed1', margin: '8px 0' }}>
                    68.7%
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <span style={{ color: '#52c41a' }}>↑ 8.2%</span> so với kỳ trước
                  </Text>
                </div>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(114, 46, 209, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RiseOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                </div>
              </div>
              <div 
                style={{ 
                  marginTop: 16, 
                  height: 4, 
                  background: '#f0f0f0', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '68.7%', 
                    height: '100%', 
                    background: '#722ed1',
                    borderRadius: 2,
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row 
          gutter={[24, 24]} 
          style={{ 
            marginTop: 24,
            opacity: animateCharts ? 1 : 0,
            transform: animateCharts ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.2s',
          }}
        >
          {/* Monthly Activities Area Chart */}
          <Col xs={24} md={24} lg={16}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LineChartOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>Biểu đồ hoạt động sinh viên theo tháng</Title>
                </div>
              } 
              bordered={false}
              className="chart-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              extra={
                <Space>
                  <Button type="text" size="small">Năm 2024</Button>
                  <Button type="text" size="small">Năm 2025</Button>
                  <Button type="primary" size="small" style={{ borderRadius: 6 }}>Tất cả</Button>
                </Space>
              }
            >
              <Area {...areaConfig} height={320} />
            </Card>
          </Col>

          {/* Event Categories Pie Chart */}
          <Col xs={24} md={24} lg={8}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BulbOutlined style={{ fontSize: 20, color: '#fa8c16', marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>Phân bố loại hình sự kiện</Title>
                </div>
              } 
              bordered={false}
              className="chart-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              extra={
                <Button type="text" size="small">Chi tiết</Button>
              }
            >
              <Pie {...pieConfig} height={320} />
            </Card>
          </Col>
        </Row>

        {/* Tables and Column Chart Section */}
        <Row 
          gutter={[24, 24]} 
          style={{ 
            marginTop: 24,
            opacity: animateCharts ? 1 : 0,
            transform: animateCharts ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.3s',
          }}
        >
          {/* Score Distribution Chart */}
          <Col xs={24} lg={14}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 20, color: '#52c41a', marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>Biểu đồ phân bố điểm rèn luyện</Title>
                </div>
              } 
              bordered={false}
              className="chart-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              extra={
                <Space>
                  <Button type="text" size="small">Học kỳ 1</Button>
                  <Button type="text" size="small">Học kỳ 2</Button>
                  <Button type="primary" size="small" style={{ borderRadius: 6 }}>Cả năm</Button>
                </Space>
              }
            >
              <Column {...columnConfig} height={320} />
            </Card>
          </Col>

          {/* Top 5 Events */}
          <Col xs={24} lg={10}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ fontSize: 20, color: '#ff4d4f', marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>Sự kiện nổi bật nhất</Title>
                </div>
              } 
              bordered={false}
              className="table-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              extra={
                <Button type="text" size="small">Xem tất cả</Button>
              }
            >
              <Table
                columns={eventColumns}
                dataSource={topEvents}
                rowKey="name"
                pagination={false}
                size="middle"
                className="highlight-table"
                rowClassName={(record, index) => index === 0 ? 'highlight-row' : ''}
              />
            </Card>
          </Col>
        </Row>

        {/* Score Distribution Table */}
        <Row 
          gutter={[24, 24]} 
          style={{ 
            marginTop: 24,
            opacity: animateCharts ? 1 : 0,
            transform: animateCharts ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.4s',
          }}
        >
          <Col span={24}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>Thống kê điểm rèn luyện sinh viên</Title>
                </div>
              } 
              bordered={false}
              className="table-card"
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div 
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0) 100%)',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>Bảng phân bố điểm số</Text>
                  </div>
                  
                  <Table
                    columns={scoreColumns}
                    dataSource={scoreDistribution}
                    rowKey="range"
                    pagination={false}
                    size="middle"
                    className="clean-table"
                  />
                </Col>
                <Col xs={24} md={12}>
                  <div 
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0) 100%)',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>Thống kê theo xếp loại</Text>
                  </div>
                  
                  <List
                    bordered={false}
                    dataSource={[
                      { level: 'Xuất sắc (90-100)', count: 180, color: '#52c41a', icon: '🏆' },
                      { level: 'Tốt (80-89)', count: 320, color: '#1890ff', icon: '🥇' },
                      { level: 'Khá (65-79)', count: 450, color: '#faad14', icon: '🥈' },
                      { level: 'Trung bình (50-64)', count: 180, color: '#fa8c16', icon: '🥉' },
                      { level: 'Yếu (35-49)', count: 50, color: '#f5222d', icon: '⚠️' },
                      { level: 'Kém (dưới 35)', count: 20, color: '#a8071a', icon: '❌' },
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <Row style={{ width: '100%', alignItems: 'center' }}>
                          <Col span={2} style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: '18px' }}>{item.icon}</Text>
                          </Col>
                          <Col span={14}>
                            <Text strong>{item.level}</Text>
                          </Col>
                          <Col span={8} style={{ textAlign: 'right' }}>
                            <Badge 
                              count={item.count} 
                              style={{ 
                                backgroundColor: item.color, 
                                fontWeight: 'bold',
                                padding: '0 10px',
                                borderRadius: '12px',
                                fontSize: '14px'
                              }} 
                            />
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .dashboard-card {
          transition: all 0.3s ease;
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .chart-card, .table-card {
          transition: all 0.3s ease;
        }
        
        .chart-card:hover, .table-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .highlight-row {
          background-color: rgba(250, 173, 20, 0.05);
        }
        
        .clean-table .ant-table-thead > tr > th {
          background-color: transparent;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .highlight-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(24, 144, 255, 0.05);
        }
      `}</style>
    </Sidebar>
  );
}