import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lesson } from './courseSlice';

interface LessonState {
  currentLesson: Lesson | null;
  lessonsByChapterId: { [chapterId: string]: Lesson[] };
  lessonProgress: { [lessonId: string]: number };  // 0-100 percentage progress
  userCode: { [lessonId: string]: string }; // Cache user code for code exercises
  loading: boolean;
  error: string | null;
}

const initialState: LessonState = {
  currentLesson: null,
  lessonsByChapterId: {},
  lessonProgress: {},
  userCode: {},
  loading: false,
  error: null
};

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<Lesson>) => {
      state.currentLesson = action.payload;
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    setChapterLessons: (state, action: PayloadAction<{chapterId: string, lessons: Lesson[]}>) => {
      const { chapterId, lessons } = action.payload;
      state.lessonsByChapterId[chapterId] = lessons;
    },
    setLessonProgress: (state, action: PayloadAction<{lessonId: string, progress: number}>) => {
      const { lessonId, progress } = action.payload;
      state.lessonProgress[lessonId] = progress;
    },
    saveUserCode: (state, action: PayloadAction<{lessonId: string, code: string}>) => {
      const { lessonId, code } = action.payload;
      state.userCode[lessonId] = code;
    },
    setLessonLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLessonError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setCurrentLesson,
  clearCurrentLesson,
  setChapterLessons,
  setLessonProgress,
  saveUserCode,
  setLessonLoading,
  setLessonError
} = lessonSlice.actions;

export default lessonSlice.reducer;
