'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Typography, Card, Tag, Button, Collapse, Progress } from 'antd';
import { ArrowRightOutlined, BookOutlined, ClockCircleOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Sample data for learning paths
const learningPaths = [
  {
    id: 1,
    title: 'Lộ trình Frontend Developer',
    description: 'Trở thành Frontend Developer chuyên nghiệp với các công nghệ hiện đại như HTML, CSS, JavaScript, React và nhiều thư viện khác. Xây dựng các ứng dụng web đáp ứng và trải nghiệm người dùng tuyệt vời.',
    image: '/images/frontend.jpg',
    duration: '6 tháng',
    level: 'Cơ bản đến Nâng cao',
    students: 1200,
    rating: 4.8,
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    courses: [
      {
        id: 101,
        title: 'HTML & CSS cơ bản',
        description: 'Học cách xây dựng và tạo kiểu cho trang web với HTML và CSS',
        level: 1,
        duration: '3 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 102,
        title: 'JavaScript cơ bản',
        description: 'Làm quen với JavaScript và các khái niệm lập trình cơ bản',
        level: 1,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 103,
        title: 'HTML & CSS nâng cao',
        description: 'Học các kỹ thuật CSS nâng cao và layout phức tạp',
        level: 2,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 104,
        title: 'JavaScript nâng cao',
        description: 'Đi sâu vào JavaScript với ES6+, bất đồng bộ và các pattern',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 105,
        title: 'React cơ bản',
        description: 'Làm quen với React và xây dựng ứng dụng đơn trang',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 106,
        title: 'React nâng cao',
        description: 'State management, hooks nâng cao và performance optimization',
        level: 3,
        duration: '6 tuần',
        imageUrl: '/logo.png',
      }
    ]
  },
  {
    id: 2,
    title: 'Lộ trình Backend Developer',
    description: 'Phát triển kỹ năng xây dựng máy chủ, API và cơ sở dữ liệu với Node.js, Express, MongoDB và nhiều công nghệ backend khác. Học cách xây dựng hệ thống web có khả năng mở rộng cao.',
    image: '/images/backend.jpg',
    duration: '7 tháng',
    level: 'Cơ bản đến Nâng cao',
    students: 980,
    rating: 4.7,
    tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    courses: [
      {
        id: 201,
        title: 'Cơ bản về Backend',
        description: 'Hiểu về vai trò của backend trong phát triển web',
        level: 1,
        duration: '2 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 202,
        title: 'JavaScript cho Backend',
        description: 'Sử dụng JavaScript trên môi trường server',
        level: 1,
        duration: '3 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 203,
        title: 'Node.js cơ bản',
        description: 'Xây dựng server với Node.js và hiểu về event loop',
        level: 2,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 204,
        title: 'Express & REST API',
        description: 'Tạo API với Express framework và RESTful principles',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 205,
        title: 'MongoDB và Mongoose',
        description: 'Làm việc với cơ sở dữ liệu NoSQL và ODM',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 206,
        title: 'Authentication & Authorization',
        description: 'Bảo mật API và quản lý người dùng',
        level: 3,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 207,
        title: 'Deployment và CI/CD',
        description: 'Triển khai ứng dụng lên production với CI/CD',
        level: 3,
        duration: '3 tuần',
        imageUrl: '/logo.png',
      }
    ]
  },
  {
    id: 3,
    title: 'Lộ trình Fullstack Developer',
    description: 'Trở thành lập trình viên toàn diện với kỹ năng xây dựng ứng dụng từ đầu đến cuối. Kết hợp kiến thức frontend và backend để phát triển ứng dụng web hoàn chỉnh.',
    image: '/images/fullstack.jpg',
    duration: '9 tháng',
    level: 'Trung cấp đến Nâng cao',
    students: 750,
    rating: 4.9,
    tags: ['React', 'Node.js', 'MongoDB', 'Full Stack'],
    courses: [
      {
        id: 301,
        title: 'HTML, CSS & JavaScript',
        description: 'Nền tảng cơ bản cho phát triển web',
        level: 1,
        duration: '6 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 302,
        title: 'React cơ bản',
        description: 'Xây dựng giao diện người dùng với React',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 303,
        title: 'Node.js & Express',
        description: 'Phát triển backend với Node.js và Express',
        level: 2,
        duration: '5 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 304,
        title: 'MongoDB và Mongoose',
        description: 'Thiết kế và quản lý cơ sở dữ liệu NoSQL',
        level: 2,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 305,
        title: 'RESTful API Development',
        description: 'Thiết kế và xây dựng API theo chuẩn REST',
        level: 2,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 306,
        title: 'Redux & State Management',
        description: 'Quản lý state trong ứng dụng lớn với Redux',
        level: 3,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 307,
        title: 'Authentication & Security',
        description: 'Bảo mật ứng dụng web toàn diện',
        level: 3,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 308,
        title: 'Dự án Fullstack',
        description: 'Xây dựng dự án thực tế end-to-end',
        level: 3,
        duration: '8 tuần',
        imageUrl: '/logo.png',
      }
    ]
  },
  {
    id: 4,
    title: 'Lộ trình Data Science',
    description: 'Học cách phân tích, trực quan hóa dữ liệu và xây dựng mô hình học máy với Python, Pandas, Scikit-learn và nhiều thư viện khác. Trở thành chuyên gia phân tích dữ liệu.',
    image: '/images/datascience.jpg',
    duration: '8 tháng',
    level: 'Cơ bản đến Nâng cao',
    students: 650,
    rating: 4.8,
    tags: ['Python', 'Pandas', 'Machine Learning', 'Data Visualization'],
    courses: [
      {
        id: 401,
        title: 'Python cơ bản',
        description: 'Học lập trình Python từ cơ bản đến nâng cao',
        level: 1,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 402,
        title: 'Thống kê cho Data Science',
        description: 'Nền tảng thống kê cho phân tích dữ liệu',
        level: 1,
        duration: '3 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 403,
        title: 'Pandas & NumPy',
        description: 'Xử lý dữ liệu với các thư viện Python chuyên dụng',
        level: 2,
        duration: '4 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 404,
        title: 'Trực quan hóa dữ liệu',
        description: 'Tạo biểu đồ và trực quan với Matplotlib và Seaborn',
        level: 2,
        duration: '3 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 405,
        title: 'Machine Learning cơ bản',
        description: 'Các thuật toán học máy cơ bản với Scikit-learn',
        level: 2,
        duration: '6 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 406,
        title: 'Deep Learning cơ bản',
        description: 'Mạng neural với TensorFlow và Keras',
        level: 3,
        duration: '6 tuần',
        imageUrl: '/logo.png',
      },
      {
        id: 407,
        title: 'Dự án Data Science',
        description: 'Ứng dụng kiến thức vào các dự án thực tế',
        level: 3,
        duration: '6 tuần',
        imageUrl: '/logo.png',
      }
    ]
  }
];

// Function to render course level as text
const getLevelText = (level: number) => {
  switch (level) {
    case 1:
      return 'Cơ bản';
    case 2:
      return 'Trung cấp';
    case 3:
      return 'Nâng cao';
    default:
      return 'Không xác định';
  }
};

export default function LearningPathsPage() {
  const [expandedPath, setExpandedPath] = useState<number | null>(null);

  const togglePathExpand = (pathId: number) => {
    setExpandedPath(expandedPath === pathId ? null : pathId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title level={1} className="mb-4 text-gradient">Lộ Trình Học Tập</Title>
          <Paragraph className="text-gray-600 text-lg max-w-3xl mx-auto">
            Chọn một trong các lộ trình học tập được thiết kế bởi chuyên gia để phát triển kỹ năng và đạt được mục tiêu nghề nghiệp của bạn.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {learningPaths.map((path) => (
            <div key={path.id} className="transition-all duration-300">
              <Card 
                className="overflow-hidden shadow-md hover:shadow-xl transition-all"
                bodyStyle={{ padding: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                  <div className="relative h-60 md:h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800">
                      <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                        <Title level={3} className="text-white m-0">{path.title}</Title>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center">
                            <ClockCircleOutlined className="mr-2" />
                            <Text className="text-white">{path.duration}</Text>
                          </div>
                          <div className="flex items-center">
                            <BookOutlined className="mr-2" />
                            <Text className="text-white">{path.courses.length} khóa học</Text>
                          </div>
                          <div className="flex items-center">
                            <UserOutlined className="mr-2" />
                            <Text className="text-white">{path.students} học viên</Text>
                          </div>
                          <div className="flex items-center">
                            <StarOutlined className="mr-2" />
                            <Text className="text-white">{path.rating}/5.0 đánh giá</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 md:col-span-2 lg:col-span-3 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.tags.map((tag, index) => (
                          <Tag key={index} color="blue">{tag}</Tag>
                        ))}
                      </div>
                      <Paragraph className="text-gray-600">
                        {path.description}
                      </Paragraph>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Text className="text-gray-500">Độ khó: {path.level}</Text>
                      <Button 
                        type="primary" 
                        onClick={() => togglePathExpand(path.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {expandedPath === path.id ? 'Thu gọn' : 'Xem chi tiết'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {expandedPath === path.id && (
                  <div className="p-6 bg-gray-50 border-t">
                    <Title level={4} className="mb-4">Các khóa học trong lộ trình</Title>
                    <div className="space-y-4">
                      {path.courses.map((course, index) => (
                        <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center">
                            <div className="relative w-16 h-16 rounded overflow-hidden mr-4 flex-shrink-0">
                              <Image 
                                src={course.imageUrl} 
                                alt={course.title} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <Text className="text-gray-400 text-sm">Bước {index + 1}</Text>
                                  <Title level={5} className="mt-0 mb-1">{course.title}</Title>
                                </div>
                                <div className="flex items-center">
                                  <Tag color={course.level === 1 ? 'green' : course.level === 2 ? 'blue' : 'purple'}>
                                    {getLevelText(course.level)}
                                  </Tag>
                                  <Text className="ml-2 text-gray-500 hidden md:inline">{course.duration}</Text>
                                </div>
                              </div>
                              <Paragraph className="text-gray-600 mb-0 text-sm line-clamp-2">
                                {course.description}
                              </Paragraph>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <div className="w-1/2">
                              <Progress 
                                percent={0} 
                                size="small" 
                                showInfo={false} 
                                status="active"
                                strokeColor={{
                                  '0%': '#1890ff',
                                  '100%': '#52c41a',
                                }}
                              />
                              <Text className="text-gray-500 text-xs">Chưa bắt đầu</Text>
                            </div>
                            <Link href={`/learning`} className="text-blue-600 hover:text-blue-800 flex items-center">
                              Xem khóa học <ArrowRightOutlined className="ml-1" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                      <Button type="primary" size="large">
                        Đăng ký lộ trình này
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}