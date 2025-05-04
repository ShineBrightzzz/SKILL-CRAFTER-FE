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
  LockOutlined,
  IdcardOutlined,
  UsergroupAddOutlined,
  DownOutlined,
  RightOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Navbar from './navbar'; 

const { Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false); // Sidebar collapsed state
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Set initial open keys based on the current path
  React.useEffect(() => {
    if (['/permissions', '/roles', '/users'].includes(pathname)) {
      setOpenKeys(['admin']);
    }
  }, [pathname]);

  const getOpenKeysFromPath = (path: string) => {
    if (['/permissions', '/roles', '/users'].includes(path)) {
      return ['admin'];
    }
    return [];
  };

  // Function to handle submenu opening/closing
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const menuItems = [
    { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
    { key: '/forms', label: 'Form', icon: <FormOutlined /> }, // Add the Form router
    { key: '/events', label: 'Sự kiện', icon: <CalendarOutlined /> },
    { key: '/semesters', label: 'Học kì', icon: <BookOutlined /> },
    { key: '/scores', label: 'Upload điểm', icon: <UploadOutlined /> },
    { key: '/students', label: 'Điểm sinh viên', icon: <UserOutlined /> },
    {
      key: 'admin',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Quản trị hệ thống</span>
          {openKeys.includes('admin') ? 
            <DownOutlined style={{ fontSize: '12px' }} /> : 
            <RightOutlined style={{ fontSize: '12px' }} />
          }
        </div>
      ),
      icon: <LockOutlined />,
      children: [
        { key: '/permissions', label: 'Quản lý quyền', icon: <KeyOutlined /> },
        { key: '/roles', label: 'Quản lý vai trò', icon: <IdcardOutlined /> },
        { key: '/users', label: 'Quản lý người dùng', icon: <UsergroupAddOutlined /> },
      ],
    },
    
  ];

  // Custom styles for the submenu items
  const menuStyles = `
    /* Change submenu item text color to light blue */
    .ant-menu-dark .ant-menu-submenu-title {
      color: #fff !important;
    }
    
    /* Change submenu dropdown background color */
    .ant-menu-dark .ant-menu-sub {
      background-color: #1f7bc4 !important;
    }
    
    /* Change submenu item color to light blue */
    .ant-menu-dark .ant-menu-item {
      color: #a6d1ff !important;
    }
    
    /* Remove submenu arrows */
    .ant-menu-submenu-arrow {
      display: none !important;
    }
    
    /* Styling for the expand indicator */
    .ant-menu-submenu-title:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  `;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Add custom styles */}
      <style>{menuStyles}</style>
      
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
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={({ key }) => router.push(key)}
          items={menuItems}
          style={{
            fontSize: 16,
            background: '#1468a2', // Sidebar background color
            color: '#fff',
          }}
          subMenuOpenDelay={0.3} // Optional: Add a slight delay for submenu opening
          subMenuCloseDelay={0.3} // Optional: Add a slight delay for submenu closing
          // Remove the expandIcon prop to remove the arrow
          expandIcon={null}
        />
      </Sider>

      {/* Main layout with Navbar and Content */}
      <Layout 
        style={{ marginLeft: collapsed ? 80 : 250 }}
        className="site-layout" 
      > 
        <Navbar collapsed={collapsed} /> 
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