export interface CourseComment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  avatar_url?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseCommentResponse {
  data: {
    success: boolean;
    result: CourseComment[];
    message?: string;
  };
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
