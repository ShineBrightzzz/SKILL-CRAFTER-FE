'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Collapse, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
} from '@/services/role.service';
import { useGetAllPermissionsQuery } from '@/services/permission.service';

const { Panel } = Collapse;

const RolesManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const { data: rolesData, isLoading, refetch } = useGetAllRolesQuery({});
  const { data: allPermissions } = useGetAllPermissionsQuery({});
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();  const { data: rolePermissions, refetch: refetchPermissions } = useGetRolePermissionsQuery(
    editingRole?.id ?? 'skip', 
    { skip: !editingRole?.id }
  );

  // Group permissions by module
  const groupedPermissions = React.useMemo(() => {
    if (!allPermissions?.data?.result) return {};
    
    return allPermissions.data.result.reduce((acc: { [key: string]: any[] }, permission) => {
      const module = permission.module || 'Other';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  }, [allPermissions]);
  const showModal = (role?: any) => {
    setEditingRole(role);
    form.setFieldsValue(role ? {
      name: role.name,
      description: role.description,
      active: role.active,
    } : undefined);
    
    if (!role) {
      setSelectedPermissions([]);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Update selectedPermissions when rolePermissions changes
  useEffect(() => {
    if (rolePermissions?.data) {
      setSelectedPermissions(rolePermissions.data.map((p: { id: string }) => p.id));
    }
  }, [rolePermissions]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked 
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedPermissions([]);
  };  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        active: values.active,
        permissionIds: selectedPermissions
      };

      if (editingRole) {
        await updateRole({ id: editingRole.id, body: submitData }).unwrap();
        message.success('Cập nhật vai trò thành công!');
      } else {
        await createRole({ body: submitData }).unwrap();
        message.success('Tạo vai trò mới thành công!');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa vai trò này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteRole({ id }).unwrap();
          message.success('Xóa vai trò thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa vai trò!');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Switch checked={active} disabled />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Set up responsive columns
  const getResponsiveColumns = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    let responsiveColumns = [...columns];
    
    if (isMobile) {
      // Remove description column on small screens
      responsiveColumns = responsiveColumns.filter(col => col.key !== 'description');
      
      // Simplify action buttons on mobile
      const actionColumn = responsiveColumns.find(col => col.key === 'action');
      if (actionColumn) {
        actionColumn.render = (_, record: any) => (
          <Space size="small">
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Space>
        );
      }
    }
    
    return responsiveColumns;
  };

  // State to track responsive columns
  const [responsiveColumns, setResponsiveColumns] = useState(getResponsiveColumns());

  // Update columns when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      setResponsiveColumns(getResponsiveColumns());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
        gap: typeof window !== 'undefined' && window.innerWidth < 768 ? '10px' : '0'
      }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ alignSelf: typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex-start' : 'auto' }}
        >
          Thêm vai trò mới
        </Button>
      </div>

      <Table 
        columns={responsiveColumns} 
        dataSource={rolesData?.data?.result || []} 
        rowKey="id" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '720px'}
        style={{ top: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 100 }}
        bodyStyle={{ maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 200px)' : '700px', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[
              { required: true, message: 'Vui lòng nhập tên vai trò!' },
              { min: 3, message: 'Tên vai trò phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider>Quyền hạn</Divider>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            <Collapse>
              {Object.entries(groupedPermissions).map(([module, permissions]) => (
                <Panel header={module} key={module}>                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {permissions.map((permission: any) => (
                      <div key={permission.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          size="small"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(checked) => handlePermissionChange(permission.id, checked)}
                          disabled={!permission.active}
                        />
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '12px',
                          color: permission.active ? 'inherit' : '#999'
                        }}>
                          {permission.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
          
          <Form.Item>
            <div style={{ 
              display: 'flex', 
              justifyContent: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-end', 
              gap: '8px',
              flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
              width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto',
            }}>
              <Button 
                onClick={handleCancel}
                style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto' }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto' }}
              >
                {editingRole ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesManagement;
