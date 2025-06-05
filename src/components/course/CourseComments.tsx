import { useState, useEffect } from 'react';
import { Rate, Input, Button, Space, Avatar, Spin } from 'antd';
import { useCreateCommentMutation, useGetCommentsByCourseIdQuery, CourseComment } from '@/services/course-comment.service';
import { useGetCourseRatingByUserQuery } from '@/services/course.service';
import { toast } from 'react-toastify';

const { TextArea } = Input;

interface CourseCommentsProps {
  courseId: string;
  userId: string;
}

export default function CourseComments({ courseId, userId }: CourseCommentsProps) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  // Fetch existing comments
  const { data: commentsData, isLoading: isLoadingComments } = useGetCommentsByCourseIdQuery({
    courseId,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  
  // Get user's existing rating/comment
  const { data: userRatingData } = useGetCourseRatingByUserQuery({
    courseId,
    userId
  });

  // Mutations
  const [addComment] = useCreateCommentMutation();

  // Check if user has already rated
  useEffect(() => {
    const existingRating = userRatingData?.data?.rating;
    if (existingRating) {
      setRating(existingRating);
      setHasRated(true);
    }
  }, [userRatingData]);

  const handleCommentSubmit = async () => {
    if (!rating) {
      toast.error('Vui lòng đánh giá khóa học');
      return;
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    if (hasRated) {
      toast.error('Bạn đã đánh giá khóa học này');
      return;
    }

    try {
      await addComment({
        courseId,
        userId,
        content: comment.trim(),
        rating
      }).unwrap();

      setComment('');
      setHasRated(true);
      toast.success('Đã thêm đánh giá và bình luận thành công');
    } catch (error) {
      console.error('Failed to add comment and rating:', error);
      toast.error('Có lỗi xảy ra khi thêm đánh giá và bình luận');
    }
  };

  const handleRatingChange = (value: number) => {
    if (hasRated) {
      toast.info('Bạn đã đánh giá khóa học này');
      return;
    }
    setRating(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingComments) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment input section with rating */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Đánh giá và bình luận</h3>
        <div className="mb-4">
          <p className="mb-2">Đánh giá của bạn:</p>
          <Rate
            value={rating}
            onChange={handleRatingChange}
            disabled={hasRated}
          />
          {hasRated && (
            <p className="text-sm text-gray-500 mt-1">
              Bạn đã đánh giá khóa học này {rating} sao
            </p>
          )}
        </div>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập bình luận của bạn..."
          autoSize={{ minRows: 3, maxRows: 5 }}
          disabled={hasRated}
        />
        <Button 
          type="primary" 
          onClick={handleCommentSubmit}
          disabled={hasRated}
        >
          Gửi đánh giá và bình luận
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Các đánh giá khác</h3>
        {commentsData?.data?.result?.map((comment: CourseComment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">              <Avatar 
                src={comment.userPictureUrl || undefined}
                alt={comment.username}
              >
                {comment.username ? comment.username[0] : '?'}
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-medium">{comment.username}</h4>
                    <Rate value={comment.rating} disabled className="text-sm" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
