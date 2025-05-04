import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import { useUpdateScoreMutation } from '@/services/semester.service';

interface EditScoreModalProps {
  isVisible: boolean;
  onClose: () => void;
  studentId: string;
  semesterId: string;
  scoreType?: string; // Add scoreType as optional prop
  onSubmit?: (values: any) => Promise<void>; // Add onSubmit as optional prop
  initialScores: {
    self_score?: number;
    academic_score?: number;
    event_score?: number;
    research_score?: number;
    club_score?: number;
  };
}

const EditScoreModal: React.FC<EditScoreModalProps> = ({
  isVisible,
  onClose,
  studentId,
  semesterId,
  scoreType,
  onSubmit,
  initialScores
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
      
      // If onSubmit prop is provided, use it instead of internal implementation
      if (onSubmit) {
        await onSubmit(values);
        return;
      }
      
      // Default internal implementation
      // Filter out undefined values
      const scoreData = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value !== undefined)
      );
      
      await updateScore({
        studentId,
        semesterId,
        body: scoreData
      }).unwrap();
      
      message.success('Cập nhật điểm thành công');
      onClose();
    } catch (error) {
      console.error('Failed to update scores:', error);
      message.error('Không thể cập nhật điểm. Vui lòng thử lại sau.');
    }
  };

  // Generate a more descriptive title based on available info
  const getModalTitle = () => {
    let title = `Cập nhật điểm cho sinh viên`;
    if (studentId) {
      title += ` ${studentId}`;
    }
    if (scoreType) {
      title += ` - ${scoreType}`;
    }
    return title;
  };

  return (
    <Modal
      title={getModalTitle()}
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