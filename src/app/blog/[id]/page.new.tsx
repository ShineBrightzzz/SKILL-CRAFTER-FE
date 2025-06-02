'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Space, Avatar, Button, Form, Input, Divider, Spin, message } from 'antd';
import { UserOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetBlogByIdQuery } from '@/services/blog.service';
import { useGetCommentsByBlogIdQuery, useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from '@/services/blog-comment.service';
import type { BlogComment } from '@/services/blog-comment.service';
import { useAuth } from '@/store/hooks';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface PageProps {
  params: {
    id: string;
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  // Fetch blog details
  const { data: blogResponse, isLoading: blogLoading } = useGetBlogByIdQuery(params.id);
  const blog = blogResponse?.data;

  // Fetch comments
  const { data: commentsResponse, isLoading: commentsLoading } = useGetCommentsByBlogIdQuery({
    blogId: params.id,
    page: 1,
    pageSize: 100,
    sort: 'createdAt',
    order: 'desc'
  });

  // Organize comments into tree structure
  const comments = React.useMemo(() => {
    const allComments = commentsResponse?.data?.result || [];
    const commentMap = new Map();
    const rootComments: BlogComment[] = [];

    // First, create a map of all comments
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Then, organize them into a tree
    allComments.forEach(comment => {
      if (comment.parentId) {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  }, [commentsResponse?.data?.result]);

  // Comment mutations
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleCommentSubmit = (values: { content: string }) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (editingCommentId) {
      updateComment({
        id: editingCommentId,
        body: { content: values.content }
      })
        .unwrap()
        .then(() => {
          message.success('Cập nhật bình luận thành công');
          setEditingCommentId(null);
          form.resetFields();
        })
        .catch(() => {
          message.error('Có lỗi xảy ra');
        });
    } else {
      createComment({
        content: values.content,
        blogId: params.id,
        userId: user.id,
        parentId: replyToCommentId
      })
        .unwrap()
        .then(() => {
          message.success(replyToCommentId ? 'Trả lời bình luận thành công' : 'Thêm bình luận thành công');
          setReplyToCommentId(null);
          form.resetFields();
        })
        .catch(() => {
          message.error('Có lỗi xảy ra');
        });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId)
      .unwrap()
      .then(() => {
        message.success('Xóa bình luận thành công');
      })
      .catch(() => {
        message.error('Có lỗi xảy ra khi xóa bình luận');
      });
  };

  const renderCommentForm = () => (
    <Form
      form={form}
      onFinish={handleCommentSubmit}
      className="mb-8"
    >
      <Form.Item
        name="content"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung bình luận' }]}
      >
        <TextArea
          rows={4}
          placeholder={user ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận'}
          disabled={!user}
        />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" disabled={!user}>
            {editingCommentId ? 'Cập nhật' : replyToCommentId ? 'Gửi trả lời' : 'Gửi bình luận'}
          </Button>
          {(editingCommentId || replyToCommentId) && (
            <Button
              onClick={() => {
                setEditingCommentId(null);
                setReplyToCommentId(null);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );

  const renderReply = (reply: BlogComment) => (
    <div key={reply.id} className="flex space-x-4">
      <Avatar icon={<UserOutlined />} size="small" />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Text strong>{reply.authorName}</Text>
            <Text className="text-gray-500 ml-2">
              {dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
          {user && (user.id === reply.userId) && (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingCommentId(reply.id);
                  form.setFieldsValue({ content: reply.content });
                }}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => handleDeleteComment(reply.id)}
              />
            </Space>
          )}
        </div>
        <Paragraph>{reply.content}</Paragraph>
      </div>
    </div>
  );

  const renderComment = (comment: BlogComment) => (
    <div key={comment.id} className="mb-4">
      <div className="flex space-x-4">
        <Avatar icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <Text strong>{comment.authorName}</Text>
              <Text className="text-gray-500 ml-2">
                {dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
            <Space>
              {user && (user.id === comment.userId) && (
                <>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      form.setFieldsValue({ content: comment.content });
                      setReplyToCommentId(null);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteComment(comment.id)}
                  />
                </>
              )}
              {user && !editingCommentId && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setReplyToCommentId(comment.id);
                    setEditingCommentId(null);
                    form.resetFields();
                  }}
                >
                  Trả lời
                </Button>
              )}
            </Space>
          </div>
          <Paragraph>{comment.content}</Paragraph>
          
          {replyToCommentId === comment.id && (
            <div className="ml-8 mt-2">
              <Form
                form={form}
                onFinish={handleCommentSubmit}
              >
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Viết trả lời của bạn..."
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Gửi trả lời
                    </Button>
                    <Button onClick={() => setReplyToCommentId(null)}>
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-4">
              <Space direction="vertical" className="w-full" size="large">
                {comment.replies.map(renderReply)}
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderComments = () => {
    if (commentsLoading) {
      return (
        <div className="text-center py-8">
          <Spin />
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Chưa có bình luận nào
        </div>
      );
    }

    return (
      <Space direction="vertical" className="w-full" size="large">
        {comments.map(renderComment)}
      </Space>
    );
  };

  const renderContent = () => {
    if (blogLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      );
    }

    if (!blog) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Title level={3}>Không tìm thấy bài viết</Title>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <div className="mb-6">
            <Title>{blog.title}</Title>
            <Space className="text-gray-500">
              <Space>
                <UserOutlined />
                <span>{blog.authorName}</span>
              </Space>
              <Space>
                <CalendarOutlined />
                <span>{dayjs(blog.createdAt).format('DD/MM/YYYY HH:mm')}</span>
              </Space>
            </Space>
          </div>
          <Paragraph className="text-lg whitespace-pre-wrap">
            {blog.content}
          </Paragraph>
        </Card>

        <Card>
          <Title level={3} className="mb-6">Bình luận</Title>
          {renderCommentForm()}
          {renderComments()}
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {renderContent()}
    </div>
  );
}
