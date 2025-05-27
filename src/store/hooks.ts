import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Base Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export hooks from separate files
export * from './hooks/authHooks';
export * from './hooks/courseHooks';
export * from './hooks/chapterHooks';
export * from './hooks/lessonHooks';