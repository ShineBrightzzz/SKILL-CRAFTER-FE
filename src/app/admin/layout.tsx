'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Drawer, Dropdown, Avatar, Tooltip } from 'antd';
import { 
  BookOutlined, 
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  DollarOutlined
} from '@ant-design/icons';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/store/hooks';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Content, Header } = Layout;

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Xác định menu item active dựa vào pathname
  const getActiveMenuKey = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.includes('/admin/courses')) return 'courses';
    if (pathname.includes('/admin/categories')) return 'categories';
    if (pathname.includes('/admin/payments')) return 'payments';
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/permissions')) return 'permissions';
    if (pathname.includes('/admin/roles')) return 'roles';
    return 'dashboard';
  };

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => {
        router.push('/admin');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: 'Khóa học',
      onClick: () => {
        router.push('/admin/courses');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: 'Danh mục',
      onClick: () => {
        router.push('/admin/categories');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Giao dịch',
      onClick: () => {
        router.push('/admin/payments');
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
        router.push('/admin/users');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'permissions',
      icon: <SafetyCertificateOutlined />,
      label: 'Quản lý quyền',
      onClick: () => {
        router.push('/admin/permissions');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
    {
      key: 'roles',
      icon: <UserSwitchOutlined />,
      label: 'Quản lý vai trò',
      onClick: () => {
        router.push('/admin/roles');
        if (isMobile) {
          setMobileMenuVisible(false);
        }
      }
    },
  ];
  
  // Xác định tên trang hiện tại
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('/admin/courses')) return 'Quản lý khóa học';
    if (pathname.includes('/admin/categories')) return 'Quản lý danh mục';
    if (pathname.includes('/admin/payments')) return 'Quản lý giao dịch';
    if (pathname.includes('/admin/users')) return 'Quản lý người dùng';
    if (pathname.includes('/admin/permissions')) return 'Quản lý quyền';
    if (pathname.includes('/admin/roles')) return 'Quản lý vai trò';
    return 'Admin';
  };
    return (
    <AuthGuard>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            breakpoint="md"
            collapsedWidth={80}
            style={{ 
              overflow: 'auto', 
              height: '100vh', 
              position: 'fixed', 
              top: 0, 
              left: 0,
              zIndex: 1001,
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            }}          >            <div className="logo" style={{ 
              height: '120px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '8px 0',
              marginTop: '8px'
            }}>
              <img 
                src="/logo.png" 
                alt="Logo"                style={{ 
                  height: collapsed ? '40px' : '80px',
                  width: 'auto',
                  transition: 'all 0.2s'
                }} 
              />
            </div>
            <Menu
              theme="dark"
              mode="inline"              defaultSelectedKeys={[getActiveMenuKey()]}
              selectedKeys={[getActiveMenuKey()]}
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
              <>
                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  <Tooltip title="Mở menu quản trị" placement="bottom">
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
                    <h3 style={{ margin: 0 }}>{getPageTitle()}</h3>
                  </div>
                </div>
                
                {/* User menu dropdown for mobile */}
                <Tooltip title="Tùy chọn người dùng" placement="bottomRight">
                  <Dropdown menu={{ 
                    items: [                      {
                        key: '1',
                        icon: <UserOutlined />,
                        label: 'Hồ sơ của tôi',
                        onClick: () => router.push('/profile'),
                      },
                      {
                        key: '2',
                        icon: <UserSwitchOutlined />,
                        label: 'Chuyển đến trang người dùng',
                        onClick: () => router.push('/'),
                      },
                      {
                        type: 'divider',
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
                </Tooltip>
                
                {/* Mobile top menu drawer */}
                <Drawer
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Menu Quản trị</span>}
                  placement="top"
                  closable={true}
                  closeIcon={<Button type="text" icon={<MenuFoldOutlined style={{ fontSize: '16px' }} />} />}
                  onClose={() => setMobileMenuVisible(false)}
                  open={mobileMenuVisible}
                  height="auto"
                  bodyStyle={{ padding: 0 }}
                  style={{ zIndex: 1002 }}
                  className="mobile-admin-drawer"
                  headerStyle={{ 
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <Menu
                      theme="light"
                      mode="vertical"
                      defaultSelectedKeys={[getActiveMenuKey()]}
                      selectedKeys={[getActiveMenuKey()]}
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
                />
                
                <div style={{ marginLeft: '16px', flexGrow: 1 }}>
                  <h1 style={{ margin: 0 }}>{getPageTitle()}</h1>
                </div>
                
                {/* User info and logout button */}
                <div style={{ marginRight: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>                  <Dropdown menu={{ 
                    items: [
                      {
                        key: '1',
                        icon: <UserOutlined />,
                        label: 'Hồ sơ của tôi',
                        onClick: () => router.push('/profile'),
                      },
                      {
                        key: '2',
                        icon: <UserSwitchOutlined />,
                        label: 'Chuyển đến trang người dùng',
                        onClick: () => router.push('/'),
                      },
                      {
                        type: 'divider',
                      },
                      {
                        key: '3',
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
          </Header>
          
          <Content
            style={{
              margin: isMobile ? '12px 8px' : '24px 16px',
              padding: isMobile ? 12 : 24,
              minHeight: 280,
              background: token.colorBgContainer,
              borderRadius: '8px',
              overflow: 'auto'
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
