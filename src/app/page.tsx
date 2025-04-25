'use client';

import React from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { Column } from '@ant-design/plots'; // Use Column for vertical bars
import Sidebar from '@/layouts/sidebar';

const { Title } = Typography;

export default function Home() {
  // Mock data for demonstration
  const totalStudents = 1200;

  const topEvents = [
    { name: 'Event A', organizer: 'Unit A', month: 'January', registrations: 300 },
    { name: 'Event B', organizer: 'Unit B', month: 'February', registrations: 250 },
    { name: 'Event C', organizer: 'Unit C', month: 'March', registrations: 200 },
    { name: 'Event D', organizer: 'Unit D', month: 'April', registrations: 180 },
    { name: 'Event E', organizer: 'Unit E', month: 'May', registrations: 150 },
  ];

  const scoreDistribution = [
    { range: '0-20', count: 50 },
    { range: '21-40', count: 100 },
    { range: '41-60', count: 300 },
    { range: '61-80', count: 500 },
    { range: '81-100', count: 250 },
  ];

  const eventColumns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: 'Tháng tổ chức',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Số lượng đăng ký',
      dataIndex: 'registrations',
      key: 'registrations',
    },
  ];

  const scoreColumns = [
    {
      title: 'Khoảng điểm',
      dataIndex: 'range',
      key: 'range',
    },
    {
      title: 'Số lượng sinh viên',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const chartConfig = {
    data: scoreDistribution,
    xField: 'range', // X-axis is the range of scores
    yField: 'count', // Y-axis is the count of students
    color: '#1468a2', // Bar color
    columnWidthRatio: 0.05, // Adjust the width of the columns
    label: {
      position: 'middle', // Display labels in the middle of the bars
      style: {
        fill: '#fff',
        fontSize: 12,
      },
    },
    xAxis: {
      title: {
        text: 'Khoảng điểm', // X-axis title
        style: {
          fontSize: 14,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Số lượng sinh viên', // Y-axis title
        style: {
          fontSize: 14,
        },
      },
    },
  };

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {/* Total Students */}
        <Card className="shadow-md" style={{ marginBottom: 24 }}>
          <Title level={3}>Số sinh viên trong hệ thống</Title>
          <Title level={1} style={{ color: '#1468a2' }}>
            {totalStudents}
          </Title>
        </Card>

        <Row gutter={24}>
          {/* Top 5 Events */}
          <Col span={12}>
            <Card className="shadow-md" style={{ marginBottom: 24 }}>
              <Title level={3}>Top 5 sự kiện có số lượng đăng ký đông nhất</Title>
              <Table
                columns={eventColumns}
                dataSource={topEvents}
                rowKey="name"
                pagination={false}
              />
            </Card>
          </Col>

          {/* Score Distribution Table */}
          <Col span={12}>
            <Card className="shadow-md" style={{ marginBottom: 24 }}>
              <Title level={3}>Bảng phân bố điểm rèn luyện </Title>
              <Table
                columns={scoreColumns}
                dataSource={scoreDistribution}
                rowKey="range"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>

        {/* Score Distribution Chart */}
        <Card className="shadow-md">
          <Title level={3}>Đồ thị phân bố điểm rèn luyện </Title>
          <Column {...chartConfig} />
        </Card>
      </div>
    </Sidebar>
  );
}