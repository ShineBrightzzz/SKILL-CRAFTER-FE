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
  const dispatch = useAppDispatch();
  const permissions = useAppSelector((state) => state.permission.permissions);

  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [form] = Form.useForm();

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

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || null);
    setSortOrder(sorter.order || null);
  };

  const filteredPermissions = permissions.filter((permission: any) => {
    const searchTermLower = searchText.toLowerCase();
    return (
      permission.name?.toLowerCase().includes(searchTermLower) ||
      permission.apiPath?.toLowerCase().includes(searchTermLower) ||
      permission.method?.toLowerCase().includes(searchTermLower) ||
      permission.module?.toLowerCase().includes(searchTermLower)
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
      message.success('Xóa quyền hạn thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Lỗi khi xóa quyền hạn');
    }
  };

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

  const methodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'green';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'GET': return 'blue';
      default: return 'gray';
    }
  };

  const baseColumns: ColumnsType<any> = [
    { title: 'Tên quyền hạn', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Đường dẫn API', dataIndex: 'apiPath', key: 'apiPath', ellipsis: true },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => <span style={{ color: methodColor(text) }}>{text}</span>,
      filters: ['GET', 'POST', 'PUT', 'DELETE'].map(method => ({ text: method, value: method })),
      onFilter: (value, record) => record.method === value,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      filters: Array.from(new Set(permissions.map((p: any) => p.module))).filter(Boolean).map(m => ({ text: m, value: m })),
      onFilter: (value, record) => record.module === value,
    },
  ];

  const columns: ColumnsType<any> = [...baseColumns];
  if (ability.can(Action.Update, Subject.Permission) || ability.can(Action.Delete, Subject.Permission)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex flex-wrap justify-center gap-2">
          {ability.can(Action.Update, Subject.Permission) && (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {ability.can(Action.Delete, Subject.Permission) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa quyền hạn này?"
              onConfirm={() => handleDelete(record.id)}
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

  if (error) return <Sidebar><ErrorHandler status={(error as any).status || 500} /></Sidebar>;

  const modules = Array.from(new Set(permissions.map((p: any) => p.module))).filter(Boolean);

  return (
    <Sidebar>
      <div className="p-6 max-w-screen-xl mx-auto w-full">
        {isLoading ? (
          <Loading message="Đang tải danh sách quyền hạn..." />
        ) : (
          <>
            <Typography.Title level={2} className="mb-4">Danh sách quyền hạn</Typography.Title>

            <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Input
                placeholder="Tìm kiếm quyền hạn..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="w-full sm:w-80"
              />
              {ability.can(Action.Create, Subject.Permission) && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
              )}
            </div>

            <Card className="overflow-auto">
              <Table
                columns={columns}
                dataSource={filteredPermissions}
                rowKey="id"
                pagination={{ pageSize, current: currentPage, total: filteredPermissions.length, onChange: setCurrentPage, onShowSizeChange: (_, size) => setPageSize(size) }}
                onChange={handleTableChange}
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
                <Form.Item label="Tên Permission" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên quyền hạn' }]}><Input /></Form.Item>
                <Form.Item label="API Path" name="apiPath" rules={[{ required: true, message: 'Vui lòng nhập đường dẫn API' }]}><Input /></Form.Item>
                <Form.Item label="Method" name="method" rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}>
                  <Select>{['GET','POST','PUT','DELETE'].map(m => <Option key={m} value={m}>{m}</Option>)}</Select>
                </Form.Item>
                <Form.Item label="Thuộc Module" name="module" rules={[{ required: true, message: 'Vui lòng chọn module' }]}>
                  <Select>
                    {modules.map(m => <Option key={m} value={m}>{m}</Option>)}
                    <Option value="New">Thêm module mới</Option>
                  </Select>
                </Form.Item>
                {form.getFieldValue('module') === 'New' && (
                  <Form.Item label="Module mới" name="newModule" rules={[{ required: true, message: 'Vui lòng nhập tên module mới' }]}><Input /></Form.Item>
                )}
              </Form>
            </Modal>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(PermissionTable, Action.Read, Subject.Permission);