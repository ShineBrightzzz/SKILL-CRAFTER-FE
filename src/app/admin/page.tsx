'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Drawer, Dropdown, Avatar, Tooltip } from 'antd';
import { 
  BookOutlined, 
  ReadOutlined, 
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useAuth } from '@/store/hooks';
import { useRouter } from 'next/navigation';
// Using dynamic imports to allow lazy loading
import dynamic from 'next/dynamic';

// Import the components with absolute paths to avoid module resolution issues
const CoursesManagement = dynamic(() => import('../../components/admin/CoursesManagement'));
const LessonsManagement = dynamic(() => import('../../components/admin/LessonsManagement'));
const UsersManagement = dynamic(() => import('../../components/admin/UsersManagement'));

const { Sider, Content, Header } = Layout;

const AdminPage = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>('courses');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Check if the screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const renderContent = () => {
    switch (selectedMenu) {
      case 'courses':
        return <CoursesManagement />;
      case 'lessons':
        return <LessonsManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return <CoursesManagement />;
    }
  };
  
  const menuItems = [
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: 'Khóa học',
      onClick: () => {
        setSelectedMenu('courses');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'lessons',
      icon: <ReadOutlined />,
      label: 'Bài học',
      onClick: () => {
        setSelectedMenu('lessons');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Người dùng',
      onClick: () => {
        setSelectedMenu('users');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="md"
          collapsedWidth={80}          style={{ 
            overflow: 'auto', 
            height: '100vh', 
            position: 'fixed', 
            top: 0, 
            left: 0,
            zIndex: 1001, // Đảm bảo nằm phía trên của mọi phần tử khác
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="logo" style={{ 
            height: '64px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: token.colorBgContainer,
            margin: '16px'
          }}>
            {!collapsed && <h2>Admin Panel</h2>}
            {collapsed && <h2>AP</h2>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['courses']}
            items={menuItems}
          />
        </Sider>
      )}
        <Layout style={{ 
        marginLeft: !isMobile ? (collapsed ? '80px' : '200px') : 0,
        transition: 'margin-left 0.2s'
      }}>
        {/* Header with mobile navigation */}
        <Header style={{ 
          padding: 0, 
          background: token.colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          {isMobile ? (
            <>              <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>                <Tooltip title="Mở menu quản trị" placement="bottom">
                  <Button
                    type="text"
                    icon={<AppstoreOutlined style={{ fontSize: '20px' }} />}
                    onClick={() => setMobileMenuVisible(true)}
                    style={{
                      fontSize: '16px',
                      width: 64,
                      height: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s',
                    }}
                    className="admin-menu-button hover-scale"
                  />
                </Tooltip>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Admin Panel</div>
                  <h3 style={{ margin: 0 }}>
                    {selectedMenu === 'courses' && 'Quản lý khóa học'}
                    {selectedMenu === 'lessons' && 'Quản lý bài học'}
                    {selectedMenu === 'users' && 'Quản lý người dùng'}
                  </h3>
                </div>
              </div>
              
              {/* User menu dropdown for mobile */}              <Tooltip title="Tùy chọn người dùng" placement="bottomRight">
                <Dropdown menu={{ 
                  items: [
                    {
                      key: '1',
                      icon: <UserOutlined />,
                      label: user?.username || 'Người dùng',
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: '2',
                      icon: <UserSwitchOutlined />,
                      label: 'Chuyển đến trang người dùng',
                      onClick: () => router.push('/'),
                    },
                    {
                      key: '3',
                      icon: <LogoutOutlined />,
                      label: 'Đăng xuất',
                      onClick: handleLogout,
                    },
                  ]
                }}>
                  <Button type="text" style={{ marginRight: '8px' }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                  </Button>
                </Dropdown>
              </Tooltip>{/* Mobile top menu drawer */}              <Drawer
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Menu Quản trị</span>}
                placement="top"
                closable={true}
                closeIcon={<Button type="text" icon={<MenuFoldOutlined style={{ fontSize: '16px' }} />} />}
                onClose={() => setMobileMenuVisible(false)}
                open={mobileMenuVisible}
                height="auto"
                bodyStyle={{ padding: 0 }}
                style={{ zIndex: 1002 }} // Đảm bảo drawer nằm trên cùng
                className="mobile-admin-drawer"
                headerStyle={{ 
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>                  <Menu
                    theme="light"
                    mode="vertical"
                    selectedKeys={[selectedMenu]}
                    style={{ width: '100%', border: 'none' }}
                    items={menuItems.map(item => ({
                      ...item,
                      style: { 
                        fontSize: '16px', 
                        padding: '16px 20px',
                        marginBottom: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      },
                      icon: React.cloneElement(item.icon as React.ReactElement, {
                        style: { fontSize: '20px', marginRight: '12px' }
                      })
                    }))}
                  />
                    {/* Nút đóng menu ở cuối */}
                  <div style={{ 
                    padding: '16px', 
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Button 
                      block 
                      size="large"
                      type="primary"
                      style={{
                        height: '48px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      icon={<MenuFoldOutlined />}
                      onClick={() => setMobileMenuVisible(false)}
                    >
                      Đóng menu
                    </Button>
                  </div>
                </div>
              </Drawer>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />              <div style={{ marginLeft: '16px', flexGrow: 1 }}>
                <h1 style={{ margin: 0 }}>
                  {selectedMenu === 'courses' && 'Quản lý khóa học'}
                  {selectedMenu === 'lessons' && 'Quản lý bài học'}
                  {selectedMenu === 'users' && 'Quản lý người dùng'}
                </h1>
              </div>
              
              {/* User info and logout button */}
              <div style={{ marginRight: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dropdown menu={{ 
                  items: [
                    {
                      key: '1',
                      icon: <UserOutlined />,
                      label: 'Hồ sơ của tôi',
                    },
                    {
                      key: '2',
                      icon: <SettingOutlined />,
                      label: 'Cài đặt',
                    },
                    {
                      key: '3',
                      icon: <UserSwitchOutlined />,
                      label: 'Chuyển đến trang người dùng',
                      onClick: () => router.push('/'),
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: '4',
                      icon: <LogoutOutlined />,
                      label: 'Đăng xuất',
                      onClick: handleLogout,
                    },
                  ]
                }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar icon={<UserOutlined />} />
                    <span>{user?.username}</span>
                  </div>
                </Dropdown>
              </div>
            </>
          )}
        </Header><Content
          style={{
            margin: isMobile ? '12px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: '8px',
            overflow: 'auto'
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
