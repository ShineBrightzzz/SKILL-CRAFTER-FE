// 'use client';

// import { useEffect, useState } from 'react';
// import Sidebar from "@/layouts/sidebar";
// import { Card, Typography, Table, Button, message } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import UploadModal from '@/components/UploadModal';

// interface Semester {
//   semester_id: string;
//   number: number;
//   year: number;
// }

// interface Club {
//   id: string;
//   name: string;
// }

// export default function ClubPage() {
//   const [clubs, setClubs] = useState<Club[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
//   const [uploadType, setUploadType] = useState<string>('');

//   useEffect(() => {
//     const fetchClubs = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/clubs');
//         if (!response.ok) throw new Error('Failed to fetch clubs');
//         const data = await response.json();
//         setClubs(data);
//       } catch (error) {
//         console.error('Error fetching clubs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClubs();
//   }, []);

//   const handleUpload = async (file: File, metadata?: Record<string, any>) => {
//     const semesterId = metadata?.semesterId;
//     const type = metadata?.type;

//     if (!semesterId || !type) {
//       message.error('Thiếu thông tin học kỳ hoặc loại upload');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('semester_id', semesterId);

//     let uploadUrl = '';
//     if (type === 'Điểm CLB') {
//       uploadUrl = 'http://localhost:8000/file-processing/club';
//     } else {
//       message.error('Không xác định được loại upload');
//       return;
//     }

//     try {
//       const response = await fetch(uploadUrl, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Upload failed');
//       }

//       message.success(`Tải lên ${type} thành công`);
//     } catch (error) {
//       message.error(`Lỗi khi tải lên ${type}, vui lòng thử lại.`);
//     }
//   };

//   const openUploadModal = (semesterId: string, type: string) => {
//     setSelectedSemester({ semester_id: semesterId, number: 0, year: 0 });
//     setUploadType(type);
//     setIsModalOpen(true);
//   };

//   const columns = [
//     {
//       title: 'Tên CLB',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: 'Đánh giá thành viên',
//       key: 'clubScore',
//       align: 'center' as const,
//       render: (_: any, record: Club) => (
//         <Button
//           icon={<UploadOutlined />}
//           onClick={() => openUploadModal(record.semester_id, 'Điểm CLB')}
//         />
//       ),
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Sidebar />
//       <div className="ml-64 p-8">
//         <Card className="shadow-md">
//           <Typography.Title level={2} className="mb-6">
//             Clubs
//           </Typography.Title>
//           <Table
//             columns={columns}
//             dataSource={clubs}
//             rowKey="id"
//             loading={loading}
//             pagination={{ pageSize: 10 }}
//           />
//         </Card>
//       </div>

//       <UploadModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setSelectedSemester(null);
//         }}
//         semester={selectedSemester}
//         uploadType={uploadType}
//         onUpload={handleUpload}
//       />
//     </div>
//   );
// }
