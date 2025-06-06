import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface User {  
  id: string;
  username: string;
  email?: string;
  familyName?: string;
  givenName?: string;
  email_verified?: boolean;
  pictureUrl?: string;
  isAdmin?: boolean;
  roleId?: number | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  },
});

export const { 
  setUser, 
  setToken, 
  logout, 
  setAuthLoading,
  setAuthError
} = authSlice.actions;

export default authSlice.reducer;
