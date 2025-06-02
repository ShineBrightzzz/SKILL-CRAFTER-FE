'use client';

import React, { useState } from 'react';
import { Table, Card, Tag, DatePicker, Select, Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGetAllPaymentsQuery } from '@/services/payment.service';
import dayjs, { Dayjs } from 'dayjs';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';

const { RangePicker } = DatePicker;

const PaymentsManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const { data: paymentsResponse, isLoading, refetch } = useGetAllPaymentsQuery({
    page: currentPage,
    pageSize: pageSize,
    searchText,
    status,
    startDate: dateRange[0]?.format('YYYY-MM-DD'),
    endDate: dateRange[1]?.format('YYYY-MM-DD')
  });

  const payments = paymentsResponse?.data?.result || [];
  const paginationMeta = paymentsResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
  };

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user?.username
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course: any) => course?.title
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Không xác định';

        switch (status) {
          case 'completed':
            color = 'success';
            text = 'Hoàn thành';
            break;
          case 'pending':
            color = 'processing';
            text = 'Đang xử lý';
            break;
          case 'failed':
            color = 'error';
            text = 'Thất bại';
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  return (
    <Card title="Quản lý giao dịch">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm kiếm theo mã giao dịch"
          onSearch={handleSearch}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          defaultValue="all"
          onChange={handleStatusChange}
          style={{ width: 150 }}
        >
          <Select.Option value="all">Tất cả trạng thái</Select.Option>
          <Select.Option value="completed">Hoàn thành</Select.Option>
          <Select.Option value="pending">Đang xử lý</Select.Option>
          <Select.Option value="failed">Thất bại</Select.Option>
        </Select>
        <RangePicker onChange={handleDateRangeChange} />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: paginationMeta.total,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }
        }}
      />
    </Card>
  );
};

export default withPermission(PaymentsManagement, Action.Read, Subject.Payment);
