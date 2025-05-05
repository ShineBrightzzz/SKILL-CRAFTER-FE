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

  const { data: usersResponse, isLoading, error, refetch } = useGetAllUserQuery(undefined);
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser] = useCreateUserMutation();
  const ability = useAbility();
  const users = usersResponse?.data?.data || [];

  const filteredUsers = users.filter((user: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchTermLower)) ||
      (user.studentId && user.studentId.toLowerCase().includes(searchTermLower)) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchTermLower))
    );
  });

  const openEditModal = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      studentId: user.studentId,
      roleId: user.roleId,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateUser({ username: editingUser.username, body: { ...values } }).unwrap();
      message.success('Cập nhật người dùng thành công');
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (username: string) => {
    try {
      await deleteUser({ username }).unwrap();
      message.success('Xóa người dùng thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi xóa người dùng');
    }
  };

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser({ body: values }).unwrap();
      message.success('Tạo tài khoản người dùng thành công');
      setCreateModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi tạo người dùng');
    }
  };

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

  if (ability.can(Action.Update, Subject.Account) || ability.can(Action.Delete, Subject.Account)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Account) && (
            <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {ability.can(Action.Delete, Subject.Account) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này không?"
              onConfirm={() => handleDelete(record.username)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

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
      <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 bg-[#f8f9fa]">
        <div className="p-4 shadow-lg rounded w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-4xl">
          <Typography.Title level={2} className="text-center sm:text-left">Danh sách Người dùng</Typography.Title>

          {isLoading || isLoadingRoles ? (
            <Loading message="Đang tải danh sách người dùng..." />
          ) : (
            <>
              <Card className="shadow-md">
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full sm:w-72"
                    allowClear
                  />
                  {ability.can(Action.Create, Subject.Account) && (
                    <Button 
                      type="primary" 
                      onClick={openCreateModal}
                      icon={<PlusOutlined />}
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
            </>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default withPermission(UsersManagement, Action.Read, Subject.Account);