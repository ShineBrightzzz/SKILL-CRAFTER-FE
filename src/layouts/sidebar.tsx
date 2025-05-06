'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
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
  FormOutlined,
  LeftOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Navbar from './navbar';
import { useMediaQuery } from 'react-responsive';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  React.useEffect(() => {
    if (['/permissions', '/roles', '/users'].includes(pathname)) {
      setOpenKeys(['admin']);
    }
  }, [pathname]);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const menuItems = [
    { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
    { key: '/forms', label: 'Form', icon: <FormOutlined /> },
    { key: '/events', label: 'Sự kiện', icon: <CalendarOutlined /> },
    { key: '/semesters', label: 'Học kì', icon: <BookOutlined /> },
    { key: '/scores', label: 'Upload điểm', icon: <UploadOutlined /> },
    { key: '/students', label: 'Điểm sinh viên', icon: <UserOutlined /> },
    {
      key: 'admin',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Quản trị hệ thống</span>
          {openKeys.includes('admin') ? <DownOutlined /> : <RightOutlined />}
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

  const menuStyles = `
    .ant-menu-dark .ant-menu-submenu-title {
      color: #fff !important;
    }
    .ant-menu-dark .ant-menu-sub {
      background-color: #1f7bc4 !important;
    }
    .ant-menu-dark .ant-menu-item {
      color: #a6d1ff !important;
    }
    .ant-menu-submenu-arrow {
      display: none !important;
    }
    .ant-menu-submenu-title:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  `;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <style>{menuStyles}</style>

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        collapsedWidth={isMobile ? 60 : 80}
        style={{
          background: '#1468a2',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          overflowY: 'auto',
          left: 0,
          transition: 'all 0.3s ease',
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
              style={{ color: '#fff', margin: '0 0 0 8px', fontSize: isMobile ? 18 : 20 }}
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
          style={{ fontSize: isMobile ? 14 : 16, background: '#1468a2', color: '#fff' }}
          expandIcon={null}
        />

        {/* Toggle button dưới cùng */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: collapsed ? (isMobile ? 10 : 20) : 90,
            transition: 'left 0.3s ease',
          }}
        >
          <Button
            type="primary"
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            size={isMobile ? 'small' : 'middle'}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? (isMobile ? 60 : 80) : 250 }}>
        <Navbar collapsed={collapsed} />
        <Content
          style={{
            margin: '24px',
            background: '#fff',
            padding: isMobile ? 16 : 24,
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