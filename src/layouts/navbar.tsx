'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Menu, Typography, Badge, Space } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  BellOutlined, 
  QuestionCircleOutlined,
  SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import Image from 'next/image';

const { Header } = Layout;
const { Text } = Typography;
interface NavbarProps {
  collapsed: boolean;
}
const Navbar: React.FC<NavbarProps> = ({ collapsed }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.user);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');


    // Redirect to login page
    router.push('/login');
  };
  const menu = (
    <Menu>
      <Menu.Item key="userInfo" disabled>
        <Text strong>{user?.name || 'Guest'}</Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="myCourses" icon={<BookOutlined />} onClick={() => router.push('/learning')}>
        My Courses
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <Header
      style={{
        background: 'linear-gradient(90deg, #1468a2 0%, #105990 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="logo-container" style={{ display: 'flex', alignItems: 'center' }}>
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={32} 
          height={32}
          style={{ marginRight: '10px' }}
        />
        {!collapsed && !isMobile && (
          <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            BAV-ITDE
          </Text>
        )}
      </div>

      <Space size={isMobile ? 'small' : 'middle'}>
        {!isMobile && (
          <>
            <Badge count={5} size="small">              
              <BellOutlined 
                style={{ 
                  fontSize: '20px', 
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#1468a2',
                }} 
              />
            </Badge>
          </>
        )}
        <Dropdown overlay={menu} trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Avatar
              size="default"
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#fff',
                color: '#1468a2',
              }}
            />
            {!isMobile && (
              <Text style={{ color: '#fff', marginLeft: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Guest'}
              </Text>
            )}
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;