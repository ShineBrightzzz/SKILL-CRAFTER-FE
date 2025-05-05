'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
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
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import withPermission from '@/hocs/withPermission';

const { Option } = Select;

const PermissionTable: React.FC = () => {
  // Redux state management
  const dispatch = useAppDispatch();
  const permissions = useAppSelector((state) => state.permission.permissions);
  
  // Table states
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  
  // Form states
  const [form] = Form.useForm();
  
  // Data fetching states
  const { data: permissionsData, isLoading, error, refetch } = useGetPermissionsQuery();
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [createPermission] = useCreatePermissionMutation();
  
  const ability = useAbility();

  useEffect(() => {
    if (permissionsData) {
      dispatch(setPermissions(permissionsData.data.data));
    }
  }, [permissionsData, dispatch]);

  // Handle table pagination change
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

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

  // Handle edit button click
  const handleEdit = (record: any) => {
    setEditingPermission(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Handle add button click
  const handleAdd = () => {
    setEditingPermission(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle delete permission
  const handleDelete = async (id: string) => {
    try {
      await deletePermission({ id }).unwrap();
      message.success('Xóa quyền hạn thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Lỗi khi xóa quyền hạn');
    }
  };

  // Handle form submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingPermission) {
        await updatePermission({ id: editingPermission.id, body: values }).unwrap();
        message.success('Cập nhật quyền hạn thành công');
      } else {
        await createPermission({ body: values }).unwrap();
        message.success('Thêm quyền hạn thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Get color for HTTP method
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

  // Define table columns
  const baseColumns: ColumnsType<any> = [
    { 
      title: 'Tên quyền hạn', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    { 
      title: 'Đường dẫn API', 
      dataIndex: 'apiPath', 
      key: 'apiPath',
      ellipsis: true
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => <span style={{ color: methodColor(text) }}>{text}</span>,
      filters: [
        { text: 'GET', value: 'GET' },
        { text: 'POST', value: 'POST' },
        { text: 'PUT', value: 'PUT' },
        { text: 'DELETE', value: 'DELETE' },
      ],
      onFilter: (value, record) => record.method === value,
    },
    { 
      title: 'Module', 
      dataIndex: 'module', 
      key: 'module',
      filters: Array.from(new Set(permissions.map((p: any) => p.module)))
        .filter(Boolean)
        .map(module => ({ text: module, value: module })),
      onFilter: (value, record) => record.module === value,
    },
  ];

  const columns: ColumnsType<any> = [...baseColumns];

  // Add actions column if user has permission
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
              title="Bạn có chắc chắn muốn xóa quyền hạn này?"
              onConfirm={() => handleDelete(record.id)}
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

  // Check for errors and handle them
  if (error) {
    const status = (error as any).status || 500;
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  // Derive modules from permissions for dropdown
  const modules = Array.from(new Set(permissions.map((p: any) => p.module))).filter(Boolean);

  return (
    <Sidebar>
      <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="p-4 shadow-lg rounded w-full sm:max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <Typography.Title level={2} className="text-center sm:text-left">Danh sách Permissions (Quyền hạn)</Typography.Title>
            {ability.can(Action.Create, Subject.Permission) && (
              <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>Thêm mới</Button>
            )}
          </div>
          <Card className="shadow-md">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
              <Input
                placeholder="Tìm kiếm quyền hạn..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", maxWidth: "300px" }}
                allowClear
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredPermissions}
              rowKey="id"
              pagination={{ 
                pageSize: pageSize, 
                current: currentPage,
                total: filteredPermissions.length,
                onChange: (page) => setCurrentPage(page),
                onShowSizeChange: (_, size) => setPageSize(size)
              }}
              onChange={handleTableChange}
            />
          </Card>
        </div>
      </div>

      <Modal
        title={editingPermission ? 'Sửa Permission' : 'Tạo mới Permission'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên Permission" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên quyền hạn' }]}>
            <Input placeholder="Nhập tên Permission" />
          </Form.Item>

          <Form.Item label="API Path" name="apiPath" rules={[{ required: true, message: 'Vui lòng nhập đường dẫn API' }]}>
            <Input placeholder="Nhập path" />
          </Form.Item>

          <Form.Item label="Method" name="method" rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}>
            <Select placeholder="Chọn Method">
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Thuộc Module" name="module" rules={[{ required: true, message: 'Vui lòng chọn module' }]}>
            <Select placeholder="Chọn Module">
              {modules.map(module => (
                <Option key={module} value={module}>{module}</Option>
              ))}
              <Option value="Quản lý sinh viên">Quản lý sinh viên</Option>
              <Option value="New">Thêm module mới</Option>
            </Select>
          </Form.Item>
          
          {form.getFieldValue('module') === 'New' && (
            <Form.Item label="Module mới" name="newModule" rules={[{ required: true, message: 'Vui lòng nhập tên module mới' }]}>
              <Input placeholder="Nhập tên module mới" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Sidebar>
  );
};

export default withPermission(PermissionTable, Action.Read, Subject.Permission);