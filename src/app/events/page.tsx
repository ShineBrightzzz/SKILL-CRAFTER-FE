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
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import { UploadOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UploadModal from '@/components/UploadModal';
import AddEventModal from '@/components/AddEventModal';
import { useGetEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } from '@/services/events.service';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import { useMediaQuery } from 'react-responsive';

interface Semester {
  id: string;
  number: number;
  year: number;
}

interface Event {
  eventId: string;
  title: string;
  organizingUnit: string;
  startTime: string;
  endTime: string;
  location: string;
  semester: string;
  participationMethod?: string;
}

const EventsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploadType, setUploadType] = useState<string>('');

  const { data: eventData, isLoading, error, refetch } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const ability = useAbility();

  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || null);
    setSortOrder(sorter.order || null);
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      await createEvent(eventData).unwrap();
      toast.success("Thêm sự kiện thành công");
      setIsAddEventModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi thêm sự kiện");
    }
  };

  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await updateEvent({ id: selectedEvent.eventId, body: eventData }).unwrap();
      toast.success("Cập nhật sự kiện thành công");
      setIsEditEventModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi cập nhật sự kiện");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({ id: eventId }).unwrap();
      message.success("Xóa sự kiện thành công");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Lỗi khi xóa sự kiện");
    }
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

    try {
      const response = await fetch('http://localhost:8000/file-processing/event', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      toast.success('Tải lên thành công');
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error('Lỗi khi tải lên');
    }
  };

  const openUploadModal = (semesterId: string, type: string) => {
    setSelectedSemester({ id: semesterId, number: 0, year: 0 });
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const filteredEvents = eventData?.data?.filter((event: any) => {
    const searchTermLower = searchText.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchTermLower) ||
      event.organizingUnit?.toLowerCase().includes(searchTermLower) ||
      event.location?.toLowerCase().includes(searchTermLower)
    );
  });

  const columns: any = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'title',
      sorter: (a: Event, b: Event) => a.title.localeCompare(b.title),
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizingUnit',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
  ];

  if (ability.can(Action.Update, Subject.Event) || ability.can(Action.Delete, Subject.Event)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Event) => (
        <div className="flex flex-wrap gap-2 justify-center">
          {ability.can(Action.Update, Subject.Event) && (
            <Button icon={<EditOutlined />} onClick={() => { setSelectedEvent(record); setIsEditEventModalOpen(true); }} />
          )}
          {ability.can(Action.Delete, Subject.Event) && (
            <Popconfirm
              title="Xóa sự kiện này?"
              onConfirm={() => handleDeleteEvent(record.eventId)}
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

  if (error) return <Sidebar><ErrorHandler status={(error as any).status || 500} /></Sidebar>;

  return (
    <Sidebar>
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoading ? (
          <Loading message="Đang tải danh sách sự kiện..." />
        ) : (
          <>
            <Typography.Title
              level={2}
              className="mb-4 text-xl sm:text-2xl md:text-3xl"
            >
              Danh sách sự kiện
            </Typography.Title>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="w-full sm:w-80"
              />
              {ability.can(Action.Create, Subject.Event) && (
                <>
                  {isSmallScreen ? (
                    <Tooltip title="Thêm sự kiện">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddEventModalOpen(true)}
                      />
                    </Tooltip>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsAddEventModalOpen(true)}
                    >
                      Thêm sự kiện
                    </Button>
                  )}
                </>
              )}
            </div>

            <Card className="overflow-auto">
              <Table
                columns={columns}
                dataSource={filteredEvents}
                rowKey="eventId"
                pagination={{ pageSize, current: currentPage, total: filteredEvents?.length, onChange: setCurrentPage, onShowSizeChange: (_, size) => setPageSize(size) }}
                onChange={handleTableChange}
              />
            </Card>
          </>
        )}

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          semester={selectedSemester}
          uploadType={uploadType}
          onUpload={handleUpload}
        />

        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEvent}
        />

        {selectedEvent && (
          <AddEventModal
            isOpen={isEditEventModalOpen}
            onClose={() => setIsEditEventModalOpen(false)}
            onAddEvent={handleEditEvent}
            initialValues={selectedEvent}
            isEditing
          />
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(EventsPage, Action.Read, Subject.EventParticipation);
