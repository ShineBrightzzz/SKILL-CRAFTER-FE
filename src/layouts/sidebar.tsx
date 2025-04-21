'use client';

import React, { useState } from 'react';
import {
  Layout, Menu,
} from 'antd';
import {
  HomeOutlined, CalendarOutlined, BookOutlined,
  UploadOutlined, UserOutlined, KeyOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getOpenKeysFromPath = (path: string) => {
    if (['/permissions', '/roles', '/users'].includes(path)) {
      return ['admin'];
    }
    return [];
  };

  const menuItems = [
    { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
    { key: '/events', label: 'Sự kiện', icon: <CalendarOutlined /> },
    { key: '/semesters', label: 'Học kì', icon: <BookOutlined /> },
    { key: '/scores', label: 'Upload điểm', icon: <UploadOutlined /> },
    { key: '/students', label: 'Điểm sinh viên', icon: <UserOutlined /> },
    {
      key: 'admin',
      label: 'Quản trị hệ thống',
      icon: <KeyOutlined />,
      children: [
        { key: '/permissions', label: 'Quản lý quyền', icon: <KeyOutlined /> },
        { key: '/roles', label: 'Quản lý vai trò', icon: <KeyOutlined /> },
        { key: '/users', label: 'Quản lý người dùng', icon: <TeamOutlined /> },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={250}>
        <div
          className="logo"
          style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.3)' }}
        />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={getOpenKeysFromPath(pathname)}
          onClick={({ key }) => router.push(key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Content style={{ margin: '24px', background: '#fff', padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
