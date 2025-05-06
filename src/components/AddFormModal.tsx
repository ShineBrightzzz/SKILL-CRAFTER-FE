import { Modal, Form, Input, DatePicker, Button, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useGetSemesterQuery } from '@/services/semester.service';

interface Question {
  id: number;
  question: string;
  max: number;
}

interface FormData {
  formId?: string;
  title: string;
  semesterId: string;
  endTime: string;
  questions?: Question[];
  semester?: {
    id: string;
    number: number;
    year: number;
    startTime: string;
    endTime: string;
  };
}

interface AddFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddForm: (form: FormData) => void;
  initialValues?: FormData;
  isEditing?: boolean;
}

const defaultQuestions = [
    { id: 1, question: "Ý thức chấp hành văn bản chỉ đạo ngành, của cơ quan chỉ đạo cấp trên được thực hiện trong HV", max: 7 },
    { id: 2, question: "Ý thức chấp hành các nội quy, quy chế và các quy định khác được áp dụng trong HV", max: 18 },
    { id: 3, question: "Ý thức và hiệu quả tham gia các hoạt động rèn luyện về chính trị, xã hội, văn hóa, văn nghệ, thể thao", max: 6 },
    { id: 4, question: "Tham gia tuyên truyền, phòng chống tội phạm và các tệ nạn xã hội", max: 5 },
    { id: 5, question: "Ý thức chấp hành và tham gia tuyên truyền các chủ trương của Đảng, chính sách, pháp luật của Nhà nước trong cộng đồng", max: 15 },
    { id: 6, question: "Ý thức tham gia các hoạt động xã hội có thành tích được ghi nhận, biểu dương, khen thưởng", max: 5 },
    { id: 7, question: "Có tinh thần chia sẻ, giúp đỡ người thân, người có khó khăn, hoạn nạn", max: 5 },
    { id: 8, question: "Ý thức, tinh thần, thái độ, uy tín và hiệu quả công việc của người học được phân công quản lý lớp, tổ chức Đảng, Đoàn TN, Hội SV và các tổ chức khác trong HV", max: 3 },
    { id: 9, question: "Kỹ năng tổ chức, quản lý lớp, quản lý tổ chức Đảng, Đoàn TN, Hội SV và các tổ chức khác trong HV", max: 3 },
    { id: 10, question: "Người học đạt được các thành tích đặc biệt trong học tập, rèn luyện", max: 2 }
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

  useEffect(() => {
    if (initialValues && isOpen) {
      form.setFieldsValue({
        formId: initialValues.formId,
        title: initialValues.title,
        // ✅ Ưu tiên initialValues.semesterId, nếu không thì fallback sang semester?.id
        semesterId: initialValues.semesterId || initialValues.semester?.id,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime) : null,
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [initialValues, isOpen, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedValues: FormData = {
          ...values,
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
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="VD: Biểu mẫu đánh giá rèn luyện..." />
        </Form.Item>

        <Form.Item
          label="Học kỳ"
          name="semesterId"
          rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
        >
          <Select
            placeholder="Chọn học kỳ"
            options={semesters}
            loading={isLoading}
            allowClear
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
