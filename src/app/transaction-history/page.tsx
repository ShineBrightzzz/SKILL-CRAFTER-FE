'use client';

import React from 'react';
import { Table, Card, Tag, Space, Typography } from 'antd';
import { useGetPaymentHistoryQuery } from '@/services/payment.service';
import dayjs from 'dayjs';
import { useAuth } from '@/store/hooks';
import { skipToken } from '@reduxjs/toolkit/query';

import AuthGuard from '@/components/AuthGuard';

const { Title } = Typography;

export default function TransactionHistoryPage() {  const { user } = useAuth();
  const { data: paymentsResponse, isLoading } = useGetPaymentHistoryQuery(user?.id ?? skipToken);
  const payments = paymentsResponse?.data?.result || [];

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'vnpTxnRef',
      key: 'vnpTxnRef',
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
        let text = 'Không xác định';        switch (status) {
          case 'SUCCESS':
            color = 'success';
            text = 'Hoàn thành';
            break;
          case 'FAILED':
            color = 'error';
            text = 'Thất bại';
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => method || 'VNPay'
    },
    {
      title: 'Thông tin',
      dataIndex: 'vnpOrderInfo',
      key: 'vnpOrderInfo',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={2}>Lịch sử giao dịch</Title>
            <Table
              columns={columns}
              dataSource={payments}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} giao dịch`
              }}
            />
          </Space>
        </Card>
      </div>
    </AuthGuard>
  );
}
