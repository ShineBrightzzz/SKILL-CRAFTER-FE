import React from 'react';
import { Form, Input, Button, Space } from 'antd';

interface CommentReplyFormProps {
  onSubmit: (values: { content: string }) => void;
  onCancel: () => void;
}

const CommentReplyForm: React.FC<CommentReplyFormProps> = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { content: string }) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <div className="ml-8 mt-2">
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="content"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Viết trả lời của bạn..."
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Gửi trả lời
            </Button>
            <Button onClick={onCancel}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentReplyForm;
