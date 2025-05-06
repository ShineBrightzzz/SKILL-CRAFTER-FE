'use client';

import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import Sidebar from '@/layouts/sidebar';
import {
  useGetAllUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
} from '@/services/user.service';
import { useGetRoleQuery } from '@/services/role.service';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';

const { Title } = Typography;

const UsersManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const { data: usersResponse, isLoading, error, refetch } = useGetAllUserQuery(undefined);
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser] = useCreateUserMutation();
  const ability = useAbility();

  const users = usersResponse?.data?.data || [];

  const filteredUsers = users.filter((user: any) => {
    const term = searchText.toLowerCase();
    return (
      user.username?.toLowerCase().includes(term) ||
      user.studentId?.toLowerCase().includes(term) ||
      user.roleName?.toLowerCase().includes(term)
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
      await updateUser({ username: editingUser.username, body: values }).unwrap();
      toast.success('Cập nhật người dùng thành công');
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (username: string) => {
    try {
      await deleteUser({ username }).unwrap();
      toast.success('Xóa người dùng thành công');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi khi xóa người dùng');
    }
  };

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser({ body: values }).unwrap();
      toast.success('Tạo tài khoản người dùng thành công');
      setCreateModalVisible(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi khi tạo người dùng');
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
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role: string) => (
        <Tag color={
          role === 'ADMIN' ? 'gold' :
          role === 'LỚP TRƯỞNG' ? 'green' :
          'blue'
        }>
          {role}
        </Tag>
      ),
    },
    {
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
    },
  ];

  if (error) {
    return (
      <Sidebar>
        <ErrorHandler status={(error as any)?.status || 500} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoading || isLoadingRoles ? (
          <Loading message="Đang tải danh sách người dùng..." />
        ) : (
          <>
            <Typography.Title
              level={2}
              className="mb-4 text-xl sm:text-2xl md:text-3xl"
            >
              Danh sách users
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2 ">
              <div className="flex-grow">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                  allowClear
                />
              </div>

              {ability.can(Action.Create, Subject.Account) && (
                <div className="flex-shrink-0">
                  {isSmallScreen ? (
                    <Tooltip title="Thêm tài khoản">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                        className="min-w-[40px]"
                      />
                    </Tooltip>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateModalVisible(true)}
                    >
                      Thêm tài khoản
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Card className="overflow-auto">
              <Table
                dataSource={filteredUsers}
                columns={columns}
                rowKey="username"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
              />
            </Card>

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
    </Sidebar>
  );
};

export default withPermission(UsersManagement, Action.Read, Subject.Account);
