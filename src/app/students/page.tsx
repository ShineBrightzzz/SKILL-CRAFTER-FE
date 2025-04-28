'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import { Card, Typography, Table, Select } from 'antd';
import { useGetSemesterQuery, useGetStudentScoresBySemesterQuery } from '@/services/semester.service';
import { ColumnsType } from 'antd/es/table';
import Loading from '@/components/Loading'; // Import Loading component
import ErrorHandler from '@/components/ErrorHandler'; // Import ErrorHandler component

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
  const { data: semesterOptions, isLoading: isLoadingOptions, error: semesterError } = useGetSemesterQuery();
  const { data: studentScoresData, isLoading: isLoadingScore, error: scoreError } = useGetStudentScoresBySemesterQuery({
    semesterId: selectedSemesterId,
  });

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
  };

  const columns: ColumnsType<Score> = [
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
        <span>{record.scores.self_score ?? 'Chưa có điểm'}</span>
      ),
    },
    {
      title: 'Điểm học tập',
      key: 'academic',
      align: 'center',
      render: (_: any, record: Score) => (
        <span>{record.scores.academic_score ?? 'Chưa có điểm'}</span>
      ),
    },
    {
      title: 'Điểm NCKH',
      key: 'research',
      align: 'center',
      render: (_: any, record: Score) => (
        <span>{record.scores.research_score ?? 'Chưa có điểm'}</span>
      ),
    },
    {
      title: 'Điểm CLB',
      key: 'club',
      align: 'center',
      render: (_: any, record: Score) => (
        <span>{record.scores.club_score ?? 'Chưa có điểm'}</span>
      ),
    },
    {
      title: 'Điểm sự kiện',
      key: 'event',
      align: 'center',
      render: (_: any, record: Score) => (
        <span>{record.scores.event_score ?? 'Chưa có điểm'}</span>
      ),
    },
    {
      title: 'Tổng điểm',
      key: 'total',
      align: 'center',
      render: (_: any, record: Score) => (
        <span>{record.total_score ?? 'Chưa có điểm'}</span>
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
              <Table
                columns={columns}
                dataSource={studentScoresData?.data}
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
      </div>
    </Sidebar>
  );
}