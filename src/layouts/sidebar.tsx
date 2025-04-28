'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  UploadOutlined,
  UserOutlined,
  KeyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Navbar from './navbar'; // Import Navbar component

const { Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false); // Sidebar collapsed state
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
      {/* Sidebar on the left */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          background: '#1468a2',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          position: 'fixed', // Make the sidebar fixed
          height: '100vh', // Ensure it spans the full height of the viewport
          left: 0,
          zIndex: 1000, // Ensure it stays above other content
        }}
      >
        <div
          className="logo"
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8,
            overflow: 'hidden',
            padding: collapsed ? 0 : '0 16px',
          }}
        >
          <Image
            src="/HVNH.svg"
            alt="BAV Logo"
            width={collapsed ? 40 : 50}
            height={collapsed ? 40 : 50}
            style={{ transition: 'width 0.3s, height 0.3s' }}
          />
          {!collapsed && (
            <Title
              level={4}
              style={{
                color: '#fff',
                margin: '0 0 0 8px',
                fontSize: 20,
                transition: 'opacity 0.3s',
              }}
            >
              BAV Score
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={getOpenKeysFromPath(pathname)}
          onClick={({ key }) => router.push(key)}
          items={menuItems}
          style={{
            fontSize: 16,
            background: '#1468a2', // Sidebar background color
            color: '#fff',
          }}
          subMenuOpenDelay={0.3} // Optional: Add a slight delay for submenu opening
          subMenuCloseDelay={0.3} // Optional: Add a slight delay for submenu closing
          expandIcon={({ isOpen }) => (
            <span
              style={{
                color: '#fff', // Icon color
                transition: 'transform 0.3s',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              ▶
            </span>
          )}
        />
      </Sider>

      {/* Main layout with Navbar and Content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}> {/* Adjust margin based on collapsed state */}
        <Navbar collapsed={collapsed} /> {/* Pass collapsed state to Navbar */}
        <Content
          style={{
            margin: '24px',
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;