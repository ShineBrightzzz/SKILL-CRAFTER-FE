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
  roleId?: number;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    email_verified: boolean;
    familyName: string;
    givenName: string;
    accessToken: string;
    refreshToken: string;
    pictureUrl?: string;
    isAdmin?: boolean;
    roleId?: number;
  };
  timestamp: string;
}
