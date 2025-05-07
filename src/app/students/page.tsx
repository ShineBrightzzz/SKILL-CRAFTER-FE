'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Select, Tag, Button, Input } from 'antd';
import { useGetSemesterQuery, useGetStudentScoresBySemesterQuery, useUpdateScoreMutation } from '@/services/semester.service';
import { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import EditScoreModal from '@/components/EditScoreModal';
import { toast } from 'react-toastify';

const { Option } = Select;

interface Score {
  studentId: string;
  scores: {
    discipline_score?: number;
    academic_score?: number;
    event_score?: number;
    research_score?: number;
    club_score?: number;
  };
  total_score?: number;
}

export default function ScoresPage() {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Score | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: semesterOptions, isLoading: isLoadingOptions, error: semesterError } = useGetSemesterQuery();
  const { data: studentScoresData, isLoading: isLoadingScore, error: scoreError, refetch } = useGetStudentScoresBySemesterQuery({ semesterId: selectedSemesterId });
  const [updateScore] = useUpdateScoreMutation();
  useEffect(() => {
    if (semesterOptions?.data?.length > 0 && !selectedSemesterId) {
      setSelectedSemesterId(semesterOptions.data[0].id);
    }
  }, [semesterOptions, selectedSemesterId]);

  const processedData = useMemo(() => {
    if (!studentScoresData?.data) return [];

    return studentScoresData.data.map((student: Score) => {
      const scores = {
        self: student.scores.discipline_score || 0,
        academic: student.scores.academic_score || 0,
        research: student.scores.research_score || 0,
        club: student.scores.club_score || 0,
        event: student.scores.event_score || 0,
      };
      const calculatedTotal = Math.min(scores.self + scores.academic + scores.research + scores.club + scores.event, 100);
      const hasAnyScore = Object.values(scores).some(score => score > 0);
      return {
        ...student,
        calculatedTotal: hasAnyScore ? calculatedTotal : undefined
      };
    });
  }, [studentScoresData]);

  const filteredData = useMemo(() => {
    return processedData.filter((student: any) => {
      if (!searchText) return true;
      return student.studentId.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [processedData, searchText]);

  const handleSemesterChange = (value: string) => setSelectedSemesterId(value);

  const handleEditScore = (studentId: string) => {
    const student = processedData.find((s: any) => s.studentId === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsEditModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setSelectedStudent(null);
    refetch();
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

  const columns: ColumnsType<Score & { calculatedTotal?: number }> = [
    {
      title: 'MSV',
      dataIndex: 'mssv',
      key: 'mssv',
      align: 'center',
      render: (_: any, record: Score) => <span>{record.studentId}</span>,
    },
    {
      title: 'Điểm tự chấm',
      key: 'self',
      align: 'center',
      render: (_: any, record: Score) =>
        record.scores.discipline_score !== undefined ? (
          <span>{record.scores.discipline_score}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Điểm học tập',
      key: 'academic',
      align: 'center',
      render: (_: any, record: Score) =>
        record.scores.academic_score !== undefined ? (
          <span>{record.scores.academic_score}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Điểm NCKH',
      key: 'research',
      align: 'center',
      render: (_: any, record: Score) =>
        record.scores.research_score !== undefined ? (
          <span>{record.scores.research_score}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Điểm CLB',
      key: 'club',
      align: 'center',
      render: (_: any, record: Score) =>
        record.scores.club_score !== undefined ? (
          <span>{record.scores.club_score}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Điểm sự kiện',
      key: 'event',
      align: 'center',
      render: (_: any, record: Score) =>
        record.scores.event_score !== undefined ? (
          <span>{record.scores.event_score}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Tổng điểm',
      key: 'total',
      align: 'center',
      render: (_: any, record: any) =>
        record.calculatedTotal !== undefined ? (
          <span>{record.calculatedTotal}</span>
        ) : (
          <Tag color="blue">Chưa có điểm</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: Score) => (
        <div className="flex justify-center">
          <Button icon={<EditOutlined />} onClick={() => handleEditScore(record.studentId)} />
        </div>
      ),
    },
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
      <div className="p-6 max-w-screen-xl mx-auto w-full">
        {isLoadingOptions || isLoadingScore ? (
          <Loading message="Đang tải thông tin điểm sinh viên..." />
        ) : (
          <>
            <Typography.Title level={2} className="mb-4">Điểm</Typography.Title>

            <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Input
                placeholder="Tìm kiếm theo mã sinh viên..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="w-full sm:w-80"
              />

              <Select
                value={selectedSemesterId}
                onChange={handleSemesterChange}
                loading={isLoadingOptions}
                className="w-full sm:w-60"
                placeholder="Chọn học kỳ"
              >
                {semesterOptions?.data?.map((option: any) => (
                  <Option key={option.id} value={option.id}>
                    Kì {option.number} năm {option.year}
                  </Option>
                ))}
              </Select>
            </div>

            <Card className="shadow-md overflow-auto">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            {selectedStudent && (
              <EditScoreModal
                isVisible={isEditModalVisible}
                onClose={handleCloseModal}
                studentId={selectedStudent.studentId}
                semesterId={selectedSemesterId}
                initialScores={selectedStudent.scores}
                onSubmit={handleSubmit}
                scoreType="custom"
              />
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
}
