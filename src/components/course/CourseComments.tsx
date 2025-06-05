import { useState, useEffect } from 'react';
import { Rate, Input, Button, Avatar } from 'antd';
import { useCreateCommentMutation, useGetCommentsByCourseIdQuery, CourseComment } from '@/services/course-comment.service';
import { useGetCourseRatingByUserQuery } from '@/services/course.service';
import { skipToken } from '@reduxjs/toolkit/query';
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
  const { data: commentsData, isLoading } = useGetCommentsByCourseIdQuery({
    courseId,
    page: 1,
    size: 10
  });

  // Get user's existing rating/comment if they're logged in
  const { data: userRatingData } = useGetCourseRatingByUserQuery(
    userId ? {
      courseId,
      userId
    } : skipToken
  );

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
      const response = await addComment({
        courseId,
        userId,
        content: comment.trim(),
        rating
      }).unwrap();

      if (!response.success) {
        throw new Error(response.message);
      }

      setComment('');
      setHasRated(true);
      toast.success(response.message || 'Đã thêm đánh giá và bình luận thành công');
    } catch (error) {
      console.error('Failed to add comment and rating:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm đánh giá và bình luận');
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

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div role="status">
          <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Đang tải...</span>
        </div>
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
          disabled={hasRated || !userId}
        >
          Gửi đánh giá và bình luận
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Các đánh giá khác</h3>
        {commentsData?.data?.result?.map((comment: CourseComment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <Avatar 
                src={comment.userAvatar || undefined}
                alt={comment.userName}
              >
                {comment.userName ? comment.userName[0] : '?'}
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-medium">{comment.userName}</h4>
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

        {(!commentsData?.data?.result || commentsData.data.result.length === 0) && (
          <div className="text-center text-gray-500">
            Chưa có đánh giá nào cho khóa học này
          </div>
        )}
      </div>
    </div>
  );
}
