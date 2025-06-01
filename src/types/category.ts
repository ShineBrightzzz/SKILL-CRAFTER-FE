export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  courses?: Array<{
    id: string;
    title: string;
  }>;
}
