'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Menu, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import  {logout}  from '@/store/slices/userSlice';

const { Header } = Layout;
const { Text } = Typography;

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menu = (
    <Menu>
      <Menu.Item key="userInfo" disabled>
        <Text strong>{user.name || 'Guest'}</Text>
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
        background: '#1468a2',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Dropdown overlay={menu} trigger={['click']}>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{
            cursor: 'pointer',
            backgroundColor: '#fff',
            color: '#1468a2',
          }}
        />
      </Dropdown>
    </Header>
  );
};

export default Navbar;