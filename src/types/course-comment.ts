export interface CourseComment {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseCommentResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: CourseComment[];
  };
  timestamp: string;
}

export interface CourseRating {
  courseId: string;
  userId: string;
  rating: number;
  createdAt: string;
}

export interface CourseRatingResponse {
  data: {
    success: boolean;
    result: CourseRating[];
    message?: string;
  };
}
