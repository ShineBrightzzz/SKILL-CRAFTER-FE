'use client';

import React, { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag, Input, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetSemesterQuery, useCreateSemesterMutation, useUpdateSemesterMutation, useDeleteSemesterMutation } from '@/services/semester.service';
import type { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import AddSemesterModal from '@/components/AddSemesterModal';
import EditSemesterModal from '@/components/EditSemesterModal';
import dayjs from 'dayjs';

interface Semester {
  id: string;
  number: number;
  year: number;
  startTime?: string;
  endTime?: string;
}

const SemestersPage: React.FC = () => {
  // Table states
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  // Form states
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Data fetching states
  const { data: semesterData, isLoading, error, refetch } = useGetSemesterQuery();
  const [createSemester] = useCreateSemesterMutation();
  const [updateSemester] = useUpdateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();

  const ability = useAbility();

  // Filter semesters based on search text and sort by endTime
  const filteredSemesters = semesterData?.data
    ?.filter((semester: Semester) => {
      if (!searchText) return true;
      const searchTermLower = searchText.toLowerCase();
      const semesterText = `học kỳ ${semester.number} năm ${semester.year}`.toLowerCase();
      return semesterText.includes(searchTermLower);
    })
    ?.sort((a: Semester, b: Semester) => {
      // Sort by endTime in descending order (newest first)
      if (a.endTime && b.endTime) {
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      } 
      // If endTime is not available but startTime is, use startTime
      else if (a.startTime && b.startTime) {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
      // If neither time is available, fall back to year and number
      if (a.year !== b.year) return b.year - a.year;
      return b.number - a.number;
    });

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
  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester);
    editForm.setFieldsValue({
      number: semester.number,
      year: semester.year,
      startTime: semester.startTime ? dayjs(semester.startTime) : null,
      endTime: semester.endTime ? dayjs(semester.endTime) : null
    });
    setEditModalVisible(true);
  };

  // Handle semester deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteSemester({ semesterId: id }).unwrap();
      message.success('Xóa học kỳ thành công');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi xóa học kỳ');
    }
  };

  // Handle form submission for adding a semester
  const handleAddSubmit = async (values: any) => {
    try {
      await createSemester({ body: values }).unwrap();
      message.success('Thêm học kỳ thành công');
      setAddModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi thêm học kỳ');
    }
  };

  // Handle form submission for editing a semester
  const handleEditSubmit = async (values: any) => {
    if (!selectedSemester) return;
    
    try {
      await updateSemester({ 
        id: selectedSemester.id, 
        body: values 
      }).unwrap();
      
      message.success('Cập nhật học kỳ thành công');
      setEditModalVisible(false);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi khi cập nhật học kỳ');
    }
  };

  // Define table columns
  const columns: ColumnsType<Semester> = [
    {
      title: 'Học kỳ',
      key: 'semester',
      render: (_: any, record: Semester) => (
        <span>Kì {record.number} năm {record.year}</span>
      ),
      sorter: (a, b) => {
        // Sort by year first, then by number
        if (a.year !== b.year) return a.year - b.year;
        return a.number - b.number;
      },
    },
    {
      title: 'Thời gian bắt đầu',
      key: 'startTime',
      dataIndex: 'startTime',
      render: (startTime: string) => (
        <span>{startTime ? new Date(startTime).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
      ),
      sorter: (a, b) => {
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        return 0;
      },
    },
    {
      title: 'Thời gian kết thúc',
      key: 'endTime',
      dataIndex: 'endTime',
      render: (endTime: string) => (
        <span>{endTime ? new Date(endTime).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
      ),
      sorter: (a, b) => {
        if (a.endTime && b.endTime) {
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        }
        return 0;
      },
      defaultSortOrder: 'descend' as 'descend',
    }
  ];

  // Add actions column if user has permission
  if (ability.can(Action.Update, Subject.Semester) || ability.can(Action.Delete, Subject.Semester)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: Semester) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Semester) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {ability.can(Action.Delete, Subject.Semester) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa học kỳ này?"
              onConfirm={() => handleDelete(record.id)}
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
      <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="p-4 shadow-lg rounded w-full sm:max-w-2xl">
          <Typography.Title level={2} className="text-center sm:text-left">Danh sách học kỳ</Typography.Title>
          <Card className="shadow-md">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
              <Input
                placeholder="Tìm kiếm học kỳ..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", maxWidth: "300px" }}
                allowClear
              />
            </div>
            <Table
              dataSource={filteredSemesters}
              columns={columns}
              rowKey="id"
              pagination={{ 
                pageSize: pageSize, 
                current: currentPage,
                total: filteredSemesters?.length,
                onChange: (page) => setCurrentPage(page),
                onShowSizeChange: (_, size) => setPageSize(size)
              }}
              onChange={handleTableChange}
              className="w-full"
            />
          </Card>

          {/* Add Semester Modal */}
          <AddSemesterModal
            isOpen={addModalVisible}
            onCancel={() => setAddModalVisible(false)}
            onSubmit={handleAddSubmit}
            form={form}
            onClose={() => setAddModalVisible(false)} // Added onClose prop
            onAddSemester={handleAddSubmit} // Added onAddSemester prop
          />

          {/* Edit Semester Modal */}
          <EditSemesterModal
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            onSubmit={handleEditSubmit}
            form={editForm}
            initialValues={selectedSemester}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default withPermission(SemestersPage, Action.Read, Subject.Semester);