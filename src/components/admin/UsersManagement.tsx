'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Pagination } from 'antd';
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

interface UserFormData {
  username?: string;
  email?: string;
  familyName?: string;
  givenName?: string;
  password?: string;
  role?: string; // Changed from number to string to match AccountUpdateDTO
}

const UsersManagement: React.FC = () => {
  const [form] = Form.useForm<UserFormData>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersResponse, isLoading, error, refetch } = useGetAllAccountsQuery({
    page: currentPage,
    size: pageSize,
    search: searchTerm.trim()
  });
  const { data: rolesData } = useGetAllRolesQuery({} as PaginationParams);
  const [createUser] = useCreateAccountMutation();
  const [updateUser] = useUpdateAccountMutation();
  const [deleteUser] = useDeleteAccountMutation();

  // Add error handling
  useEffect(() => {
    if (error) {
      message.error('Có lỗi khi tải dữ liệu người dùng');
      console.error('Users load error:', error);
    }
  }, [error]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Extract users and pagination metadata
  const users = usersResponse?.data?.result || [];
  const paginationMeta = usersResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1,
    total: 0
  };

  const showModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        familyName: user.familyName,
        givenName: user.givenName,
        role: user.role?.id ? String(user.role.id) : undefined
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
            email: values.email,
            fullName: `${values.familyName || ''} ${values.givenName || ''}`.trim(),
            role: values.role
          }
        }).unwrap();
        message.success('Cập nhật người dùng thành công!');
      } else {
        if (!values.username || !values.password) {
          message.error('Tên đăng nhập và mật khẩu là bắt buộc!');
          return;
        }
        await createUser({
          username: values.username!,
          password: values.password!,
          email: values.email || '',
          fullName: `${values.familyName || ''} ${values.givenName || ''}`.trim()
        }).unwrap();
        
        // If role is provided, we need to set it separately
        if (values.role) {
          // Additional logic to set role if needed
          console.log("Role setting would be handled separately:", values.role);
        }
        message.success('Tạo người dùng thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ',
      dataIndex: 'familyName',
      key: 'familyName',
    },
    {
      title: 'Tên',
      dataIndex: 'givenName',
      key: 'givenName',
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (text: string, record: User) => record.role?.name || 'Chưa có vai trò'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button 
            type="default" 
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

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Thêm người dùng mới
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          allowClear
          enterButton
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {error ? (
        <div className="text-center text-red-500 my-4">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          <Button onClick={() => refetch()} className="ml-2">
            Thử lại
          </Button>
        </div>      ) : (
        <Table
          columns={columns as any}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          locale={{
            emptyText: searchTerm 
              ? 'Không tìm thấy người dùng phù hợp với từ khóa tìm kiếm' 
              : 'Chưa có người dùng nào'
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: paginationMeta.total,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} người dùng`
          }}
        />
      )}

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: !editingUser, message: 'Vui lòng nhập tên đăng nhập!' }
            ]}
          >
            <Input disabled={!!editingUser} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="familyName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            name="givenName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
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
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item className="mb-0 flex justify-end">
            <Space>
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
