import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button } from 'antd';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: any) => void;
  initialValues?: any;
  isEditing?: boolean;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && isOpen) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        active: initialValues.active,
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [initialValues, isOpen, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {isEditing ? 'Lưu thay đổi' : 'Thêm'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên vai trò"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
        >
          <Input placeholder="Nhập tên vai trò" />
        </Form.Item>

        <Form.Item
          label="Miêu tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập miêu tả!' }]}
        >
          <Input.TextArea placeholder="Nhập miêu tả vai trò" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="active"
          valuePropName="checked"
        >
          <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoleModal;