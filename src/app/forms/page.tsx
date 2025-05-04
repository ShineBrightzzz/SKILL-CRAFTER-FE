'use client';

import React, { useState } from 'react';
import { Button, Card, Table, Typography, Modal, Form, Input, Select, message } from 'antd';
import { useGetCurrentFormQuery, useCreateFormMutation } from '@/services/form.service';
import Sidebar from '@/layouts/sidebar';
import dayjs from 'dayjs';

const { Title } = Typography;

const FormsPage: React.FC = () => {
  const { data: currentFormData, isLoading, error, refetch } = useGetCurrentFormQuery();
  const [createForm] = useCreateFormMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  const handleAddForm = async (values: any) => {
    try {
      await createForm(values).unwrap();
      message.success('Thêm form thành công');
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err) {
      console.error('Error creating form:', err);
      message.error('Lỗi khi thêm form');
    }
  };

  const formatSemester = (semester: any) => {
    const academicYear = `${semester.year - 1}-${semester.year}`;
    return `Học kỳ ${semester.number} năm ${academicYear}`;
  };

  const columns = [
    { title: 'Số thứ tự', dataIndex: ['semester', 'number'], key: 'number' },
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester: any) => formatSemester(semester),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: ['semester', 'endTime'],
      key: 'endTime',
      render: (endTime: string) => dayjs(endTime).format('DD/MM/YYYY'),
    },
    { title: 'Tên Form', dataIndex: 'title', key: 'title' },
  ];

  if (error) {
    return (
      <Sidebar>
        <div style={{ padding: 24 }}>
          <Typography.Text type="danger">Lỗi khi tải dữ liệu form</Typography.Text>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={2}>Danh sách Form</Title>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + Thêm Form
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={currentFormData?.data}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="Thêm Form"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleAddForm}>
            <Form.Item
              label="Tên Form"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên form' }]}
            >
              <Input placeholder="Nhập tên form" />
            </Form.Item>
            <Form.Item
              label="Học kỳ"
              name="semester"
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
            >
              <Select
                placeholder="Chọn học kỳ"
                options={[
                  { value: { number: 1, year: currentYear }, label: `Học kỳ 1 năm ${currentYear - 1}-${currentYear}` },
                  { value: { number: 2, year: currentYear }, label: `Học kỳ 2 năm ${currentYear - 1}-${currentYear}` },
                  { value: { number: 1, year: currentYear + 1 }, label: `Học kỳ 1 năm ${currentYear}-${currentYear + 1}` },
                  { value: { number: 2, year: currentYear + 1 }, label: `Học kỳ 2 năm ${currentYear}-${currentYear + 1}` },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <Input.TextArea placeholder="Nhập mô tả" rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Sidebar>
  );
};

export default FormsPage;