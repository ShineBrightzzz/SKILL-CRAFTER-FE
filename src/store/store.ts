'use client'

import { configureStore } from '@reduxjs/toolkit';
import apiSlice from '@/services/api';
import courseReducer from './slices/courseSlice';
import chapterReducer from './slices/chapterSlice';
import lessonReducer from './slices/lessonSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import authReducer from './slices/authSlice';
import abilityReducer from './slices/abilitySlice';
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    courses: courseReducer,
    chapters: chapterReducer,
    lessons: lessonReducer,
    enrollments: enrollmentReducer,
    auth: authReducer,
    ability: abilityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      apiSlice.middleware,
    ]),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;