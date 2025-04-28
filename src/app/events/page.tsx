'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import dayjs from 'dayjs';
import {
  Card,
  Typography,
  Table,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import UploadModal from '@/components/UploadModal';
import { useGetEventsQuery } from '@/services/events.service';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading'; // Import the Loading component
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';

interface Semester {
  id: string;
  number: number;
  year: number;
}

interface Event {
  id: string;
  name: string;
  organizing_unit: string;
  start_time: string;
  end_time: string;
  location: string;
  semester: string;
}

const EventsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const { data: eventData, isLoading } = useGetEventsQuery();

  const ability = useAbility();

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

    const uploadUrl =
      type === 'Điểm sự kiện'
        ? 'http://localhost:8000/file-processing/event'
        : '';

    if (!uploadUrl) {
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

  const openUploadModal = (semesterId: string, type: string) => {
    setSelectedSemester({ id: semesterId, number: 0, year: 0 });
    setUploadType(type);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizingUnit',
      key: 'organizingUnit',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Điểm sự kiện',
      key: 'eventScore',
      align: 'center' as const,
      render: (_: any, record: Event) => (
        <Button
          icon={<UploadOutlined />}
          onClick={() => openUploadModal(record?.semester, 'Điểm sự kiện')}
        />
      ),
    },
  ];

  return (
    <Sidebar>
      <div style={{ padding: 24 }}>
        {isLoading ? (
          <Loading message="Đang tải danh sách sự kiện..." />
        ) : (
          <>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography.Title level={2} className="mb-6 text-center">
                Danh sách Sự kiện
              </Typography.Title>
              {ability.can(Action.Create, Subject.Event) && (
                <Button type="primary" onClick={() => {}}>+ Thêm sự kiện</Button>
              )}
            </div>

            <Card className="shadow-md">
              <Table
                columns={columns}
                dataSource={eventData?.data}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}

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
      </div>
    </Sidebar>
  );
};

export default EventsPage;