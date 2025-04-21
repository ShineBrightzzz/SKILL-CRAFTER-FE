import { Modal, Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';

interface Semester {
  id: string;
  number: number;
  year: number;
  startTime: string;
  endTime: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  semester: Semester | null;
  onEditSemester: (updated: Omit<Semester, 'id'>) => void;
}

export default function EditSemesterModal({ isOpen, onClose, semester, onEditSemester }: Props) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      onEditSemester({
        number: Number(values.number),
        year: Number(values.year),
        startTime: values.startTime.toISOString(), 
        endTime: values.endTime.toISOString(),    
      });
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Chỉnh sửa học kỳ"
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu thay đổi"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          number: semester?.number,
          year: semester?.year,
          startTime: semester?.startTime ? dayjs(semester.startTime) : null, // ✅ Convert to dayjs
          endTime: semester?.endTime ? dayjs(semester.endTime) : null,
        }}
      >
        <Form.Item label="Số học kỳ" name="number" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Năm" name="year" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Ngày bắt đầu" name="startTime" rules={[{ required: true }]}>
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Ngày kết thúc" name="endTime" rules={[{ required: true }]}>
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
