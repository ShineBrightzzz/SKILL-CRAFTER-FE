'use client';

import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Switch, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '@/layouts/sidebar';
import {
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/role.service';

import { useGetPermissionsQuery } from '@/services/permission.service';
import { useAbility } from '@/contexts/AbilityContext';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';
import { Collapse, Typography } from 'antd';
const { Panel } = Collapse;
const { Text } = Typography;

const RoleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<{ [module: string]: any[] }>({});

  const { data: rolesData, refetch } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];

  const { data: permissionsData, isSuccess: isPermissionSuccess } = useGetPermissionsQuery();
  const permissions = permissionsData?.data?.data || [];

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const { ability } = useAbility();

  useEffect(() => {
    if (isPermissionSuccess && permissions.length > 0) {
      const grouped: { [key: string]: any[] } = {};
      permissions.forEach((perm: any) => {
        if (!grouped[perm.module]) grouped[perm.module] = [];
        grouped[perm.module].push(perm);
      });
      setGroupedPermissions(grouped);
    }
  }, [permissions, isPermissionSuccess]);

  const openEditModal = (role: any) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      status: role.status,
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
        status: values.status || false,
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

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa vai trò này?',
      onOk: async () => {
        try {
          await deleteRole(id).unwrap();
          message.success('Đã xóa');
          refetch();
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const renderPermissionGroups = () => {
    return (
      <Collapse>
        {Object.keys(groupedPermissions).map((mod) => (
          <Panel header={mod} key={mod}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              paddingTop: 8 
            }}>
              {groupedPermissions[mod].map((perm) => (
                <div
                  key={perm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: selectedPermissionIds.includes(perm.id)
                      ? '#e6f7ff'
                      : '#fafafa',
                  }}
                >
                  <div style={{ maxWidth: '80%' }}>
                    <Text strong style={{ color: getMethodColor(perm.method) }}>
                      {perm.method}
                    </Text>{' '}
                    <Text>{perm.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {perm.api}
                    </Text>
                  </div>
                  <Switch
                    size="small"
                    checked={selectedPermissionIds.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const baseColumns: ColumnsType<any> = [
    { title: 'Id', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    { title: 'CreatedAt', dataIndex: 'createdAt' },
    { title: 'UpdatedAt', dataIndex: 'updatedAt' },
  ];
  
  const columns: ColumnsType<any> = [...baseColumns];
  
  // if (
  //   ability.can(Action.Update, Subject.Role) ||
  //   ability.can(Action.Delete, Subject.Role)
  // ) 
  {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <>
          {/* {ability.can(Action.Update, Subject.Role) && ( */}
            <Button type="link" onClick={() => openEditModal(record)}>✏️</Button>
          {/* )} */}
          {/* {ability.can(Action.Delete, Subject.Role) && ( */}
            <Button type="link" danger onClick={() => handleDelete(record.id)}>🗑</Button>
          {/* )} */}
        </>
      ),
    });
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h3>Danh sách Roles (Vai Trò)</h3>
          {/* {ability.can(Action.Create, Subject.Role) && ( */}
          <Button type="primary" onClick={openCreateModal}>+ Thêm mới</Button>
          {/* )} */}
        </div>
        {/* {ability.can('read','Role') &&  */}
        <Table dataSource={roles} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        

        <Modal
          title={editingRole ? 'Sửa Role' : 'Tạo mới Role'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          width={800}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Tên Role" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Miêu tả" rules={[{ required: true }]}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
            </Form.Item>
          </Form>
          <h4>Quyền hạn</h4>
          {renderPermissionGroups()}
        </Modal>
      </div>
    </Sidebar>
  );
};

//export default withPermission(RoleManagement, Action.Read, Subject.Role);
export default RoleManagement;
