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
  Popconfirm
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
  // Table states
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  
  // Data fetching states
  const { data: eventData, isLoading, error, refetch } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const ability = useAbility();

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

  // Handle add event submission
  const handleAddEvent = async (eventData: any) => {
    try {
      await createEvent(eventData).unwrap();
      toast.success("Thêm sự kiện thành công");
      setIsAddEventModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi thêm sự kiện");
      console.error("Error creating event:", error);
    }
  };

  // Handle edit event submission
  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    
    try {
      await updateEvent({ 
        id: selectedEvent.eventId, 
        body: eventData 
      }).unwrap();
      
      toast.success("Cập nhật sự kiện thành công");
      setIsEditEventModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Lỗi khi cập nhật sự kiện");
      console.error("Error updating event:", error);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({ id: eventId }).unwrap();
      message.success("Xóa sự kiện thành công");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Lỗi khi xóa sự kiện");
    }
  };

  // Handle opening edit modal
  const handleEditEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventModalOpen(true);
  };

  // Handle file uploads
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
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error(`Lỗi khi tải lên ${type}, vui lòng thử lại.`);
      throw error;
    }
  };

  // Open upload modal
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

  // Define table columns
  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      sorter: (a: Event, b: Event) => a.title.localeCompare(b.title),
    },
    {
      title: 'Đơn vị tổ chức',
      dataIndex: 'organizingUnit',
      key: 'organizingUnit',
      width: 180,
      render: (text: string) => text,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'start_time',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Event, b: Event) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'end_time',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
  ];

  // Add actions column if user has permission
  if (ability.can(Action.Update, Subject.Event) || 
      ability.can(Action.Delete, Subject.Event) || 
      ability.can(Action.Create, Subject.EventScore)) {
    
    columns.push({
      title: 'Hành động',
      dataIndex: 'actions', // Added dataIndex property
      key: 'actions',
      render: () => '',
      sorter: undefined, // Explicitly set sorter to undefined
    });
  }

  // Check for errors and handle them
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
      <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8f9fa", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div className="p-4 shadow-lg rounded w-full sm:max-w-2xl">
          <Typography.Title level={2} className="text-center sm:text-left">Danh sách sự kiện</Typography.Title>
          <Card className="shadow-md">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
              <Input
                placeholder="Tìm kiếm sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", maxWidth: "300px" }}
                allowClear
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredEvents}
              rowKey="eventId"
              pagination={{ 
                pageSize: pageSize, 
                current: currentPage,
                total: filteredEvents?.length,
                onChange: (page) => setCurrentPage(page),
                onShowSizeChange: (_, size) => setPageSize(size)
              }}
              onChange={handleTableChange}
              className="w-full"
            />
          </Card>
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

        {/* Add Event Modal */}
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEvent}
        />

        {/* Edit Event Modal - Similar to AddEventModal but with pre-filled values */}
        {selectedEvent && (
          <AddEventModal
            isOpen={isEditEventModalOpen}
            onClose={() => setIsEditEventModalOpen(false)}
            onAddEvent={handleEditEvent}
            initialValues={selectedEvent}
            isEditing={true}
          />
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(EventsPage, Action.Read, Subject.EventParticipation);