import { Modal, Form, Input, DatePicker, FormInstance } from 'antd';
import dayjs from 'dayjs';

interface Semester {
  id: string;
  number: number;
  year: number;
  startTime?: string;
  endTime?: string;
}

interface EditSemesterModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
  initialValues: Semester | null;
}

const EditSemesterModal: React.FC<EditSemesterModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  form,
  initialValues
}) => {
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        // Convert dayjs objects to ISO strings if they exist
        const formattedValues = {
          ...values,
          startTime: values.startTime?.toISOString(),
          endTime: values.endTime?.toISOString(),
        };
        onSubmit(formattedValues);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Chỉnh sửa học kỳ"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu thay đổi"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          number: initialValues?.number,
          year: initialValues?.year,
          startTime: initialValues?.startTime ? dayjs(initialValues.startTime) : null,
          endTime: initialValues?.endTime ? dayjs(initialValues.endTime) : null,
        }}
      >
        <Form.Item label="Số học kỳ" name="number" rules={[{ required: true, message: 'Vui lòng nhập số học kỳ!' }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Năm" name="year" rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Ngày bắt đầu" name="startTime" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Ngày kết thúc" name="endTime" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSemesterModal;
