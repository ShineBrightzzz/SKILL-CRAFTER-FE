export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  familyName: string;
  givenName: string;
  pictureUrl?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;  data: {
    id: string;
    username: string;
    email: string;
    email_verified: boolean;
    familyName: string;
    givenName: string;
    accessToken: string;
    refreshToken: string;
    pictureUrl?: string;
    role?: {
      id: number | string;
      name: string;
      permissions?: string[];
    } | null;
  };
  timestamp: string;
}
