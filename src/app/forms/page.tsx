'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag, Input, Modal, Form, message, Popconfirm, DatePicker, Tooltip } from 'antd';
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
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

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
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoading ? (
          <Loading message="Đang tải danh sách biểu mẫu..." />
        ) : (
          <>
            <Typography.Title level={2} className="mb-4 text-xl sm:text-2xl md:text-3xl">
              Danh sách biểu mẫu
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Tìm kiếm biểu mẫu..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-full"
                />
              </div>
              {ability.can(Action.Create, Subject.Form) && (
                <div className="flex-shrink-0">
                  {isSmallScreen ? (
                    <Tooltip title="Thêm biểu mẫu">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalVisible(true)}
                        className="min-w-[40px]"
                      />
                    </Tooltip>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setAddModalVisible(true)}
                    >
                      Thêm biểu mẫu
                    </Button>
                  )}
                </div>
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
              />
            </Card>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(FormsPage, Action.Read, Subject.Form);
