'use client';

import { useState, useRef } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, message, Input, Space, Popconfirm } from 'antd';
import { useGetSemesterQuery, useCreateSemesterMutation, useUpdateSemesterMutation, useDeleteSemesterMutation } from '@/services/semester.service';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import AddSemesterModal from '@/components/AddSemesterModal';
import EditSemesterModal from '@/components/EditSemesterModal';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import Loading from '@/components/Loading'; // Import Loading component
import ErrorHandler from '@/components/ErrorHandler'; // Import ErrorHandler component
import withPermission from '@/hocs/withPermission';

interface Semester {
  id: string;
  number: number;
  year: number;
  startTime: string;
  endTime: string;
}

const SemestersPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: semesterData, isLoading, error, refetch } = useGetSemesterQuery(); // Include refetch function
  const [createSemester] = useCreateSemesterMutation();
  const [updateSemester] = useUpdateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();

  const ability = useAbility();
  
  // Filter data based on search text
  const filteredData = semesterData?.data?.filter((semester: Semester) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    const semesterText = `kì ${semester.number} năm ${semester.year}`.toLowerCase();
    return semesterText.includes(searchTermLower);
  });

  const handleAddSemester = async (semester: Omit<Semester, 'id'>) => {
    try {
      await createSemester({ semesterId: semester, body: semester }).unwrap();
      toast.success("Thêm học kỳ thành công");
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi thêm học kỳ");
    }
  };

  const handleEditSemester = async (updatedData: Omit<Semester, 'id'>) => {
    if (!selectedSemester) return;
    try {
      await updateSemester({ semesterId: selectedSemester.id, body: updatedData }).unwrap();
      toast.success("Cập nhật học kỳ thành công");
      setIsEditModalOpen(false);
      setSelectedSemester(null);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi cập nhật học kỳ");
    }
  };

  const handleDeleteSemester = async (semester: Semester) => {
    try {
      // Removing window.confirm logic as we're using Popconfirm now
      const response = await deleteSemester({ semesterId: semester.id }).unwrap();
      console.log("Xóa học kỳ:", response);
      if (response) {
        toast.success("Xóa học kỳ thành công");
        refetch(); // Làm mới dữ liệu
      } else {
        toast.error("Không thể xóa học kỳ");
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa học kỳ:", error);
      toast.error(error?.data?.message || "Lỗi khi xóa học kỳ");
      // Vẫn làm mới dữ liệu để đồng bộ với DB trong trường hợp API trả về lỗi nhưng vẫn xóa được
      refetch();
    }
  };

  const columns: ColumnsType<Semester> = [
    {
      title: 'Học kỳ',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (_: any, record: Semester) => (
        <span>Kì {record.number} năm {record.year}</span>
      ),
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      align: 'center',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      align: 'center',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: Semester) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Semester) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedSemester(record);
                setIsEditModalOpen(true);
              }}
            />
          )}
          {ability.can(Action.Delete, Subject.Semester) && (
            <Popconfirm
              title={`Bạn có chắc chắn muốn xóa học kỳ ${record.number} năm ${record.year} không?`}
              onConfirm={() => handleDeleteSemester(record)}
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
    }
  ];

  // Check for errors and handle them
  if (error) {
    const status = (error as any)?.status || 500; // Default to 500 if no status is provided
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {isLoading ? (
          <Loading message="Đang tải thông tin học kỳ..." />
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Title level={2} className="mb-6 text-center">
                Học kỳ
              </Typography.Title>
              {ability.can(Action.Create, Subject.Semester) && (
                <Button type="primary" onClick={() => setIsAddModalOpen(true)} icon={<PlusOutlined />}>
                  Thêm học kỳ
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Tìm kiếm học kỳ..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
      </div>

      {/* Add Semester Modal */}
      <AddSemesterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSemester={handleAddSemester}
      />

      {/* Edit Semester Modal */}
      <EditSemesterModal
        isOpen={isEditModalOpen}
        semester={selectedSemester}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSemester(null);
        }}
        onEditSemester={handleEditSemester}
      />
    </Sidebar>
  );
}

export default withPermission(SemestersPage, Action.Read, Subject.Semester);