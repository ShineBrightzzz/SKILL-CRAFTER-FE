'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag, Input, Modal, Form, message, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useGetCurrentFormQuery, useCreateFormMutation } from '@/services/form.service';
import type { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import moment from 'moment';
import dayjs from 'dayjs';

interface Form {
  semesterId: string;
  title: string;
  endTime: string;
  semester: {
    id: string;
    number: number;
    year: number;
    startTime: string;
    endTime: string;
  };
}

const FormsPage: React.FC = () => {
  useEffect(() => {
    const handleResize = () => {
      const root = document.documentElement;
      if (window.innerWidth < 768) {
        root.style.setProperty('--table-width', '100%');
        root.style.setProperty('--input-width', '100%');
      } else {
        root.style.setProperty('--table-width', 'auto');
        root.style.setProperty('--input-width', '300px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: formResponse, isLoading, error, refetch } = useGetCurrentFormQuery();
  const [createForm] = useCreateFormMutation();
  const ability = useAbility();

  const forms = formResponse?.data?.data ? [formResponse.data.data] : [];

  const filteredForms = forms.filter((form: Form) => {
    if (!searchText) return true;
    return form.title.toLowerCase().includes(searchText.toLowerCase());
  });

  const isExpired = (endTime: string) => new Date() > new Date(endTime);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || null);
    setSortOrder(sorter.order || null);
  };

  const handleEdit = (form: Form) => {
    setSelectedForm(form);
    editForm.setFieldsValue({
      title: form.title,
      semesterId: form.semesterId,
      endTime: form.endTime ? dayjs(form.endTime) : null
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (semesterId: string) => {
    try {
      message.success('Xóa biểu mẫu thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi xóa biểu mẫu');
    }
  };

  const handleAddSubmit = async (values: any) => {
    try {
      await createForm(values).unwrap();
      message.success('Thêm biểu mẫu thành công');
      setAddModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi thêm biểu mẫu');
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedForm) return;
    try {
      message.success('Cập nhật biểu mẫu thành công');
      setEditModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi cập nhật biểu mẫu');
    }
  };

  const columns: ColumnsType<Form> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Học kỳ',
      render: (_, record) => `Kì ${record.semester.number} năm ${record.semester.year}`,
    },
    {
      title: 'Thời gian bắt đầu',
      render: (_, record) =>
        record.semester.startTime
          ? moment(record.semester.startTime).format('DD/MM/YYYY HH:mm')
          : 'Chưa xác định',
      sorter: (a, b) =>
        new Date(a.semester.startTime).getTime() - new Date(b.semester.startTime).getTime(),
    },
    {
      title: 'Thời hạn nộp',
      dataIndex: 'endTime',
      render: (endTime) =>
        endTime ? moment(endTime).format('DD/MM/YYYY HH:mm') : 'Chưa xác định',
      sorter: (a, b) =>
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'endTime',
      render: (endTime) => (
        <Tag color={isExpired(endTime) ? 'red' : 'green'}>
          {isExpired(endTime) ? 'Đã hết hạn' : 'Còn hạn'}
        </Tag>
      ),
    },
  ];

  if (ability.can(Action.Update, Subject.Form) || ability.can(Action.Delete, Subject.Form)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Form) && (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {ability.can(Action.Delete, Subject.Form) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa biểu mẫu này?"
              onConfirm={() => handleDelete(record.semesterId)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

  if (error) {
    return (
      <Sidebar>
        <ErrorHandler status={(error as any)?.status || 500} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {isLoading ? (
          <Loading message="Đang tải danh sách biểu mẫu..." />
        ) : (
          <>
            <Typography.Title level={2} style={{ marginBottom: 24 }}>
              <FileTextOutlined className="mr-2" />
              Danh sách biểu mẫu
            </Typography.Title>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}>
              <Input
                placeholder="Tìm kiếm biểu mẫu..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 'var(--input-width)' }}
                allowClear
              />

              {ability.can(Action.Create, Subject.Form) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                  style={{ minWidth: 150 }}
                >
                  Thêm biểu mẫu
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <Table
                dataSource={filteredForms}
                columns={columns}
                rowKey="semesterId"
                pagination={{
                  pageSize,
                  current: currentPage,
                  total: filteredForms?.length,
                  onChange: setCurrentPage,
                  onShowSizeChange: (_, size) => setPageSize(size),
                }}
                onChange={handleTableChange}
                locale={{ emptyText: 'Không có biểu mẫu nào' }}
                style={{ width: 'var(--table-width)' }}
              />
            </Card>

            {/* Modal Thêm biểu mẫu */}
            <Modal
              title="Thêm biểu mẫu mới"
              open={addModalVisible}
              onCancel={() => setAddModalVisible(false)}
              footer={null}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddSubmit}
              >
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề biểu mẫu' }]}
                >
                  <Input placeholder="Nhập tiêu đề biểu mẫu" />
                </Form.Item>

                <Form.Item
                  name="semesterId"
                  label="Học kỳ"
                  rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
                >
                  <Input placeholder="Mã học kỳ (ví dụ: S2_2025)" />
                </Form.Item>

                <Form.Item
                  name="endTime"
                  label="Thời hạn nộp"
                  rules={[{ required: true, message: 'Vui lòng chọn thời hạn nộp' }]}
                >
                  <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" style={{ width: '100%' }} />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setAddModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">Thêm biểu mẫu</Button>
                </div>
              </Form>
            </Modal>

            {/* Modal Chỉnh sửa biểu mẫu */}
            <Modal
              title="Chỉnh sửa biểu mẫu"
              open={editModalVisible}
              onCancel={() => setEditModalVisible(false)}
              footer={null}
            >
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleEditSubmit}
              >
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề biểu mẫu' }]}
                >
                  <Input placeholder="Nhập tiêu đề biểu mẫu" />
                </Form.Item>

                <Form.Item
                  name="semesterId"
                  label="Học kỳ"
                  rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
                >
                  <Input placeholder="Mã học kỳ" disabled />
                </Form.Item>

                <Form.Item
                  name="endTime"
                  label="Thời hạn nộp"
                  rules={[{ required: true, message: 'Vui lòng chọn thời hạn nộp' }]}
                >
                  <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" style={{ width: '100%' }} />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">Cập nhật</Button>
                </div>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(FormsPage, Action.Read, Subject.Form);
