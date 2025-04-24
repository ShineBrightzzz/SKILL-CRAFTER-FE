import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Permission {
  id: number;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

interface UserState {
  studentId: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  permissions: Permission[];
}

const initialState: UserState = {
  studentId: 'ST001',
  name: 'Nguyễn Văn A',
  email: null,
  avatar: null,
  isAuthenticated: true,
  token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTVDAwMSIsImNoaW5oLmxoNTQiOnsicHJpbmNpcGFsIjp7InBhc3N3b3JkIjpudWxsLCJ1c2VybmFtZSI6IlNUMDAxIiwiYXV0aG9yaXRpZXMiOlt7InJvbGUiOiJST0xFX01PREVSQVRPUiJ9XSwiYWNjb3VudE5vbkV4cGlyZWQiOnRydWUsImFjY291bnROb25Mb2NrZWQiOnRydWUsImNyZWRlbnRpYWxzTm9uRXhwaXJlZCI6dHJ1ZSwiZW5hYmxlZCI6dHJ1ZX0sImNyZWRlbnRpYWxzIjpudWxsLCJhdXRob3JpdGllcyI6W3sicm9sZSI6IlJPTEVfTU9ERVJBVE9SIn1dLCJkZXRhaWxzIjpudWxsLCJhdXRoZW50aWNhdGVkIjp0cnVlfSwiZXhwIjoxMDM4NDkxMzY5MSwiaWF0IjoxNzQ0OTEzNjkxfQ.vNiAaN7g5x9NiuLKQP3zYTXzCUo5pi6Vv5jjG-QXRY01_cNgd_-pHqJilyFpuceLJ0hAuaccFFp3QJgdavU5HA',
  isLoading: false,
  permissions: [{id : 1, name: 'View Roles', apiPath: '/roles', method: 'GET', module: 'Role Management' },],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload, isLoading: false };
    },
    clearUser: (state) => {
      return { ...initialState, isLoading: false };
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
    logout: (state) => {
      return { ...initialState, isAuthenticated: false, token: null };
    },
  },
});

export const { setUser, clearUser, updateUserProfile, setPermissions,logout } = userSlice.actions;
export default userSlice.reducer;