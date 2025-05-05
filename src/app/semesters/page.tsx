'use client';

import React, { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
  message,
  Popconfirm,
  Form,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useGetSemesterQuery,
  useCreateSemesterMutation,
  useUpdateSemesterMutation,
  useDeleteSemesterMutation,
} from '@/services/semester.service';
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

  // API hooks
  const { data: semesterData, isLoading, error, refetch } = useGetSemesterQuery();
  const [createSemester] = useCreateSemesterMutation();
  const [updateSemester] = useUpdateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();

  const ability = useAbility();

  const filteredSemesters = semesterData?.data
    ?.filter((semester: Semester) => {
      if (!searchText) return true;
      const search = searchText.toLowerCase();
      return `học kỳ ${semester.number} năm ${semester.year}`.toLowerCase().includes(search);
    })
    ?.sort((a: Semester, b: Semester) => {
      if (a.endTime && b.endTime) {
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      } else if (a.startTime && b.startTime) {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      } else if (a.year !== b.year) {
        return b.year - a.year;
      } else {
        return b.number - a.number;
      }
    });

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || null);
    setSortOrder(sorter.order || null);
  };

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester);
    editForm.setFieldsValue({
      number: semester.number,
      year: semester.year,
      startTime: semester.startTime ? dayjs(semester.startTime) : undefined,
      endTime: semester.endTime ? dayjs(semester.endTime) : undefined,
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSemester({ semesterId: id }).unwrap();
      message.success('Xóa học kỳ thành công');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Có lỗi khi xóa học kỳ');
    }
  };

  const handleAddSubmit = async (values: any) => {
    try {
      await createSemester({ body: values }).unwrap();
      message.success('Thêm học kỳ thành công');
      setAddModalVisible(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Có lỗi khi thêm học kỳ');
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedSemester) return;
    try {
      await updateSemester({
        semesterId: selectedSemester.id,
        body: values,
      }).unwrap();
      message.success('Cập nhật học kỳ thành công');
      setEditModalVisible(false);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Có lỗi khi cập nhật học kỳ');
    }
  };

  const columns: ColumnsType<Semester> = [
    {
      title: 'Học kỳ',
      key: 'semester',
      render: (_, record) => <span>Kì {record.number} năm {record.year}</span>,
      sorter: (a, b) => a.year !== b.year ? a.year - b.year : a.number - b.number,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : 'Chưa xác định',
      sorter: (a, b) => {
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        return 0;
      },
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : 'Chưa xác định',
      sorter: (a, b) => {
        if (a.endTime && b.endTime) {
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        }
        return 0;
      },
      defaultSortOrder: 'descend',
    },
  ];

  if (ability.can(Action.Update, Subject.Semester) || ability.can(Action.Delete, Subject.Semester)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Semester) && (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {ability.can(Action.Delete, Subject.Semester) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa học kỳ này?"
              onConfirm={() => handleDelete(record.id)}
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
          <Loading message="Đang tải danh sách học kỳ..." />
        ) : (
          <>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <Typography.Title level={2} style={{ flex: 1, minWidth: 200 }}>
                Danh sách học kỳ
              </Typography.Title>
              {ability.can(Action.Create, Subject.Semester) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  Thêm học kỳ
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16, maxWidth: 320 }}>
                <Input
                  placeholder="Tìm kiếm học kỳ..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </div>
              <Table
                dataSource={filteredSemesters}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize,
                  current: currentPage,
                  total: filteredSemesters?.length,
                  onChange: setCurrentPage,
                  onShowSizeChange: (_, size) => setPageSize(size),
                }}
                onChange={handleTableChange}
              />
            </Card>

            {/* Add Modal */}
            <AddSemesterModal
              isOpen={addModalVisible}
              onCancel={() => setAddModalVisible(false)}
              onSubmit={handleAddSubmit}
              form={form}
              onClose={() => setAddModalVisible(false)}
              onAddSemester={handleAddSubmit}
            />

            {/* Edit Modal */}
            <EditSemesterModal
              visible={editModalVisible}
              onCancel={() => setEditModalVisible(false)}
              onSubmit={handleEditSubmit}
              form={editForm}
              initialValues={selectedSemester}
            />
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(SemestersPage, Action.Read, Subject.Semester);
