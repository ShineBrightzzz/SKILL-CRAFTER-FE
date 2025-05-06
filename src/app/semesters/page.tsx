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
  Tooltip,
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
import { useMediaQuery } from 'react-responsive';

interface Semester {
  id: string;
  number: number;
  year: number;
  startTime?: string;
  endTime?: string;
}

const SemestersPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: semesterData, isLoading, error, refetch } = useGetSemesterQuery();
  const [createSemester] = useCreateSemesterMutation();
  const [updateSemester] = useUpdateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();

  const ability = useAbility();
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

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
      <div className="p-6 max-w-screen-xl mx-auto w-full">
        {isLoading ? (
          <Loading message="Đang tải danh sách học kỳ..." />
        ) : (
          <>
            <Typography.Title level={2} className="mb-4 text-xl sm:text-2xl md:text-3xl">
              Danh sách học kỳ
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Tìm kiếm học kỳ..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-full"
                />
              </div>
              {ability.can(Action.Create, Subject.Semester) && (
                <div className="flex-shrink-0">
                  {isSmallScreen ? (
                    <Tooltip title="Thêm học kỳ">
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
                      Thêm học kỳ
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Card className="shadow-md">
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

            <AddSemesterModal
              isOpen={addModalVisible}
              onCancel={() => setAddModalVisible(false)}
              onSubmit={handleAddSubmit}
              form={form}
              onClose={() => setAddModalVisible(false)}
              onAddSemester={handleAddSubmit}
            />

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
