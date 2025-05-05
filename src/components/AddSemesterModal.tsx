'use client';

import { Modal, Form, InputNumber, DatePicker, Button, FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSemester: (semester: {
    number: number;
    year: number;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void; // Added onCancel prop
  onSubmit: (values: any) => Promise<void>; // Added onSubmit prop
  form: FormInstance<any>; // Added form prop
}

const AddSemesterModal: React.FC<AddSemesterModalProps> = ({
  isOpen,
  onClose,
  onAddSemester,
}) => {
  const [form] = Form.useForm();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
        };
        onAddSemester(formattedValues);
        form.resetFields();
        onClose();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm học kỳ mới"
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={isMobile ? '100%' : 700}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Thêm
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Học kỳ (số)"
          name="number"
          rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
        >
          <InputNumber min={1} max={3} style={{ width: '100%', fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Năm"
          name="year"
          rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}
        >
          <InputNumber min={2000} max={2100} style={{ width: '100%', fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu"
          name="startTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
        >
          <DatePicker style={{ width: '100%', fontSize: isMobile ? '14px' : '16px' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Ngày kết thúc"
          name="endTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
        >
          <DatePicker style={{ width: '100%', fontSize: isMobile ? '14px' : '16px' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSemesterModal;
