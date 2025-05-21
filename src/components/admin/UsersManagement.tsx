'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetAllUserQuery, useCreateUserMutation, useDeleteUserMutation, useUpdateUserMutation } from '@/services/user.service';

const UsersManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const { data: usersData, isLoading, refetch } = useGetAllUserQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const showModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        // Do not set password for security
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await updateUser({ username: editingUser.username, body: values }).unwrap();
        message.success('Cập nhật người dùng thành công!');
      } else {
        await createUser({ body: values }).unwrap();
        message.success('Tạo người dùng thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = async (username: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUser({ username }).unwrap();
          message.success('Xóa người dùng thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa người dùng!');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.username)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  // Set up responsive columns
  const getResponsiveColumns = () => {
    // Get current window width
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Base columns that always show
    let responsiveColumns = [...columns];
    
    if (isMobile) {
      // Remove email column on small screens
      responsiveColumns = responsiveColumns.filter(col => col.key !== 'email');
      
      // Simplify action buttons on mobile
      const actionColumn = responsiveColumns.find(col => col.key === 'action');
      if (actionColumn) {
        actionColumn.render = (_, record: any) => (
          <Space size="small">
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.username)}
            />
          </Space>
        );
      }
    }
    
    return responsiveColumns;
  };

  // State to track responsive columns
  const [responsiveColumns, setResponsiveColumns] = useState(getResponsiveColumns());

  // Update columns when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      setResponsiveColumns(getResponsiveColumns());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
        gap: typeof window !== 'undefined' && window.innerWidth < 768 ? '10px' : '0'
      }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ alignSelf: typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex-start' : 'auto' }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Table 
        columns={responsiveColumns} 
        dataSource={usersData?.data || []} 
        rowKey="username" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '520px'}
        style={{ top: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 100 }}
        bodyStyle={{ maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 200px)' : 'auto', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
            disabled={!!editingUser}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: !editingUser, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select 
              placeholder="Chọn vai trò"
              style={{ width: '100%' }}
              getPopupContainer={trigger => trigger.parentElement}
            >
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="teacher">Teacher</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <div style={{ 
              display: 'flex', 
              justifyContent: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-end', 
              gap: '8px',
              flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
              width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto',
            }}>
              <Button 
                onClick={handleCancel}
                style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto' }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto' }}
              >
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersManagement;
