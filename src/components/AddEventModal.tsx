'use client';

import { Modal, Form, Input, DatePicker, Button, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useGetSemesterQuery } from '@/services/semester.service';
import { useMediaQuery } from 'react-responsive';

interface Event {
  eventId: string;
  title: string;
  organizingUnit: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  participationMethod?: string;
  semester: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: any) => void;
  initialValues?: Event;
  isEditing?: boolean;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  initialValues,
  isEditing = false
}) => {
  const [form] = Form.useForm();
  const { data: semesterData, isLoading } = useGetSemesterQuery();
  const [semesters, setSemesters] = useState<Array<{ value: string; label: string }>>([]);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    if (semesterData?.data?.length) {
      const semesterOptions = semesterData.data.map((semester: any) => ({
        value: semester.id,
        label: `Kỳ ${semester.number} năm ${semester.year}`,
      }));
      setSemesters(semesterOptions);
    }
  }, [semesterData]);

  useEffect(() => {
    if (initialValues && isOpen) {
      // When editing, populate form with existing values including the event ID
      form.setFieldsValue({
        event_id: initialValues.eventId, // Use the existing event ID
        name: initialValues.title,
        organizing_unit: initialValues.organizingUnit,
        start_time: initialValues.startTime ? dayjs(initialValues.startTime) : null,
        end_time: initialValues.endTime ? dayjs(initialValues.endTime) : null,
        description: initialValues.description,
        location: initialValues.location,
        parti_method: initialValues.participationMethod,
        semester_id: initialValues.semester
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [initialValues, isOpen, form]);

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
        if (!isEditing) {
          form.resetFields();
        }
        onClose();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    if (!isEditing) {
      form.resetFields();
    }
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={isMobile ? '100%' : 700}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {isEditing ? "Lưu thay đổi" : "Thêm"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mã sự kiện"
          name="event_id"
          rules={[{ required: true, message: 'Vui lòng nhập mã sự kiện!' }]}
        >
          <Input placeholder="VD: EV01" disabled={isEditing} style={{ fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Tên sự kiện"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
        >
          <Input placeholder="VD: Hội thảo AI" style={{ fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Đơn vị tổ chức"
          name="organizing_unit"
          rules={[{ required: true, message: 'Vui lòng nhập đơn vị tổ chức!' }]}
        >
          <Input placeholder="VD: CLB BIT" style={{ fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
          <Form.Item
            label="Thời gian bắt đầu"
            name="start_time"
            style={{ width: isMobile ? '100%' : '50%' }}
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
            style={{ width: isMobile ? '100%' : '50%' }}
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
          <Input.TextArea rows={4} placeholder="Nhập mô tả sự kiện" style={{ fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Địa điểm"
          name="location"
          rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
        >
          <Input placeholder="VD: Hội trường A" style={{ fontSize: isMobile ? '14px' : '16px' }} />
        </Form.Item>

        <Form.Item
          label="Phương thức tham gia"
          name="parti_method"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức tham gia!' }]}
        >
          <Select
            placeholder="Chọn phương thức tham gia"
            options={[
              { value: '0', label: 'Trực tiếp' },
              { value: '1', label: 'Trực tuyến' },
              { value: '2', label: 'Kết hợp' },
            ]}
            style={{ fontSize: isMobile ? '14px' : '16px' }}
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
            style={{ fontSize: isMobile ? '14px' : '16px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEventModal;