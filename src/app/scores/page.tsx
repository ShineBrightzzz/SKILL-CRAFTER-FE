'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Button, Tag } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGetExistsScoreQuery, useGetSemesterQuery } from '@/services/semester.service';
import type { ColumnsType } from 'antd/es/table';
import UploadModal from '@/components/UploadModal';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading'; // Import the Loading component
import ErrorHandler from '@/components/ErrorHandler'; // Import the ErrorHandler component

interface Semester {
  id: string;
  number: number;
  year: number;
  status?: number;
}

const SemestersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [uploadType, setUploadType] = useState<string>('');

  const { data: semesterData, isLoading: isLoadingSemesters, error: semesterError } = useGetSemesterQuery();
  const { data: existScoreData, isLoading: isLoadingScores, error: scoreError } = useGetExistsScoreQuery();

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
    if (type === 'Điểm học tập') {
      uploadUrl = 'https://example.com/file-processing/academic';
    } else if (type === 'Điểm NCKH') {
      uploadUrl = 'https://example.com/file-processing/research';
    } else if (type === 'Điểm CLB') {
      uploadUrl = 'https://example.com/file-processing/club';
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

      toast.success(`Tải lên ${type} thành công`);
    } catch (error) {
      toast.error(`Lỗi khi tải lên ${type}, vui lòng thử lại.`);
      throw error;
    }
  };

  const openUploadModal = (semester: Semester, type: string) => {
    setSelectedSemester(semester);
    setUploadType(type);
    setIsModalOpen(true);
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
      title: 'Điểm học tập',
      key: 'academic',
      align: 'center',
      render: (_: any, record: Semester) => {
        const uploaded = existScoreData?.data[record.id]?.academic_score;
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <Tag color="success">Đã upload</Tag>
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
        const uploaded = existScoreData?.data[record.id]?.research_score;
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <Tag color="success">Đã upload</Tag>
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
        const uploaded = existScoreData?.data[record.id]?.club_score;
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <Tag color="success">Đã upload</Tag>
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
              <Table
                columns={columns}
                dataSource={semesterData?.data}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSemester(null);
        }}
        semester={selectedSemester}
        uploadType={uploadType}
        onUpload={handleUpload}
      />
    </Sidebar>
  );
};

export default SemestersPage;