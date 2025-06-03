'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  useGetAllAccountsQuery, 
  useCreateAccountMutation, 
  useDeleteAccountMutation, 
  useUpdateAccountMutation,
  User,
  AccountUpdateDTO,
  RegisterAccountDTO,
  ApiResponse
} from '@/services/user.service';
import { 
  useGetAllRolesQuery, 
  Role, 
  PaginationParams 
} from '@/services/role.service';
import type { ColumnType } from 'antd/es/table';

interface UserFormData extends Omit<RegisterAccountDTO, 'username'> {
  username?: string;
  role?: string;
}

const UsersManagement: React.FC = () => {
  const [form] = Form.useForm<UserFormData>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { data: usersData, isLoading, refetch } = useGetAllAccountsQuery();
  const { data: rolesData } = useGetAllRolesQuery({} as PaginationParams);
  const [createUser] = useCreateAccountMutation();
  const [updateUser] = useUpdateAccountMutation();
  const [deleteUser] = useDeleteAccountMutation();

  const showModal = (user?: User) => {
    if (user) {
      setEditingUser(user);      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role?.id,
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

  const handleSubmit = async (values: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser({ 
          id: editingUser.id, 
          body: {
            ...values,
            username: values.username || editingUser.username
          } as AccountUpdateDTO 
        }).unwrap();
        message.success('Cập nhật người dùng thành công!');
      } else {
        if (!values.username) {
          message.error('Tên đăng nhập là bắt buộc khi tạo tài khoản mới!');
          return;
        }
        await createUser({ 
          body: {
            ...values,
            username: values.username
          } as RegisterAccountDTO 
        }).unwrap();
        message.success('Tạo người dùng thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUser(id).unwrap();
          message.success('Xóa người dùng thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa người dùng!');
          console.error(error);
        }
      },
    });
  };

  const columns: ColumnType<User>[] = [
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
    {      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: { id: number; name: string; } | null) => {
        return role?.name || 'Chưa được phân quyền';
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: User) => (
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
            onClick={() => handleDelete(record.id)}
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
        actionColumn.render = (_: unknown, record: User) => (
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
              onClick={() => handleDelete(record.id)}
            />
          </Space>
        );
      }
    }
    
    return responsiveColumns;
  };

  // State to track responsive columns
  const [responsiveColumns, setResponsiveColumns] = useState(() => getResponsiveColumns());

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
              { required: !editingUser, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input readOnly={!!editingUser} />
          </Form.Item>
          
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item        name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              {rolesData?.data?.result?.map((role: Role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>  
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>    </div>  );
};

export default UsersManagement;
   