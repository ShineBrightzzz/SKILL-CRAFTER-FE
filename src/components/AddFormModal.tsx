import { Modal, Form, Input, DatePicker, Button, Select, Space, InputNumber, Typography, Divider, Card } from 'antd';
import dayjs from 'dayjs';
import { useGetSemesterQuery } from '@/services/semester.service';
import { useEffect, useMemo, useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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
  { id: 1, question: "Ý thức chấp hành văn bản chỉ đạo ngành, của cơ quan chỉ đạo cấp trên được thực hiện trong HV", max: 7 },
  { id: 2, question: "Ý thức chấp hành các nội quy, quy chế và các quy định khác được áp dụng trong HV", max: 18 },
  { id: 3, question: "Ý thức và hiệu quả tham gia các hoạt động rèn luyện về chính trị, xã hội, văn hóa, văn nghệ, thể thao", max: 6 },
  { id: 4, question: "Tham gia tuyên truyền, phòng chống tội phạm và các tệ nạn xã hội", max: 5 },
  { id: 5, question: "Ý thức chấp hành và tham gia tuyên truyền các chủ trương của Đảng, chính sách, pháp luật của Nhà nước trong cộng đồng", max: 15 },
  { id: 6, question: "Ý thức tham gia các hoạt động xã hội có thành tích được ghi nhận, biểu dương, khen thưởng", max: 5 },
  { id: 7, question: "Có tinh thần chia sẻ, giúp đỡ người thân, người có khó khăn, hoạn nạn", max: 5 },
  { id: 8, question: "Ý thức, tinh thần, thái độ, uy tín và hiệu quả công việc của người học được phân công quản lý lớp, tổ chức Đảng, Đoàn TN, Hội SV và các tổ chức khác trong HV", max: 3 },
  { id: 9, question: "Kỹ năng tổ chức, quản lý lớp, quản lý tổ chức Đảng, Đoàn TN, Hội SV và các tổ chức khác trong HV", max: 3 },
  { id: 10, question: "Người học đạt được các thành tích đặc biệt trong học tập, rèn luyện", max: 2 },
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
  const [useDefaultQuestions, setUseDefaultQuestions] = useState(true);
  
  useEffect(() => {
    // Nếu modal mở, khởi tạo danh sách câu hỏi trong form
    if (isOpen) {
      if (initialValues?.questions) {
        // Nếu đang chỉnh sửa, sử dụng câu hỏi từ initialValues
        form.setFieldsValue({
          questions: initialValues.questions
        });
        setUseDefaultQuestions(false);
      } else if (useDefaultQuestions) {
        // Nếu đang tạo mới và sử dụng mặc định, đặt câu hỏi mặc định
        form.setFieldsValue({
          questions: defaultQuestions
        });
      }
    }
  }, [isOpen, initialValues, form, useDefaultQuestions]);

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
        const questions = useDefaultQuestions ? defaultQuestions : values.questions;
        
        // Đảm bảo id cho câu hỏi nếu người dùng tự tạo
        const formattedQuestions = questions.map((q: Question, index: number) => ({
          ...q,
          id: q.id || index + 1,
        }));

        const formattedValues: FormData = {
          ...values,
          startTime: values.startTime?.format('YYYY-MM-DDTHH:mm:ss'),
          endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
          questions: formattedQuestions,
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

  const toggleQuestionMode = () => {
    setUseDefaultQuestions(!useDefaultQuestions);
    
    // Nếu chuyển sang sử dụng câu hỏi mặc định
    if (!useDefaultQuestions) {
      form.setFieldsValue({
        questions: defaultQuestions
      });
    }
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa biểu mẫu' : 'Thêm biểu mẫu mới'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
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
        
        <Divider orientation="left">Câu hỏi đánh giá</Divider>
        
        <div style={{ marginBottom: 16 }}>
          <Button type="link" onClick={toggleQuestionMode}>
            {useDefaultQuestions 
              ? 'Tạo câu hỏi tùy chỉnh' 
              : 'Sử dụng câu hỏi mặc định'}
          </Button>
        </div>
        
        {useDefaultQuestions ? (
          <Card title="Danh sách câu hỏi mặc định" size="small">
            {defaultQuestions.map((q, index) => (
              <div key={index} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ maxWidth: '75%' }}>{index + 1}. {q.question}</Text>
                <Text strong style={{ minWidth: '70px', textAlign: 'right', color: '#1890ff' }}>{q.max} điểm</Text>
              </div>
            ))}
          </Card>
        ) : (
          <Form.List name="questions" initialValue={defaultQuestions}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: 16 }}
                    title={`Câu hỏi ${name + 1}`}
                    extra={
                      <MinusCircleOutlined 
                        onClick={() => remove(name)} 
                        style={{ color: 'red' }}
                      />
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'id']}
                      hidden
                      initialValue={name + 1}
                    >
                      <InputNumber />
                    </Form.Item>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'question']}
                      rules={[{ required: true, message: 'Vui lòng nhập câu hỏi' }]}
                      label="Nội dung câu hỏi"
                    >
                      <Input.TextArea rows={2} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'max']}
                      rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa' }]}
                      label="Điểm tối đa"
                    >
                      <InputNumber 
                        min={1} 
                        max={100} 
                        style={{ width: '100%' }} 
                        placeholder="Nhập điểm tối đa"
                        formatter={value => `${value} điểm`}
                        parser={value => {
                          const parsed = parseInt(value!.replace(' điểm', ''), 10);
                          // Ensure the value is within the allowed range
                          if (isNaN(parsed)) return 1;
                          return Math.max(1, Math.min(100, parsed)) as 1 | 100;
                        }} 
                      />
                    </Form.Item>
                  </Card>
                ))}
                
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add({ id: fields.length + 1, question: '', max: 0 })} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Thêm câu hỏi
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        )}
      </Form>
    </Modal>
  );
};

export default AddFormModal;
