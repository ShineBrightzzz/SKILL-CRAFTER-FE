'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag, Input, message } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetExistsScoreQuery, useGetSemesterQuery, useUpdateScoreMutation } from '@/services/semester.service';
import type { ColumnsType } from 'antd/es/table';
import UploadModal from '@/components/UploadModal';
import EditScoreModal from '@/components/EditScoreModal';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { toast } from 'react-toastify';
import { Action, Subject } from '@/utils/ability';
import withPermission from '@/hocs/withPermission';

interface Semester {
  id: string;
  number: number;
  year: number;
  status?: number;
}

const ScoresPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedScoreType, setSelectedScoreType] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [localUploadStatus, setLocalUploadStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [currentStudentId, setCurrentStudentId] = useState('');

  const { data: semesterData, isLoading: isLoadingSemesters, error: semesterError } = useGetSemesterQuery();
  const { data: existScoreData, isLoading: isLoadingScores, error: scoreError, refetch: refetchScores } = useGetExistsScoreQuery({});
  const [updateScore] = useUpdateScoreMutation();

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || null);
    setSortOrder(sorter.order || null);
  };

  const handleUpload = async (file: File, metadata?: Record<string, any>): Promise<void> => {
    const semesterId = metadata?.semesterId;
    const type = metadata?.type;
    if (!semesterId || !type) {
      toast.error('Thiếu thông tin');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester_id', semesterId);

    let uploadUrl = '';
    let scoreType = '';
    if (type === 'Điểm học tập') {
      uploadUrl = 'http://localhost:8000/file-processing/academic';
      scoreType = 'academic_score';
    } else if (type === 'Điểm NCKH') {
      uploadUrl = 'http://localhost:8000/file-processing/research';
      scoreType = 'research_score';
    } else if (type === 'Điểm CLB') {
      uploadUrl = 'http://localhost:8000/file-processing/club';
      scoreType = 'club_score';
    } else {
      toast.error('Loại upload không hợp lệ');
      return;
    }

    try {
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload thất bại');
      setLocalUploadStatus(prev => ({
        ...prev,
        [semesterId]: {
          ...(prev[semesterId] || {}),
          [scoreType]: true,
        },
      }));
      toast.success(`Tải lên ${type} thành công`);
      setIsUploadModalOpen(false);
      refetchScores();
    } catch (err) {
      toast.error(`Lỗi khi tải lên ${type}`);
    }
  };

  const handleEditScore = async (values: any): Promise<void> => {
    if (!selectedSemester || !currentStudentId || !selectedScoreType) {
      toast.error('Thiếu thông tin để cập nhật điểm');
      return;
    }
    toast.success(`Cập nhật điểm ${selectedScoreType} thành công`);
    setIsEditScoreModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    const { studentId, semesterId, ...body } = values;
    try {
      await updateScore({ studentId, semesterId, body }).unwrap();
      toast.success('Cập nhật điểm thành công');
      handleCloseModal();
    } catch (error) {
      toast.error('Lỗi khi cập nhật điểm');
    }
  };

  const handleCloseModal = () => {
    setIsEditScoreModalOpen(false);
    setSelectedSemester(null);
    setSelectedScoreType('');
    setCurrentStudentId('');
  };

  const openUploadModal = (semester: Semester, type: string) => {
    setSelectedSemester(semester);
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const openEditScoreModal = (semester: Semester, scoreType: string, studentId: string = '') => {
    setSelectedSemester(semester);
    setSelectedScoreType(scoreType);
    setCurrentStudentId(studentId);
    setIsEditScoreModalOpen(true);
  };

  const filteredSemesters = semesterData?.data?.filter((semester: Semester) => {
    if (!searchText) return true;
    return `kì ${semester.number} năm ${semester.year}`.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns: ColumnsType<Semester> = [
    {
      title: 'Học kỳ',
      key: 'semester',
      align: 'center',
      render: (_, record) => `Kì ${record.number} năm ${record.year}`,
      sorter: (a, b) => a.year !== b.year ? a.year - b.year : a.number - b.number,
    },
    ...['academic_score', 'research_score', 'club_score'].map(type => ({
      title: {
        academic_score: 'Điểm học tập',
        research_score: 'Điểm NCKH',
        club_score: 'Điểm CLB',
      }[type],
      key: type,
      align: 'center' as 'center', // Explicitly set align to a valid AlignType
      render: (_: any, record: Semester) => {
        const uploadedServer = existScoreData?.data[record.id]?.[type];
        const uploadedLocal = localUploadStatus[record.id]?.[type];
        const uploaded = uploadedServer || uploadedLocal;
        const label = {
          academic_score: 'Điểm học tập',
          research_score: 'Điểm NCKH',
          club_score: 'Điểm CLB',
        }[type] || 'Unknown';
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <>
                <Tag color="success">Đã upload</Tag>
                <Button size="small" onClick={() => openEditScoreModal(record, label)}>Sửa điểm</Button>
              </>
            ) : (
              <Button icon={<UploadOutlined />} onClick={() => openUploadModal(record, label)}>Upload</Button>
            )}
          </div>
        );
      },
    })),
  ];

  if (semesterError || scoreError) {
    const status = (semesterError as any)?.status || (scoreError as any)?.status || 500;
    return (
      <Sidebar>
        <ErrorHandler status={status} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {isLoadingSemesters || isLoadingScores ? (
          <Loading message="Đang tải danh sách điểm..." />
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Typography.Title level={2}>Danh sách điểm</Typography.Title>
            </div>
            <Card>
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
                columns={columns}
                dataSource={filteredSemesters}
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
            <UploadModal
              isOpen={isUploadModalOpen}
              onClose={() => {
                setIsUploadModalOpen(false);
                setSelectedSemester(null);
              }}
              semester={selectedSemester}
              uploadType={uploadType}
              onUpload={handleUpload}
            />
            <EditScoreModal
              isVisible={isEditScoreModalOpen}
              onClose={() => setIsEditScoreModalOpen(false)}
              onSubmit={handleEditScore}
              semesterId={selectedSemester?.id || ''}
              scoreType={selectedScoreType}
              studentId={currentStudentId}
              initialScores={{
                discipline_score: undefined,
                academic_score: undefined,
                event_score: undefined,
                research_score: undefined,
                club_score: undefined,
              }}
            />
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(ScoresPage, Action.Read, Subject.Score);