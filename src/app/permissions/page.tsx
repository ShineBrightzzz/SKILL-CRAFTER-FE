'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Typography,
  Card,
} from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPermissions } from '@/store/slices/permissionSlice';
import Sidebar from '@/layouts/sidebar';
import {
  useGetPermissionsQuery,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useCreatePermissionMutation,
} from '@/services/permission.service';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading'; // Import the Loading component
import ErrorHandler from '@/components/ErrorHandler'; // Import the ErrorHandler component
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import withPermission from '@/hocs/withPermission';

const { Option } = Select;

const PermissionTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const permissions = useAppSelector((state) => state.permission.permissions);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [form] = Form.useForm();
  const ability = useAbility();
  const [searchText, setSearchText] = useState('');

  const { data: permissionsData, isLoading, error } = useGetPermissionsQuery(); // Include error handling
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [createPermission] = useCreatePermissionMutation();

  useEffect(() => {
    if (permissionsData) {
      dispatch(setPermissions(permissionsData.data.data));
    }
  }, [permissionsData, dispatch]);

  // Filter permissions based on search text
  const filteredPermissions = permissions.filter((permission: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    return (
      (permission.name && permission.name.toLowerCase().includes(searchTermLower)) ||
      (permission.apiPath && permission.apiPath.toLowerCase().includes(searchTermLower)) ||
      (permission.method && permission.method.toLowerCase().includes(searchTermLower)) ||
      (permission.module && permission.module.toLowerCase().includes(searchTermLower))
    );
  });

  const handleEdit = (record: any) => {
    setEditingPermission(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingPermission(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePermission({ id }).unwrap();
      message.success('Permission deleted successfully');
    } catch (error) {
      message.error('Failed to delete permission');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingPermission) {
        await updatePermission({ id: editingPermission.id, body: values }).unwrap();
        message.success('Permission updated successfully');
      } else {
        await createPermission({ body: values }).unwrap();
        message.success('Permission added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Something went wrong');
    }
  };

  const methodColor = (method: string) => {
    switch (method) {
      case 'POST':
        return 'green';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      case 'GET':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const baseColumns: ColumnsType<any> = [
    { title: 'Tên quyền hạn', dataIndex: 'name', key: 'name' },
    { title: 'Đường dẫn API', dataIndex: 'apiPath', key: 'apiPath' },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => <span style={{ color: methodColor(text) }}>{text}</span>,
    },
    { title: 'Module', dataIndex: 'module', key: 'module' },
  ];

  const columns: ColumnsType<any> = [...baseColumns];

  if (
    ability.can(Action.Update, Subject.Permission) ||
    ability.can(Action.Delete, Subject.Permission)
  ) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Permission) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {ability.can(Action.Delete, Subject.Permission) && (
            <Popconfirm
              title="Are you sure to delete this permission?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
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

  // Check for errors and handle them
  if (error) {
    const status = (error as any).status || 500; // Default to 500 if no status is provided
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {isLoading ? (
          <Loading message="Đang tải danh sách quyền hạn..." />
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Title level={2} className="mb-6 text-center">
                Danh sách Permissions (Quyền hạn)
              </Typography.Title>
              {ability.can(Action.Create, Subject.Permission) && (
                <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
                  Thêm mới
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Tìm kiếm quyền hạn..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredPermissions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            <Modal
              title={editingPermission ? 'Sửa Permission' : 'Tạo mới Permission'}
              open={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              onOk={handleOk}
              width={800}
            >
              <Form form={form} layout="vertical">
                <Form.Item label="Tên Permission" name="name" rules={[{ required: true }]}>
                  <Input placeholder="Nhập tên Permission" />
                </Form.Item>

                <Form.Item label="API Path" name="apiPath" rules={[{ required: true }]}>
                  <Input placeholder="Nhập path" />
                </Form.Item>

                <Form.Item label="Method" name="method" rules={[{ required: true }]}>
                  <Select placeholder="Chọn Method">
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Thuộc Module" name="module" rules={[{ required: true }]}>
                  <Select placeholder="Chọn Module">
                    <Option value="Quản lý sinh viên">Quản lý sinh viên</Option>
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

export default withPermission(PermissionTable, Action.Read, Subject.Permission);