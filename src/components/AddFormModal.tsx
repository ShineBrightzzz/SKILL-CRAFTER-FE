import { Modal, Form, Input, DatePicker, Button, Select } from 'antd';
import dayjs from 'dayjs';
import { useGetSemesterQuery } from '@/services/semester.service';
import { useMemo } from 'react';

interface Question {
  id: number;
  question: string;
  max: number;
}

interface FormData {
  formId?: string;
  title: string;
  semesterId: string;
  startTime?: string;
  endTime: string;
  questions?: Question[];
}

interface AddFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddForm: (form: FormData) => void;
  initialValues?: FormData;
  isEditing?: boolean;
}

const defaultQuestions: Question[] = [
  { id: 1, question: "Ý thức chấp hành văn bản chỉ đạo ngành...", max: 7 },
  { id: 2, question: "Ý thức chấp hành nội quy, quy chế...", max: 18 },
  { id: 3, question: "Tham gia rèn luyện chính trị, văn hóa...", max: 6 },
  { id: 4, question: "Tuyên truyền, phòng chống tội phạm...", max: 5 },
  { id: 5, question: "Chấp hành và tuyên truyền chủ trương...", max: 15 },
  { id: 6, question: "Hoạt động xã hội được khen thưởng...", max: 5 },
  { id: 7, question: "Chia sẻ, giúp đỡ người khó khăn...", max: 5 },
  { id: 8, question: "Uy tín và hiệu quả công việc quản lý...", max: 3 },
  { id: 9, question: "Kỹ năng tổ chức, quản lý lớp...", max: 3 },
  { id: 10, question: "Thành tích đặc biệt trong học tập...", max: 2 },
];

const AddFormModal: React.FC<AddFormModalProps> = ({
  isOpen,
  onClose,
  onAddForm,
  initialValues,
  isEditing = false
}) => {
  const [form] = Form.useForm();
  const { data: semesterData, isLoading } = useGetSemesterQuery();
  console.log('>> [DEBUG] Semester data from API:', semesterData);

  const semesterOptions = useMemo(() => {
    if (!semesterData?.data?.length) return [];
    return semesterData.data.map((s: any) => ({
      value: s.id,
      label: `Kỳ ${s.number} năm ${s.year}`,
    }));
  }, [semesterData]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues: FormData = {
          ...values,
          startTime: values.startTime?.format('YYYY-MM-DD HH:mm:ss'),
          endTime: values.endTime.format('YYYY-MM-DD HH:mm:ss'),
          questions: defaultQuestions,
        };
        onAddForm(formattedValues);
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
      title={isEditing ? 'Chỉnh sửa biểu mẫu' : 'Thêm biểu mẫu mới'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {isEditing ? 'Lưu thay đổi' : 'Thêm'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: initialValues?.title || '',
          semesterId: initialValues?.semesterId || undefined,
          startTime: initialValues?.startTime ? dayjs(initialValues.startTime) : undefined,
          endTime: initialValues?.endTime ? dayjs(initialValues.endTime) : undefined,
        }}
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề biểu mẫu" />
        </Form.Item>

        <Form.Item
          label="Học kỳ"
          name="semesterId"
          rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
        >
          <Select
            placeholder="Chọn học kỳ"
            options={semesterOptions}
            loading={isLoading}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Thời gian bắt đầu"
          name="startTime"
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
          label="Thời hạn nộp"
          name="endTime"
          rules={[{ required: true, message: 'Vui lòng chọn thời hạn nộp!' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Chọn thời hạn nộp"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFormModal;
