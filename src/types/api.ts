// Base API Response type
export interface APIResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// List Response type
export interface ListResponse<T> {
  data: {
    result: T[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

// Standard Success Response
export interface SuccessResponse {
  data: {
    success: boolean;
    message?: string;
  };
}
