'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  message,
  Card,
  Popconfirm,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '@/layouts/sidebar';
import {
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/role.service';
import { useGetPermissionsQuery } from '@/services/permission.service';
import { Collapse } from 'antd';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Text } = Typography;

const RoleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<{ [module: string]: any[] }>({});
  const [searchText, setSearchText] = useState('');

  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError, refetch } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];

  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = useGetPermissionsQuery();
  const permissions = permissionsData?.data?.data || [];

  const ability = useAbility();

  useEffect(() => {
    if (permissions.length > 0) {
      const grouped: { [key: string]: any[] } = {};
      permissions.forEach((perm: any) => {
        if (!grouped[perm.module]) grouped[perm.module] = [];
        grouped[perm.module].push(perm);
      });
      setGroupedPermissions(grouped);
    }
  }, [permissions]);

  const filteredRoles = roles.filter((role: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    return (
      (role.name && role.name.toLowerCase().includes(searchTermLower)) ||
      (role.description && role.description.toLowerCase().includes(searchTermLower))
    );
  });

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const openEditModal = (role: any) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      active: role.active,
    });
    setSelectedPermissionIds(role.permissionIds || []);
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissionIds([]);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const rolePayload = {
        ...values,
        permissionIds: selectedPermissionIds,
        active: values.active || false,
      };

      if (editingRole) {
        await updateRole({ id: editingRole.id, body: rolePayload }).unwrap();
        message.success('Cập nhật thành công');
      } else {
        await createRole({ body: rolePayload }).unwrap();
        message.success('Tạo mới thành công');
      }

      setModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const stringId = id.toString();
      await deleteRole({ id: stringId }).unwrap();
      message.success('Xóa vai trò thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Lỗi khi xóa vai trò');
      refetch();
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  const renderPermissionGroups = () => (
    <Collapse>
      {Object.keys(groupedPermissions).map((mod) => (
        <Panel header={mod} key={mod}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {groupedPermissions[mod].map((perm) => (
              <div
                key={perm.id}
                className={`flex justify-between items-center p-3 rounded border transition-all ${selectedPermissionIds.includes(perm.id) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="max-w-[80%]">
                  <Text strong style={{ color: getMethodColor(perm.method) }}>{perm.method}</Text>{' '}
                  <Text>{perm.name}</Text><br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{perm.api}</Text>
                </div>
                <Switch size="small" checked={selectedPermissionIds.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </Collapse>
  );

  const columns: ColumnsType<any> = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Role) && (
            <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {ability.can(Action.Delete, Subject.Role) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vai trò này không?"
              onConfirm={() => handleDelete(record.id)}
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

  if (rolesError || permissionsError) {
    const status = (rolesError as any)?.status || (permissionsError as any)?.status || 500;
    return <Sidebar><ErrorHandler status={status} /></Sidebar>;
  }

  return (
    <Sidebar>
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoadingRoles || isLoadingPermissions ? (
          <Loading message="Đang tải dữ liệu vai trò và quyền hạn..." />
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Typography.Title level={2} className="text-center sm:text-left">
                Danh sách Roles (Vai Trò)
              </Typography.Title>
              {ability.can(Action.Create, Subject.Role) && (
                <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>
                  Thêm vai trò
                </Button>
              )}
            </div>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Input
                placeholder="Tìm kiếm vai trò..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-72"
                allowClear
              />
            </div>

            <Card className="overflow-auto">
              <Table
                dataSource={filteredRoles}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            <Modal
              title={editingRole ? 'Sửa Role' : 'Tạo mới Role'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={800}
            >
              <Form layout="vertical" form={form}>
                <Form.Item name="name" label="Tên Role" rules={[{ required: true }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Miêu tả" rules={[{ required: true }]}> <Input.TextArea /> </Form.Item>
                <Form.Item name="active" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
                </Form.Item>
              </Form>
              <h4>Quyền hạn</h4>
              {renderPermissionGroups()}
            </Modal>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(RoleManagement, Action.Read, Subject.Role);
