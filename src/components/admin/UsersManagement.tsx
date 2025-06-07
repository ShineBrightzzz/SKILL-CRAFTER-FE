'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Pagination } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  useGetAllAccountsQuery, 
  useCreateAccountMutation,
  useAssignRoleMutation,
  User,
  RegisterAccountDTO,
  RoleAssignmentDTO
} from '@/services/user.service';
import { 
  useGetAllRolesQuery, 
  Role, 
  PaginationParams 
} from '@/services/role.service';
import type { ColumnType } from 'antd/es/table';

interface UserFormData {
  username: string;
  email: string;
  familyName: string;
  givenName: string;
  password: string;
  role?: string;
}

interface RoleFormData {
  role: number;
}

const UsersManagement: React.FC = () => {
  const [createForm] = Form.useForm<UserFormData>();
  const [roleForm] = Form.useForm<RoleFormData>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignRoleModalVisible, setIsAssignRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersResponse, isLoading, error, refetch } = useGetAllAccountsQuery({
    page: currentPage,
    size: pageSize,
    search: searchTerm.trim()
  });
  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery({
    page: 1,
    size: 1000 // Load nhiều roles để đảm bảo lấy được tất cả
  });
  const [createUser] = useCreateAccountMutation();
  const [assignRole] = useAssignRoleMutation();
  useEffect(() => {
    if (error) {
      message.error('Có lỗi khi tải dữ liệu người dùng');
      console.error('Users load error:', error);
    }
  }, [error]);
  const users = usersResponse?.data?.result || [];
  const paginationMeta = usersResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1,    total: 0
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const showCreateModal = () => {
    createForm.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    createForm.resetFields();
  };

  const handleSubmit = async (values: UserFormData) => {
    try {
      const newUser: RegisterAccountDTO = {
        username: values.username,
        password: values.password,
        email: values.email,
        fullName: `${values.familyName} ${values.givenName}`.trim()
      };

      await createUser(newUser).unwrap();
      message.success('Tạo người dùng thành công!');
      setIsModalVisible(false);
      createForm.resetFields();
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo người dùng!');
      console.error(error);
    }
  };  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    roleForm.setFieldsValue({
      role: user.roleId ? user.roleId : undefined
    });
    setIsAssignRoleModalVisible(true);
  };

  const handleAssignRoleSubmit = async (values: RoleFormData) => {
    if (!selectedUser) return;

    try {      const roleAssignment: RoleAssignmentDTO = {
        roleId: String(values.role)
      };

      await assignRole({ 
        accountId: selectedUser.id, 
        body: roleAssignment
      }).unwrap();
      message.success('Cập nhật vai trò thành công!');
      setIsAssignRoleModalVisible(false);
      roleForm.resetFields();
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật vai trò!');
      console.error(error);
    }
  };

  const handleAssignRoleCancel = () => {
    setIsAssignRoleModalVisible(false);
    roleForm.resetFields();
    setSelectedUser(null);
  };
  const columns: any[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      ellipsis: true
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Họ',
      dataIndex: 'familyName',
      key: 'familyName'
    },
    {
      title: 'Tên',
      dataIndex: 'givenName',
      key: 'givenName'
    },    {
      title: 'Vai trò',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId: number | null) => {
        if (!roleId) return 'Chưa có vai trò';
        
        // Tìm role dựa trên roleId (so sánh number với number)
        const role = rolesData?.data?.result?.find((r: Role) => r.id === roleId);
        return role?.name || 'Không tìm thấy vai trò';
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Button 
          type="primary" 
          icon={<UserOutlined />} 
          onClick={() => handleAssignRole(record)}
        >
          Phân quyền
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateModal}
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
        </div>
      ) : (
        <Table
          columns={columns}
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

      {/* Modal thêm người dùng mới */}
      <Modal
        title="Thêm người dùng mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
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
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal phân quyền */}
      <Modal
        title="Phân quyền người dùng"
        open={isAssignRoleModalVisible}
        onCancel={handleAssignRoleCancel}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleAssignRoleSubmit}
        >
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

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={handleAssignRoleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersManagement;