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
  Layout,
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
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Content } = Layout;

const PermissionTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const permissions = useAppSelector((state) => state.permission.permissions);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [form] = Form.useForm();
  const ability = useAbility();

  const { data: permissionsData } = useGetPermissionsQuery();
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [createPermission] = useCreatePermissionMutation();

  useEffect(() => {
    if (permissionsData) {
      dispatch(setPermissions(permissionsData.data.data));
    }
  }, [permissionsData, dispatch]);

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
      await deletePermission(id).unwrap();
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'API', dataIndex: 'apiPath', key: 'apiPath' },
    {
      title: 'Method',
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {ability.can(Action.Create, Subject.Permission) && (
            <Button type="link" onClick={() => handleEdit(record)}>✏️</Button>
          )}
          {ability.can(Action.Delete, Subject.Permission) && (
            <Popconfirm
              title="Are you sure to delete this permission?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>🗑️</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h3>Danh sách Permissions (Quyền hạn)</h3>
          {ability.can(Action.Create, Subject.Permission) && (
            <Button type="primary" onClick={handleAdd}>+ Thêm mới</Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={permissions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

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
      </div>
    </Sidebar>
  );
};

export default withPermission(PermissionTable, Action.Read, Subject.Permission);
