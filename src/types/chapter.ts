export interface Chapter {
  id: string;
  courseId?: string;
  name?: string;
  description?: string;
  title?: string;
  courseName?: string;
  order?: number;
  estimatedTime?: number;
}

export interface ChapterResponse {
  data: {
    result: Chapter[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export interface ChapterFormValues {
  name: string;
  courseId: string;
  order?: number;
  estimatedTime?: number;
}
