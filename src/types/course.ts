export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: number;
  imageUrl: string;
  videoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  instructorId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  instructor?: {
    id: string;
    username: string;
  };
  enrollments?: Array<{
    id: string;
    userId: string;
    status: string;
  }>;
}
