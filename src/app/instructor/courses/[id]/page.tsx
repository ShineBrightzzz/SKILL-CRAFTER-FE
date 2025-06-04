'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, List, Typography, Space, Modal, message, Spin, Table, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGetCourseByIdQuery, useGetEnrollmentsByCourseIdQuery, useUpdateCourseStatusMutation } from '@/services/course.service';
import { useGetChaptersByCourseIdQuery } from '@/services/chapter.service';
import { useAuth } from '@/store/hooks';
import CourseStatusDisplay from '@/components/instructor/CourseStatusDisplay';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

interface CourseDetailProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const router = useRouter();
  const courseId = params.id;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch course details
  const { data: courseResponse, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
  const course = courseResponse?.data;
  
  // Fetch chapters
  const { data: chaptersResponse, isLoading: chaptersLoading } = useGetChaptersByCourseIdQuery({
    courseId
  });
  const chapters = chaptersResponse?.data?.result || [];
  
  // Fetch enrollments
  const { data: enrollmentsResponse, isLoading: enrollmentsLoading } = useGetEnrollmentsByCourseIdQuery({
    courseId,
    page: currentPage,
    pageSize: pageSize
  });
    // Submit course for approval mutation
  const [updateCourseStatus, { isLoading: isSubmitting }] = useUpdateCourseStatusMutation();
  
  const enrollments = enrollmentsResponse?.data?.result || [];
  const enrollmentMeta = enrollmentsResponse?.data?.meta || {
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 0
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 300,
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolledAt',
      key: 'enrolledAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Lần truy cập cuối',
      dataIndex: 'lastAccessedAt',
      key: 'lastAccessedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa truy cập',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa hoàn thành',
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progressPercentage',
      key: 'progressPercentage',
      render: (progress: number) => `${Math.round(progress)}%`,
    },
  ];
  
  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2 text-xl">Đang tải thông tin khóa học...</p>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy khóa học</p>
      </div>
    );
  }
  
  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Không xác định';
    }
  };
  
  const getStatusText = (status?: number) => {
    switch (status) {
      case 0: return { text: 'Bản nháp', color: 'gray' };
      case 1: return { text: 'Đang chờ duyệt', color: 'orange' };
      case 2: return { text: 'Đã duyệt', color: 'green' };
      case 3: return { text: 'Từ chối', color: 'red' };
      default: return { text: 'Bản nháp', color: 'gray' };
    }
  };
  
  const handleAddChapter = () => {
    router.push(`/instructor/courses/${courseId}/add-chapter`);
  };
  
  const handleEditChapter = (chapterId: string) => {
    router.push(`/instructor/chapters/${chapterId}/edit`);
  };
  
  const handleDeleteChapter = (chapterId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chương học này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // API call to delete chapter
        message.success('Đã xóa chương học');
      }
    });
  };
  
  const handleManageLessons = (chapterId: string) => {
    router.push(`/instructor/chapters/${chapterId}`);
  };
    const handleSubmitForApproval = () => {
    Modal.confirm({
      title: 'Xác nhận gửi khóa học',
      content: 'Khóa học sẽ được gửi đi để xét duyệt. Bạn có chắc chắn muốn tiếp tục?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateCourseStatus({ courseId, status: 1 }).unwrap();
          message.success('Đã gửi khóa học để xét duyệt');
        } catch (error) {
          message.error('Có lỗi xảy ra khi gửi khóa học');
          console.error(error);
        }
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => router.push(`/instructor`)} className="mb-4">
            ← Quay lại
          </Button>
          <div className="space-x-2">
            <div className="flex items-center gap-2">
              <CourseStatusDisplay status={course.status} message={course.statusMessage} />
              {course.status !== 1 && course.status !== 2 && (
                <Button 
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmitForApproval}
                  loading={isSubmitting}
                >
                  Gửi để duyệt
                </Button>
              )}
              {course.status === 1 && (
                <Button 
                  type="default"
                  icon={<SendOutlined />}
                  disabled={true}
                >
                  Đang chờ duyệt
                </Button>
              )}
              <Button 
                type="primary" 
                onClick={() => router.push(`/instructor/courses/${courseId}/edit`)}
              >
                Chỉnh sửa khóa học
              </Button>
            </div>
          </div>
        </div>
        
        <Card>
          <Title level={2}>{course.title}</Title>
          <div className="flex justify-between mb-4">
            <div>
              <Text type="secondary">Danh mục: {course.categoryName || 'Chưa phân loại'}</Text>
              <br />
              <Text type="secondary">Cấp độ: {getLevelText(course.level)}</Text>
            </div>
          </div>
          <Paragraph>{course.description}</Paragraph>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card size="small">
              <Paragraph className="mb-0">
                <strong>Giá:</strong> {new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ
              </Paragraph>
            </Card>
            <Card size="small">
              <Paragraph className="mb-0">
                <strong>Thời lượng:</strong> {course.duration || 0} giờ
              </Paragraph>
            </Card>
            <Card size="small">
              <Paragraph className="mb-0">
                <strong>Số chương học:</strong> {chapters.length}
              </Paragraph>
            </Card>
          </div>
          
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Tổng quan" key="overview">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4}>Nội dung khóa học</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddChapter}
                  >
                    Thêm chương mới
                  </Button>
                </div>
                
                {chaptersLoading ? (
                  <div className="flex justify-center py-8">
                    <Spin />
                    <Text className="ml-2">Đang tải dữ liệu...</Text>
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Text type="secondary">Chưa có chương học nào. Hãy thêm chương học đầu tiên!</Text>
                    <div className="mt-4">
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAddChapter}
                      >
                        Thêm chương mới
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chapters.map((chapter: any, index: number) => (
                      <div key={chapter.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-blue-50 p-4 flex justify-between items-center border-b">
                          <div>
                            <div className="flex items-center">
                              <span className="text-blue-600 font-medium mr-2">Chương {index + 1}:</span>
                              <span className="font-medium">{chapter.name}</span>
                            </div>
                            <Text type="secondary">Thời lượng: {chapter.estimatedTime || 0} phút</Text>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditChapter(chapter.id)}
                            >
                              Sửa
                            </Button>
                            <Button 
                              type="primary"
                              icon={<FileTextOutlined />} 
                              onClick={() => handleManageLessons(chapter.id)}
                            >
                              Quản lý bài học
                            </Button>
                            <Button 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteChapter(chapter.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab="Học viên đã đăng ký" key="enrollments">
              {enrollmentsLoading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                  <Text className="ml-2">Đang tải dữ liệu...</Text>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Text type="secondary">Chưa có học viên nào đăng ký khóa học này.</Text>
                </div>
              ) : (
                <Table 
                  dataSource={enrollments}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    current: enrollmentMeta.page,
                    pageSize: enrollmentMeta.pageSize,
                    total: enrollmentMeta.total,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                    }
                  }}
                />
              )}
            </TabPane>
            <TabPane tab="Thống kê" key="statistics">
              <p>Chức năng thống kê sẽ được phát triển sau.</p>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
