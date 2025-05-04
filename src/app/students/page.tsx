'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Select, Tag, Button, Input } from 'antd';
import { useGetSemesterQuery, useGetStudentScoresBySemesterQuery } from '@/services/semester.service';
import { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import EditScoreModal from '@/components/EditScoreModal';

const { Option } = Select;

interface Score {
  studentId: string;
  scores: {
    self_score?: number;
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
  const { data: studentScoresData, isLoading: isLoadingScore, error: scoreError, refetch } = useGetStudentScoresBySemesterQuery({
    semesterId: selectedSemesterId,
  });

  // Set default semester when data is loaded
  useEffect(() => {
    if (semesterOptions?.data?.length > 0 && !selectedSemesterId) {
      setSelectedSemesterId(semesterOptions.data[0].id);
    }
  }, [semesterOptions, selectedSemesterId]);

  // Tính toán lại tổng điểm từ các thành phần điểm
  const processedData = useMemo(() => {
    if (!studentScoresData?.data) return [];
    
    return studentScoresData.data.map((student: Score) => {
      // Lấy tất cả các điểm thành phần
      const scores = {
        self: student.scores.self_score || 0,
        academic: student.scores.academic_score || 0,
        research: student.scores.research_score || 0,
        club: student.scores.club_score || 0,
        event: student.scores.event_score || 0
      };
      
      // Tính tổng điểm
      const calculatedTotal = Math.min(scores.self + scores.academic + scores.research + scores.club + scores.event, 100);
      
      // Kiểm tra xem có điểm thành phần nào chưa
      const hasAnyScore = Object.values(scores).some(score => score > 0);
      
      return {
        ...student,
        calculatedTotal: hasAnyScore ? calculatedTotal : undefined
      };
    });
  }, [studentScoresData]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!processedData) return [];
    
    return processedData.filter((student: any) => {
      if (!searchText) return true;
      const searchTermLower = searchText.toLowerCase();
      
      // Search by student ID
      return student.studentId.toLowerCase().includes(searchTermLower);
    });
  }, [processedData, searchText]);

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
  };

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
    // Refresh the data after editing
    refetch();
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
      render: (_: any, record: Score) => (
        record.scores.self_score !== undefined ? 
          <span>{record.scores.self_score}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Điểm học tập',
      key: 'academic',
      align: 'center',
      render: (_: any, record: Score) => (
        record.scores.academic_score !== undefined ? 
          <span>{record.scores.academic_score}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Điểm NCKH',
      key: 'research',
      align: 'center',
      render: (_: any, record: Score) => (
        record.scores.research_score !== undefined ? 
          <span>{record.scores.research_score}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Điểm CLB',
      key: 'club',
      align: 'center',
      render: (_: any, record: Score) => (
        record.scores.club_score !== undefined ? 
          <span>{record.scores.club_score}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Điểm sự kiện',
      key: 'event',
      align: 'center',
      render: (_: any, record: Score) => (
        record.scores.event_score !== undefined ? 
          <span>{record.scores.event_score}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Tổng điểm',
      key: 'total',
      align: 'center',
      render: (_: any, record: any) => (
        record.calculatedTotal !== undefined ? 
          <span>{record.calculatedTotal}</span> : 
          <Tag color="blue">Chưa có điểm</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: Score) => (
        <div className="flex justify-center">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditScore(record.studentId)}
          />
        </div>
      ),
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
        {isLoadingOptions || isLoadingScore ? (
          <Loading message="Đang tải thông tin điểm sinh viên..." />
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Title level={2} className="mb-6">
                Điểm
              </Typography.Title>

              <Select
                value={selectedSemesterId}
                onChange={handleSemesterChange}
                loading={isLoadingOptions}
                style={{ width: 200 }}
                placeholder="Chọn học kỳ"
              >
                {semesterOptions?.data?.map((option: any) => (
                  <Option key={option.id} value={option.id}>
                    Kì {option.number} năm {option.year}
                  </Option>
                ))}
              </Select>
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                  placeholder="Tìm kiếm theo mã sinh viên..."
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
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
              />
            </Card>


            {/* // sửa điểm rèn luyện cần có service hoặc API nữa */}
            {selectedStudent && (
              <EditScoreModal
                isVisible={isEditModalVisible}
                onClose={handleCloseModal}
                studentId={selectedStudent.studentId}
                semesterId={selectedSemesterId}
                initialScores={selectedStudent.scores}
                onSubmit={async (values) => {
                  console.log('Submitted values:', values);
                }} // Updated to return a Promise<void>
                scoreType="custom" // Added scoreType prop
              />
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
}