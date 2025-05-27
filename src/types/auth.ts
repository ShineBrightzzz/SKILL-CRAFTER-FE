export interface User {
  id: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}
