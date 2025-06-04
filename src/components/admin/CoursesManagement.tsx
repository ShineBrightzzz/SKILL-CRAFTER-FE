'use client';

import React, { useEffect, useState } from 'react';
import { Table, Space, message, Pagination, Select, Input, Button } from 'antd';
import { useGetAllCoursesQuery } from '@/services/course.service';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';

const CoursesManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<number | null>(null);
    
  const { data: coursesResponse, isLoading, error, refetch } = useGetAllCoursesQuery({
    page: currentPage,
    size: pageSize,
    search: searchTerm.trim(),
    status: status === null ? undefined : status
  });

  // Add error handling
  useEffect(() => {
    if (error) {
      message.error('Có lỗi khi tải dữ liệu khóa học');
    }
  }, [error]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Extract courses and pagination metadata from the new API response format
  const courses = coursesResponse?.data?.result || [];
  const paginationMeta = coursesResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => window.location.href = `/course-detail/${record.id}`}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <Input.Search
            placeholder="Tìm kiếm khóa học..."
            allowClear
            enterButton
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={(value: number | null) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            value={status ?? undefined}
          >
            <Select.Option value={0}>Nháp</Select.Option>
            <Select.Option value={1}>Chờ duyệt</Select.Option>
            <Select.Option value={2}>Đã xuất bản</Select.Option>
            <Select.Option value={3}>Từ chối</Select.Option>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 my-4">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            dataSource={courses}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            locale={{
              emptyText: searchTerm ? 'Không tìm thấy khóa học phù hợp' : 'Không có khóa học nào'
            }}
          />
          
          {/* Custom pagination */}
          {courses && courses.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Pagination 
                current={currentPage}
                pageSize={pageSize}
                total={paginationMeta.total}
                showSizeChanger
                onChange={handlePageChange}
                showTotal={(total) => `Tổng cộng ${total} khóa học`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default withPermission(CoursesManagement, Action.Read, Subject.Course);
