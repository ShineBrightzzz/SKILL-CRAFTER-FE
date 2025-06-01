export interface Payment {
  id: string;
  transactionId: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
  };
  course?: {
    id: string;
    title: string;
  };
}
