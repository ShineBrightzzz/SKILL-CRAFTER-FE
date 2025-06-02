'use client';

import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

const BlogPage = () => {
  // This would typically come from an API
  const blogPosts = [
    {
      id: 1,
      title: 'Getting Started with Web Development',
      summary: 'Learn the fundamentals of web development, including HTML, CSS, and JavaScript.',
      date: '2025-06-02',
      imageUrl: '/blog/web-dev.jpg',
      category: 'Web Development'
    },
    {
      id: 2,
      title: 'Python Programming Tips',
      summary: 'Essential tips and tricks for Python developers to improve their coding skills.',
      date: '2025-06-01',
      imageUrl: '/blog/python.jpg',
      category: 'Programming'
    },
    {
      id: 3,
      title: 'Machine Learning Basics',
      summary: 'An introduction to machine learning concepts and applications.',
      date: '2025-05-31',
      imageUrl: '/blog/ml.jpg',
      category: 'AI & ML'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center">
            <Title level={1}>Blog</Title>
            <Paragraph className="text-lg text-gray-600">
              Discover the latest in technology, programming, and education
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {blogPosts.map((post) => (
              <Col xs={24} sm={12} lg={8} key={post.id}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Image Placeholder</span>
                    </div>
                  }
                >
                  <Card.Meta
                    title={post.title}
                    description={
                      <div>
                        <div className="mb-2">
                          <span className="text-blue-600">{post.category}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">{post.date}</span>
                        </div>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {post.summary}
                        </Paragraph>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default BlogPage;
