'use client';

import React, { useState } from 'react';
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
import { useMediaQuery } from 'react-responsive';

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
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Table states
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  // Form states
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Data fetching states
  const { data: formResponse, isLoading, error, refetch } = useGetCurrentFormQuery();
  const [createForm] = useCreateFormMutation();
  
  const ability = useAbility();

  // Process form data for the table
  const forms = formResponse?.data?.data ? [formResponse.data.data] : [];

  // Filter forms based on search text
  const filteredForms = forms
    ?.filter((form: Form) => {
      if (!searchText) return true;
      const searchTermLower = searchText.toLowerCase();
      return form.title.toLowerCase().includes(searchTermLower);
    });

  // Check if form has expired
  const isExpired = (endTime: string) => {
    const endDate = new Date(endTime);
    const now = new Date();
    return now > endDate;
  };

  // Handle table pagination change
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  // Handle opening the edit modal
  const handleEdit = (form: Form) => {
    setSelectedForm(form);
    editForm.setFieldsValue({
      title: form.title,
      semesterId: form.semesterId,
      endTime: form.endTime ? dayjs(form.endTime) : null
    });
    setEditModalVisible(true);
  };

  // Handle form deletion
  const handleDelete = async (semesterId: string) => {
    try {
      // This is a placeholder for the deleteForm mutation that would need to be implemented
      // await deleteForm({ semesterId }).unwrap();
      message.success('Xóa biểu mẫu thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi xóa biểu mẫu');
    }
  };

  // Handle form submission for adding a form
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

  // Handle form submission for editing a form
  const handleEditSubmit = async (values: any) => {
    if (!selectedForm) return;
    
    try {
      // This is a placeholder for the updateForm mutation that would need to be implemented
      // await updateForm({ 
      //   semesterId: selectedForm.semesterId, 
      //   body: values 
      // }).unwrap();
      
      message.success('Cập nhật biểu mẫu thành công');
      setEditModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi cập nhật biểu mẫu');
    }
  };

  // Define table columns
  const columns: ColumnsType<Form> = [
    {
      title: 'Tiêu đề',
      key: 'title',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Học kỳ',
      key: 'semester',
      render: (_: any, record: Form) => (
        <span>Kì {record.semester.number} năm {record.semester.year}</span>
      ),
    },
    {
      title: 'Thời gian bắt đầu',
      key: 'startTime',
      render: (_: any, record: Form) => (
        <span>{record.semester.startTime ? moment(record.semester.startTime).format('DD/MM/YYYY HH:mm') : 'Chưa xác định'}</span>
      ),
      sorter: (a, b) => {
        if (a.semester.startTime && b.semester.startTime) {
          return new Date(a.semester.startTime).getTime() - new Date(b.semester.startTime).getTime();
        }
        return 0;
      },
    },
    {
      title: 'Thời hạn nộp',
      key: 'endTime',
      dataIndex: 'endTime',
      render: (endTime: string) => (
        <span>{endTime ? moment(endTime).format('DD/MM/YYYY HH:mm') : 'Chưa xác định'}</span>
      ),
      sorter: (a, b) => {
        if (a.endTime && b.endTime) {
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        }
        return 0;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'endTime',
      render: (endTime: string) => {
        const expired = isExpired(endTime);
        return (
          <Tag color={expired ? 'red' : 'green'}>
            {expired ? 'Đã hết hạn' : 'Còn hạn'}
          </Tag>
        );
      },
    }
  ];

  // Add actions column if user has permission
  if (ability.can(Action.Update, Subject.Form) || ability.can(Action.Delete, Subject.Form)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: Form) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Form) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {ability.can(Action.Delete, Subject.Form) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa biểu mẫu này?"
              onConfirm={() => handleDelete(record.semesterId)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

  // Check for errors and handle them
  if (error) {
    const status = (error as any)?.status || 500;
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: isMobile ? 16 : 24 }}>
        {isLoading ? (
          <Loading message="Đang tải danh sách biểu mẫu..." />
        ) : (
          <>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
              }}
            >
              <Typography.Title level={2} className="mb-6">
                <FileTextOutlined className="mr-2" />
                Danh sách biểu mẫu
              </Typography.Title>
              {ability.can(Action.Create, Subject.Form) && (
                <Button 
                  type="primary" 
                  onClick={() => setAddModalVisible(true)}
                  icon={<PlusOutlined />}
                  style={{ marginTop: isMobile ? 16 : 0 }}
                >
                  Thêm biểu mẫu
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Tìm kiếm biểu mẫu..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: isMobile ? '100%' : 300 }}
                  allowClear
                />
              </div>
              <Table
                dataSource={filteredForms}
                columns={columns}
                rowKey="semesterId"
                pagination={{ 
                  pageSize: pageSize, 
                  current: currentPage,
                  total: filteredForms?.length,
                  onChange: (page) => setCurrentPage(page),
                  onShowSizeChange: (_, size) => setPageSize(size)
                }}
                onChange={handleTableChange}
                locale={{ 
                  emptyText: 'Không có biểu mẫu nào' 
                }}
                scroll={isMobile ? { x: true } : undefined}
              />
            </Card>

            {/* Add Form Modal */}
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
                  <DatePicker 
                    showTime 
                    format="DD/MM/YYYY HH:mm:ss" 
                    style={{ width: '100%' }} 
                    placeholder="Chọn thời hạn nộp"
                  />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setAddModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Thêm biểu mẫu
                  </Button>
                </div>
              </Form>
            </Modal>

            {/* Edit Form Modal */}
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
                  <DatePicker 
                    showTime 
                    format="DD/MM/YYYY HH:mm:ss" 
                    style={{ width: '100%' }} 
                    placeholder="Chọn thời hạn nộp"
                  />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setEditModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
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