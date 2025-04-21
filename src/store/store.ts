'use client'

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import apiSlice from '@/services/api';
import roleReducer from './slices/roleSlice'
import permissionReducer from './slices/permissionSlice'
import accountReducer from './slices/accountSlice'
import abilityReducer from './slices/abilitySlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    role: roleReducer,
    permission: permissionReducer,
    account : accountReducer,
    ability: abilityReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;