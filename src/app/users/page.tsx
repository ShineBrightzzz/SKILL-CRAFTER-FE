'use client';

import React, { useState } from 'react';
import { Table, Card, Input, Typography, Tag, Button, Modal, Form, Select, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '@/layouts/sidebar';
import { 
  useGetAllUserQuery, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useCreateUserMutation 
} from '@/services/user.service';
import { useGetRoleQuery } from '@/services/role.service';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';

const UsersManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  
  // Fetch users data
  const { data: usersResponse, isLoading, error, refetch } = useGetAllUserQuery(undefined); // Pass undefined explicitly to match the expected argument structure
  
  // Fetch roles data for dropdown
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];
  
  // Mutations for updating and deleting users
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser] = useCreateUserMutation();
  
  const ability = useAbility();
  
  // Extract users from the response
  const users = usersResponse?.data?.data || [];

  // Filter users based on search text
  const filteredUsers = users.filter((user: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchTermLower)) ||
      (user.studentId && user.studentId.toLowerCase().includes(searchTermLower)) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchTermLower))
    );
  });

  // Open edit modal with user data
  const openEditModal = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      studentId: user.studentId,
      roleId: user.roleId,
    });
    setModalVisible(true);
  };

  // Open create modal
  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // Handle form submission for editing user
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await updateUser({ 
        username: editingUser.username, 
        body: {
          ...values
        }
      }).unwrap();
      
      message.success('Cập nhật người dùng thành công');
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Handle user deletion
  const handleDelete = async (username: string) => {
    try {
      await deleteUser({ username }).unwrap();
      message.success('Xóa người dùng thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi xóa người dùng');
    }
  };

  // Handle create user form submission
  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      
      await createUser({ 
        body: values 
      }).unwrap();
      
      message.success('Tạo tài khoản người dùng thành công');
      setCreateModalVisible(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating user:', error);
      message.error(error?.data?.message || 'Có lỗi khi tạo người dùng');
    }
  };

  // Define table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Mã số sinh viên',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId: string) => studentId || 'N/A',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName: string) => (
        <Tag color={
          roleName === 'ADMIN' ? 'gold' :
          roleName === 'LỚP TRƯỞNG' ? 'green' :
          'blue'
        }>
          {roleName}
        </Tag>
      ),
    },
  ];

  // Add actions column if user has permission
  if (ability.can(Action.Update, Subject.Account) || ability.can(Action.Delete, Subject.Account)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Account) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          )}
          {ability.can(Action.Delete, Subject.Account) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này không?"
              onConfirm={() => handleDelete(record.username)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }
  console.log(error)
  // Check for errors and handle them
  if (error) {
    const status = (error as any)?.status || 500;
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="p-4 shadow-lg rounded w-full sm:max-w-2xl">
          <Typography.Title level={2} className="text-center sm:text-left">Danh sách Người dùng</Typography.Title>
          <Card className="shadow-md">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
              <Input
                placeholder="Tìm kiếm người dùng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", maxWidth: "300px" }}
                allowClear
              />
              {ability.can(Action.Create, Subject.Account) && (
                <Button 
                  type="primary" 
                  onClick={openCreateModal}
                  icon={<PlusOutlined />}
                  className="mt-4 sm:mt-0 sm:ml-4"
                >
                  Thêm tài khoản
                </Button>
              )}
            </div>
            <Table
              dataSource={filteredUsers}
              columns={columns}
              rowKey="username"
              pagination={{ pageSize: 10 }}
              className="w-full"
            />
          </Card>

          {/* Edit User Modal */}
          <Modal
            title="Sửa thông tin người dùng"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleSubmit}
            width={600}
          >
            <Form layout="vertical" form={form}>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}> 
                <Input disabled />
              </Form.Item>
              <Form.Item name="studentId" label="Student ID">
                <Input />
              </Form.Item>
              <Form.Item name="roleId" label="Role" rules={[{ required: true }]}> 
                <Select>
                  {roles.map((role: any) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          {/* Create User Modal */}
          <Modal
            title="Tạo tài khoản mới"
            open={createModalVisible}
            onCancel={() => setCreateModalVisible(false)}
            onOk={handleCreateUser}
            width={600}
          >
            <Form layout="vertical" form={createForm}>
              <Form.Item 
                name="username" 
                label="Username" 
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item 
                name="password" 
                label="Password" 
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item name="studentId" label="Student ID">
                <Input />
              </Form.Item>
              <Form.Item 
                name="roleId" 
                label="Role" 
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select>
                  {roles.map((role: any) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </Sidebar>
  );
};

export default withPermission(UsersManagement, Action.Read, Subject.Account);