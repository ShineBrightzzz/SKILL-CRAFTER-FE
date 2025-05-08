'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/layouts/sidebar";
import dayjs from 'dayjs';
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
  Popconfirm,
  Tooltip,
  Tag,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import UploadModal from '@/components/UploadModal';
import AddEventModal from '@/components/AddEventModal';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '@/services/events.service';
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

// Utility function to map semester identifiers to meaningful names
const getSemesterName = (semesterId: string): string => {
  const match = semesterId.match(/^S(\d)_(\d{4})$/);
  if (match) {
    const [_, semesterNumber, year] = match;
    return `Kỳ ${semesterNumber} năm ${year}`;
  }
  return 'Không xác định';
};

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
  const [localUploadStatus, setLocalUploadStatus] = useState<Record<string, boolean>>({});
  const ability = useAbility();
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  
  const { data: eventData, isLoading, error, refetch } = useGetEventsQuery();
  console.log('Event data:', eventData);
  
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const handleTableChange = (pagination: any, _: any, sorter: any) => {
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
    } catch {
      toast.error("Thêm sự kiện thất bại");
    }
  };

  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await updateEvent({ id: selectedEvent.eventId, body: eventData }).unwrap();
      toast.success("Cập nhật sự kiện thành công");
      setIsEditEventModalOpen(false);
      refetch();
    } catch {
      toast.error("Cập nhật sự kiện thất bại");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({ id: eventId }).unwrap();
      toast.success("Xóa sự kiện thành công");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi xóa sự kiện");
    }
  };

  const handleUpload = async (file: File, metadata?: Record<string, any>): Promise<void> => {
    const semesterId = metadata?.semesterId;
    const eventId = metadata?.eventId; // Get the event ID from metadata
    const type = metadata?.type;

    if (!semesterId || !type || !eventId) {
      toast.error('Thiếu thông tin học kỳ, sự kiện hoặc loại upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester_id', semesterId);
    formData.append('event_id', eventId); // Add event ID to form data

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

      if (!response.ok) throw new Error('Upload failed');

      // Update local state using eventId as the key instead of semesterId
      setLocalUploadStatus((prev) => ({
        ...prev,
        [eventId]: true, // Use eventId instead of semesterId
      }));

      toast.success(`Tải lên ${type} thành công`);
      setIsUploadModalOpen(false);
    } catch {
      toast.error(`Lỗi khi tải lên ${type}`);
    }
  };

  // Remove localStorage effect
  
  const openUploadModal = (semesterId: string, type: string, eventId: string) => {
    const match = semesterId.match(/^S(\d)_(\d{4})$/);
    if (match) {
      const [_, semesterNumber, year] = match;
      setSelectedSemester({ id: semesterId, number: parseInt(semesterNumber), year: parseInt(year) });
    } else {
      setSelectedSemester({ id: semesterId, number: 0, year: 0 });
    }
    setSelectedEvent({ eventId } as Event); // Set selected event with ID
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const filteredEvents = eventData?.data?.filter((event: any) => {
    const searchTerm = searchText.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchTerm) ||
      event.organizingUnit?.toLowerCase().includes(searchTerm) ||
      event.location?.toLowerCase().includes(searchTerm)
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
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      render: (semesterId: string) => getSemesterName(semesterId),
    },
    {
      title: 'Điểm sự kiện',
      key: 'eventScore',
      align: 'center' as const,
      render: (_: any, record: Event) => {
        const uploaded = localUploadStatus[record.eventId]; // Use eventId instead of semesterId
        return (
          <div className="flex justify-center items-center gap-2">
            {uploaded ? (
              <Tag color="success">Đã upload</Tag>
            ) : (
              <Tooltip title="Tải lên điểm sự kiện">
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => openUploadModal(record.semester, 'Điểm sự kiện', record.eventId)}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  if (ability.can(Action.Update, Subject.Event) || ability.can(Action.Delete, Subject.Event)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: Event) => (
        <div className="flex flex-wrap gap-2 justify-center">
          {ability.can(Action.Update, Subject.Event) && (
            <Button icon={<EditOutlined />} onClick={() => {
              setSelectedEvent(record);
              setIsEditEventModalOpen(true);
            }} />
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
            <Typography.Title level={2} className="mb-4 text-xl sm:text-2xl md:text-3xl">
              Danh sách sự kiện
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Tìm kiếm sự kiện..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-full"
                />
              </div>

              {ability.can(Action.Create, Subject.Event) && (
                <div className="flex-shrink-0">
                  {isSmallScreen ? (
                    <Tooltip title="Thêm sự kiện">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddEventModalOpen(true)}
                        className="min-w-[40px]"
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
                </div>
              )}
            </div>

            <Card className="overflow-auto">
              <Table
                columns={columns}
                dataSource={filteredEvents}
                rowKey="eventId"
                pagination={{
                  pageSize,
                  current: currentPage,
                  total: filteredEvents?.length,
                  onChange: setCurrentPage,
                  onShowSizeChange: (_, size) => setPageSize(size),
                }}
                onChange={handleTableChange}
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
          eventId={selectedEvent?.eventId} // Pass the event ID to the modal
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
