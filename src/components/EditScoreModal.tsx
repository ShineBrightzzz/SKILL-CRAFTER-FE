import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import { useUpdateScoreMutation } from '@/services/semester.service';

interface EditScoreModalProps {
  isVisible: boolean;
  onClose: () => void;
  studentId: string;
  semesterId: string;
  initialScores: {
    self_score?: number;
    academic_score?: number;
    event_score?: number;
    research_score?: number;
    club_score?: number;
  };
  onSubmit: (values: any) => Promise<void>; // Added onSubmit prop
  scoreType: string; // Added scoreType prop
}

const EditScoreModal: React.FC<EditScoreModalProps> = ({
  isVisible,
  onClose,
  studentId,
  semesterId,
  initialScores,
  onSubmit // Destructure the new onSubmit prop
}) => {
  const [form] = Form.useForm();
  const [updateScore, { isLoading }] = useUpdateScoreMutation();

  useEffect(() => {
    if (isVisible) {
      form.setFieldsValue({
        self_score: initialScores.self_score,
        academic_score: initialScores.academic_score,
        event_score: initialScores.event_score,
        research_score: initialScores.research_score,
        club_score: initialScores.club_score,
      });
    }
  }, [isVisible, initialScores, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values); // Use the onSubmit prop for external handling
      onClose();
    } catch (error) {
      console.error('Failed to update scores:', error);
      message.error('Không thể cập nhật điểm. Vui lòng thử lại sau.');
    }
  };

  return (
    <Modal
      title={`Cập nhật điểm cho sinh viên ${studentId}`}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
          loading={isLoading}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="self_score"
          label="Điểm tự chấm"
          rules={[{ type: 'number', min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="academic_score"
          label="Điểm học tập"
          rules={[{ type: 'number', min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="research_score"
          label="Điểm nghiên cứu khoa học"
          rules={[{ type: 'number', min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="club_score"
          label="Điểm CLB"
          rules={[{ type: 'number', min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="event_score"
          label="Điểm sự kiện"
          rules={[{ type: 'number', min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditScoreModal;