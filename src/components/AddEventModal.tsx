'use client';

import { Modal, Form, Input, DatePicker, Button, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useGetSemesterQuery } from '@/services/semester.service';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: {
    event_id: string;
    name: string;
    organizing_unit: string;
    start_time: string;
    end_time: string;
    description: string;
    location: string;
    parti_method: string;
    semester_id: string;
  }) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [form] = Form.useForm();
  const { data: semesterData, isLoading } = useGetSemesterQuery();
  const [semesters, setSemesters] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (semesterData?.data?.length) {
      const semesterOptions = semesterData.data.map((semester: any) => ({
        value: semester.id,
        label: `Kỳ ${semester.number} năm ${semester.year}`,
      }));
      setSemesters(semesterOptions);
    }
  }, [semesterData]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          start_time: values.start_time.format('YYYY-MM-DD HH:mm:ss'),
          end_time: values.end_time.format('YYYY-MM-DD HH:mm:ss'),
        };
        onAddEvent(formattedValues);
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
      title="Thêm sự kiện mới"
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
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
          label="Mã sự kiện"
          name="event_id"
          rules={[{ required: true, message: 'Vui lòng nhập mã sự kiện!' }]}
        >
          <Input placeholder="VD: EV01" />
        </Form.Item>

        <Form.Item
          label="Tên sự kiện"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
        >
          <Input placeholder="VD: Hội thảo AI" />
        </Form.Item>

        <Form.Item
          label="Đơn vị tổ chức"
          name="organizing_unit"
          rules={[{ required: true, message: 'Vui lòng nhập đơn vị tổ chức!' }]}
        >
          <Input placeholder="VD: CLB BIT" />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            label="Thời gian bắt đầu"
            name="start_time"
            style={{ width: '50%' }}
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
              placeholder="Chọn thời gian bắt đầu" 
            />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="end_time"
            style={{ width: '50%' }}
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
              placeholder="Chọn thời gian kết thúc" 
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả sự kiện!' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả sự kiện" />
        </Form.Item>

        <Form.Item
          label="Địa điểm"
          name="location"
          rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
        >
          <Input placeholder="VD: Hội trường A" />
        </Form.Item>

        <Form.Item
          label="Phương thức tham gia"
          name="parti_method"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức tham gia!' }]}
        >
          <Select
            placeholder="Chọn phương thức tham gia"
            options={[
              { value: '1', label: 'Trực tiếp' },
              { value: '2', label: 'Trực tuyến' },
              { value: '3', label: 'Kết hợp' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Học kỳ"
          name="semester_id"
          rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
        >
          <Select
            placeholder="Chọn học kỳ"
            options={semesters}
            loading={isLoading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEventModal;