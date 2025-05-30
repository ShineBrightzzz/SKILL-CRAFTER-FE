'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Button, Avatar } from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  return (
    <div className="dashboard-content">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/courses')}>
            <Statistic 
              title="Khóa học" 
              value={150} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/lessons')}>
            <Statistic 
              title="Bài học" 
              value={1250} 
              prefix={<FileTextOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/users')}>
            <Statistic 
              title="Người dùng" 
              value={3500} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => router.push('/admin/roles')}>
            <Statistic 
              title="Vai trò" 
              value={5} 
              prefix={<UserSwitchOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <div className="mt-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Khóa học gần đây" extra={<a href="/admin/courses">Xem tất cả</a>}>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Khóa học mẫu {i}</div>
                      <div className="text-xs text-gray-500">2 ngày trước</div>
                    </div>
                    <Button type="link" onClick={() => router.push(`/admin/courses`)}>Chi tiết</Button>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Người dùng mới" extra={<a href="/admin/users">Xem tất cả</a>}>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar icon={<UserOutlined />} className="mr-2" />
                      <div>
                        <div className="font-medium">Người dùng {i}</div>
                        <div className="text-xs text-gray-500">1 ngày trước</div>
                      </div>
                    </div>
                    <Button type="link" onClick={() => router.push(`/admin/users`)}>Chi tiết</Button>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminPage;
