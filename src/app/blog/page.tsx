'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Row, Col, Card, Typography, Space, Tag, Pagination, Input, Spin, Empty } from 'antd';
import { SearchOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useGetAllBlogsQuery } from '@/services/blog.service';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch blogs with RTK Query
  const { data: blogsResponse, isLoading } = useGetAllBlogsQuery({
    page: currentPage,
    pageSize: pageSize,
    sort: 'createdAt',
    order: 'desc'
  });

  const blogs = blogsResponse?.data?.result || [];
  const total = blogsResponse?.data?.meta?.total || 0;

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Space direction="vertical" size="large" className="w-full">
          {/* Header Section */}
          <div className="text-center">
            <Title level={1}>Blog</Title>
            <Paragraph className="text-lg text-gray-600">
              Khám phá các bài viết về công nghệ, lập trình và giáo dục
            </Paragraph>
          </div>

          {/* Search Section */}
          <div className="max-w-md mx-auto mb-8">
            <Search
              placeholder="Tìm kiếm bài viết..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </div>

          {/* Blog Posts Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : filteredBlogs.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredBlogs.map((blog) => (
                <Col xs={24} sm={12} lg={8} key={blog.id}>
                  <Link href={`/blog/${blog.id}`}>
                    <Card hoverable className="h-full">
                      <div className="mb-4">
                        <Tag color="blue">Công nghệ</Tag>
                      </div>
                      <Title level={4} className="mb-2 line-clamp-2">
                        {blog.title}
                      </Title>
                      <Paragraph className="text-gray-600 line-clamp-3">
                        {blog.content}
                      </Paragraph>
                      <div className="flex items-center justify-between text-gray-500 text-sm mt-4">
                        <Space>
                          <UserOutlined />
                          <span>{blog.authorName}</span>
                        </Space>
                        <Space>
                          <CalendarOutlined />
                          <span>{dayjs(blog.createdAt).format('DD/MM/YYYY')}</span>
                        </Space>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="Không tìm thấy bài viết nào"
              className="py-20"
            />
          )}

          {/* Pagination */}
          {filteredBlogs.length > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `Tổng cộng ${total} bài viết`}
              />
            </div>
          )}
        </Space>
      </div>
    </div>
  );
}
