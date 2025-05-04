'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag, Input, Modal, Upload, message } from 'antd';
import { UploadOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { useGetExistsScoreQuery, useGetSemesterQuery } from '@/services/semester.service';
import type { ColumnsType } from 'antd/es/table';
import UploadModal from '@/components/UploadModal';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import withPermission from '@/hocs/withPermission';
import EditScoreModal from '@/components/EditScoreModal';

const { Dragger } = Upload;

interface Semester {
  id: string;
  number: number;
  year: number;
  status?: number;
}

const ScoresPage = () => {
  // Table states
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedScoreType, setSelectedScoreType] = useState<string>('');
  const [uploadType, setUploadType] = useState<string>('');
  
  // Upload status tracking states
  const [localUploadStatus, setLocalUploadStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  
  // Data fetching states
  const { data: semesterData, isLoading: isLoadingSemesters, error: semesterError } = useGetSemesterQuery();
  const { data: existScoreData, isLoading: isLoadingScores, error: scoreError, refetch: refetchScores } = useGetExistsScoreQuery();

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

  // Handle file uploads for scores
  const handleUpload = async (file: File, metadata?: Record<string, any>) => {
    const semesterId = metadata?.semesterId;
    const type = metadata?.type;

    if (!semesterId || !type) {
      toast.error('Thiếu thông tin học kỳ hoặc loại upload');
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
      toast.error('Không xác định được loại upload');
      return;
    }

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      // Cập nhật trạng thái upload thành công ở local
      setLocalUploadStatus(prev => ({
        ...prev,
        [semesterId]: {
          ...(prev[semesterId] || {}),
          [scoreType]: true
        }
      }));

      toast.success(`Tải lên ${type} thành công`);
      setIsUploadModalOpen(false);
      
      // Refresh the data from server to maintain upload status when navigating
      refetchScores();
    } catch (error) {
      toast.error(`Lỗi khi tải lên ${type}, vui lòng thử lại.`);
      throw error;
    }
  };

  // Handle editing individual student scores
  const handleEditScore = async (values: any) => {
    if (!selectedSemester || !currentStudentId || !selectedScoreType) {
      toast.error('Thông tin chỉnh sửa không đầy đủ');
      return;
    }
    
    try {
      // This would be an API call to update a specific student's score
      // For example:
      // await updateStudentScore({
      //   semesterId: selectedSemester.id,
      //   studentId: currentStudentId,
      //   scoreType: selectedScoreType,
      //   scoreValue: values.score
      // }).unwrap();
      
      toast.success(`Cập nhật điểm ${selectedScoreType} thành công`);
      setIsEditScoreModalOpen(false);
    } catch (error) {
      toast.error('Lỗi khi cập nhật điểm');
    }
  };

  // Open upload modal
  const openUploadModal = (semester: Semester, type: string) => {
    setSelectedSemester(semester);
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  // Open edit score modal
  const openEditScoreModal = (semester: Semester, scoreType: string, studentId: string = '') => {
    setSelectedSemester(semester);
    setSelectedScoreType(scoreType);
    setCurrentStudentId(studentId);
    setIsEditScoreModalOpen(true);
  };

  // Filter semesters based on search text
  const filteredSemesters = semesterData?.data?.filter((semester: Semester) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    const semesterText = `kì ${semester.number} năm ${semester.year}`.toLowerCase();
    return semesterText.includes(searchTermLower);
  });

  // Define table columns
  const columns: ColumnsType<Semester> = [
    {
      title: 'Học kỳ',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
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
      title: 'Điểm học tập',
      key: 'academic',
      align: 'center',
      render: (_: any, record: Semester) => {
        // Kiểm tra cả trạng thái server và local
        const uploadedServer = existScoreData?.data[record.id]?.academic_score;
        const uploadedLocal = localUploadStatus[record.id]?.academic_score;
        const uploaded = uploadedServer || uploadedLocal;
        
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <>
                <Tag color="success">Đã upload</Tag>
                <Button size="small" onClick={() => openEditScoreModal(record, 'Điểm học tập')}>
                  Sửa điểm
                </Button>
              </>
            ) : (
              <Button
                icon={<UploadOutlined />}
                onClick={() => openUploadModal(record, 'Điểm học tập')}
              >
                Upload
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Điểm NCKH',
      key: 'research',
      align: 'center',
      render: (_: any, record: Semester) => {
        // Kiểm tra cả trạng thái server và local
        const uploadedServer = existScoreData?.data[record.id]?.research_score;
        const uploadedLocal = localUploadStatus[record.id]?.research_score;
        const uploaded = uploadedServer || uploadedLocal;
        
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <>
                <Tag color="success">Đã upload</Tag>
                <Button size="small" onClick={() => openEditScoreModal(record, 'Điểm NCKH')}>
                  Sửa điểm
                </Button>
              </>
            ) : (
              <Button
                icon={<UploadOutlined />}
                onClick={() => openUploadModal(record, 'Điểm NCKH')}
              >
                Upload
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Điểm CLB',
      key: 'club',
      align: 'center',
      render: (_: any, record: Semester) => {
        // Kiểm tra cả trạng thái server và local
        const uploadedServer = existScoreData?.data[record.id]?.club_score;
        const uploadedLocal = localUploadStatus[record.id]?.club_score;
        const uploaded = uploadedServer || uploadedLocal;
        
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <>
                <Tag color="success">Đã upload</Tag>
                <Button size="small" onClick={() => openEditScoreModal(record, 'Điểm CLB')}>
                  Sửa điểm
                </Button>
              </>
            ) : (
              <Button
                icon={<UploadOutlined />}
                onClick={() => openUploadModal(record, 'Điểm CLB')}
              >
                Upload
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Check for errors and handle them
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
          <Loading message="Đang tải thông tin học kỳ và điểm..." />
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Title level={2} className="mb-6 text-center">
                Điểm
              </Typography.Title>
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
                dataSource={filteredSemesters}
                rowKey="id"
                pagination={{ 
                  pageSize: pageSize, 
                  current: currentPage,
                  total: filteredSemesters?.length,
                  onChange: (page) => setCurrentPage(page),
                  onShowSizeChange: (_, size) => setPageSize(size)
                }}
                onChange={handleTableChange}
              />
            </Card>
          </>
        )}
      </div>

      {/* Upload Modal */}
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

      {/* Edit Score Modal */}
      <EditScoreModal 
        isOpen={isEditScoreModalOpen}
        onClose={() => setIsEditScoreModalOpen(false)}
        onSubmit={handleEditScore}
        semester={selectedSemester}
        scoreType={selectedScoreType}
        studentId={currentStudentId}
      />
    </Sidebar>
  );
};

export default withPermission(ScoresPage, Action.Read, Subject.Score);
