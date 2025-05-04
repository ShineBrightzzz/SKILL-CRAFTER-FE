import { Modal, Form, InputNumber, DatePicker, Button } from 'antd';
import React, { useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface EditSemesterModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: any;
  initialValues: any;
}

interface EditFormValues {
  number: number;
  year: number;
  startTime: Dayjs | null | undefined;
  endTime: Dayjs | null | undefined;
}

const EditSemesterModal: React.FC<EditSemesterModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  form,
  initialValues
}) => {
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        number: initialValues.number,
        year: initialValues.year,
        startTime: initialValues.startTime ? dayjs(initialValues.startTime) : undefined,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime) : undefined
      });
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa học kỳ"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Cập nhật
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          number: 1,
          year: new Date().getFullYear(),
        }}
      >
        <Form.Item
          name="number"
          label="Số học kỳ"
          rules={[{ required: true, message: 'Vui lòng nhập số học kỳ!' }]}
        >
          <InputNumber min={1} max={3} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="year"
          label="Năm học"
          rules={[{ required: true, message: 'Vui lòng nhập năm học!' }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="startTime"
          label="Thời gian bắt đầu"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="Thời gian kết thúc"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSemesterModal;
