'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Space, Avatar, Button, Form, Input, Divider, Spin, message } from 'antd';
import { UserOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import CommentReplyForm from '@/components/blog/CommentReplyForm';
import { useGetBlogByIdQuery } from '@/services/blog.service';
import { 
  useGetCommentsByBlogIdQuery, 
  useCreateCommentMutation, 
  useUpdateCommentMutation, 
  useDeleteCommentMutation,
  BlogComment 
} from '@/services/blog-comment.service';
import { useAuth } from '@/store/hooks';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface PageProps {
  params: {
    id: string;
  };
}

const BlogDetailPage: React.FC<PageProps> = ({ params }) => {
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
  });  // Get root comments and sort them
  const comments = React.useMemo(() => {
    const rootComments = commentsResponse?.data?.result || [];
    
    // Create a deep copy of comments with sorted replies
    const sortedComments = rootComments.map(comment => ({
      ...comment,
      replies: comment.replies 
        ? [...comment.replies].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : []
    }));
    
    // Sort root comments by createdAt in descending order (newest first)
    return sortedComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [commentsResponse?.data?.result]);

  // Comment mutations
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  // Handle comment submission  // Handle main comment submission
  const handleMainCommentSubmit = async (values: { content: string }) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    try {
      if (editingCommentId) {
        await updateComment({
          id: editingCommentId,
          body: { content: values.content }
        }).unwrap();
        message.success('Cập nhật bình luận thành công');
        setEditingCommentId(null);
      } else {
        await createComment({
          content: values.content,
          blogId: params.id,
          userId: user.id,
          parentId: null // Always null for main comments
        }).unwrap();
        message.success('Thêm bình luận thành công');
      }
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (values: { content: string }) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    try {
      await createComment({
        content: values.content,
        blogId: params.id,
        userId: user.id,
        parentId: replyToCommentId
      }).unwrap();

      message.success('Trả lời bình luận thành công');
      setReplyToCommentId(null);
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId).unwrap();
      message.success('Xóa bình luận thành công');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa bình luận');
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          {/* Blog Header */}
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

          {/* Blog Content */}
          <Paragraph className="text-lg whitespace-pre-wrap">
            {blog.content}
          </Paragraph>
        </Card>

        {/* Comments Section */}
        <Card>
          <Title level={3} className="mb-6">Bình luận</Title>          {/* Main Comment Form */}
          <Form
            form={form}
            onFinish={handleMainCommentSubmit}
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
              <Button type="primary" htmlType="submit" disabled={!user}>
                {editingCommentId ? 'Cập nhật' : 'Gửi bình luận'}
              </Button>
              {editingCommentId && (
                <Button 
                  className="ml-2" 
                  onClick={() => {
                    setEditingCommentId(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
              )}
            </Form.Item>
          </Form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <Spin />
            </div>
          ) : comments.length > 0 ? (
            <Space direction="vertical" className="w-full" size="large">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-4">
                  <div className="flex space-x-4">
                    <Avatar 
                      src={comment.userPictureUrl} 
                      icon={!comment.userPictureUrl && <UserOutlined />} 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">                      <div>
                          <Text strong>{comment.username}</Text>
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
                        </Space>
                      </div>                      <Paragraph>{comment.content}</Paragraph>
                      {user && !editingCommentId && (
                        <Button
                          type="text"
                          icon={<CommentOutlined style={{ fontSize: '18px' }} />}
                          className="px-4 py-2 text-base"
                          onClick={() => {
                            setReplyToCommentId(comment.id);
                            setEditingCommentId(null);
                            form.resetFields();
                          }}
                        >
                          Trả lời
                        </Button>
                      )}
                      {/* Hiển thị form trả lời ngay dưới comment */}
                      {replyToCommentId === comment.id && (
                        <CommentReplyForm
                          onSubmit={handleReplySubmit}
                          onCancel={() => setReplyToCommentId(null)}
                        />
                      )}

                      {/* Hiển thị các replies */}                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-4">
                          <div className="space-y-4">
                            {comment.replies.map((reply: BlogComment) => (
                              <div key={reply.id}>
                                <div className="flex space-x-4">
                                  <Avatar 
                                    src={reply.userPictureUrl} 
                                    icon={!reply.userPictureUrl && <UserOutlined />}
                                    size="small" 
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <Text strong>{reply.username}</Text>
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
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có bình luận nào
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BlogDetailPage;
