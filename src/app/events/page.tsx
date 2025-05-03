'use client';

import { useState } from 'react';
import Sidebar from "@/layouts/sidebar";
import dayjs from 'dayjs';
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
} from 'antd';
import { UploadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import UploadModal from '@/components/UploadModal';
import AddEventModal from '@/components/AddEventModal';
import { useGetEventsQuery, useCreateEventMutation } from '@/services/events.service';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';

interface Semester {
  id: string;
  number: number;
  year: number;
}

interface Event {
  id: string;
  name: string;
  organizing_unit: string;
  startTime: string;
  endTime: string;
  location: string;
  semester: string;
}

const EventsPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  
  const { data: eventData, isLoading, error, refetch } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();


  const ability = useAbility();

  const handleAddEvent = async (eventData: any) => {
    try {
      await createEvent(eventData).unwrap();
      toast.success("Thêm sự kiện thành công");
      refetch();
    } catch (error) {
      toast.error("Lỗi khi thêm sự kiện");
      console.error("Error creating event:", error);
    }
  };

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
    setIsUploadModalOpen(true);
  };

  // Filter events based on search text
  const filteredEvents = eventData?.data?.filter((event: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    
    return (
      (event.title && event.title.toLowerCase().includes(searchTermLower)) ||
      (event.organizingUnit && event.organizingUnit.toLowerCase().includes(searchTermLower)) ||
      (event.location && event.location.toLowerCase().includes(searchTermLower))
    );
  });

  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizingUnit',
      key: 'organizingUnit',
      width: 180,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'start_time',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
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

  if (error) {
    const status = (error as any).status || 500; 
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
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsAddEventModalOpen(true)}
                >
                  Thêm sự kiện
                </Button>
              )}
            </div>

            <Card className="shadow-md">
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Tìm kiếm sự kiện..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredEvents}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}

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

        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEvent}
        />
      </div>
    </Sidebar>
  );
};

export default withPermission(EventsPage, Action.Read, Subject.EventParticipation);