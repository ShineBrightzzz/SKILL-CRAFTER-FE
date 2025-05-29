'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  useGetAllPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  Permission
} from '@/services/permission.service';

const PermissionsManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  
  const { data: permissionsData, isLoading, refetch } = useGetAllPermissionsQuery({});
  const [createPermission] = useCreatePermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();

  const showModal = (permission?: Permission) => {
    if (permission) {
      setEditingPermission(permission);
      form.setFieldsValue({
        name: permission.name,
        apiPath: permission.apiPath,
        method: permission.method,
        module: permission.module,
      });
    } else {
      setEditingPermission(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPermission) {
        await updatePermission({ id: editingPermission.id, body: values }).unwrap();
        message.success('Cập nhật quyền thành công!');
      } else {
        await createPermission({ body: values }).unwrap();
        message.success('Tạo quyền mới thành công!');
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
      title: 'Bạn có chắc chắn muốn xóa quyền này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deletePermission({ id }).unwrap();
          message.success('Xóa quyền thành công!');
          refetch();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa quyền!');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'API Path',
      dataIndex: 'apiPath',
      key: 'apiPath',
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    {      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Permission) => (
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
      // Remove apiPath column on small screens
      responsiveColumns = responsiveColumns.filter(col => col.key !== 'apiPath');
      
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
          Thêm quyền mới
        </Button>
      </div>

      <Table 
        columns={responsiveColumns} 
        dataSource={permissionsData?.data?.result || []} 
        rowKey="id" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingPermission ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '520px'}
        style={{ top: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 100 }}
        bodyStyle={{ maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 200px)' : 'auto', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="name"
            label="Tên quyền"
            rules={[
              { required: true, message: 'Vui lòng nhập tên quyền!' },
              { min: 3, message: 'Tên quyền phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="apiPath"
            label="API Path"
            rules={[{ required: true, message: 'Vui lòng nhập API Path!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="method"
            label="Phương thức"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức!' }]}
          >
            <Select
              placeholder="Chọn phương thức"
              style={{ width: '100%' }}
              getPopupContainer={trigger => trigger.parentElement}
            >
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: 'Vui lòng nhập tên module!' }]}
          >
            <Input />
          </Form.Item>
          
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
                {editingPermission ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionsManagement;
