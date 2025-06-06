import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface Lesson {
  id: string;
  title: string;
  type: number;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  initialCode?: string;  programmingLanguage?: string;
  chapterId: string;
  order?: number;
  quizData?: any;
  isCompleted?: boolean;
  chapterName?: string;
  [key: string]: any; // For other properties we might not know about
}

interface LessonState {
  lessons: { [key: string]: Lesson }; // Map lessonId to lesson
  byChapter: { [chapterId: string]: string[] }; // Map chapterId to list of lesson IDs
  currentLessonId: string | null;
  userCode: { [lessonId: string]: string }; // Store user code for programming exercises
  isLoading: boolean;
  error: string | null;
}

const initialState: LessonState = {
  lessons: {},
  byChapter: {},
  currentLessonId: null,
  userCode: {},
  isLoading: false,
  error: null,
};

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setLesson(state, action: PayloadAction<Lesson>) {
      const lesson = action.payload;
      state.lessons[lesson.id] = lesson;
      
      // Initialize chapter array if it doesn't exist
      if (!state.byChapter[lesson.chapterId]) {
        state.byChapter[lesson.chapterId] = [];
      }
      // Add lesson to chapter if not already present
      if (!state.byChapter[lesson.chapterId].includes(lesson.id)) {
        state.byChapter[lesson.chapterId].push(lesson.id);
      }
    },
    setLessons(state, action: PayloadAction<Lesson[]>) {
      const lessons = action.payload;
      lessons.forEach(lesson => {
        state.lessons[lesson.id] = lesson;
        if (!state.byChapter[lesson.chapterId]) {
          state.byChapter[lesson.chapterId] = [];
        }
        if (!state.byChapter[lesson.chapterId].includes(lesson.id)) {
          state.byChapter[lesson.chapterId].push(lesson.id);
        }
      });
    },
    removeLesson(state, action: PayloadAction<string>) {
      const lessonId = action.payload;
      const lesson = state.lessons[lessonId];
      if (lesson) {
        delete state.lessons[lessonId];
        state.byChapter[lesson.chapterId] = state.byChapter[lesson.chapterId].filter(id => id !== lessonId);
      }
    },
    clearLessons(state) {
      state.lessons = {};
      state.byChapter = {};
      state.currentLessonId = null;
    },
    clearChapterLessons(state, action: PayloadAction<string>) {
      const chapterId = action.payload;
      const lessonIds = state.byChapter[chapterId] || [];
      lessonIds.forEach(id => {
        delete state.lessons[id];
      });
      delete state.byChapter[chapterId];
    },
    setCurrentLesson(state, action: PayloadAction<string>) {
      state.currentLessonId = action.payload;
    },
    updateLessonCompletion(state, action: PayloadAction<{ lessonId: string; isCompleted: boolean }>) {
      const { lessonId, isCompleted } = action.payload;
      if (state.lessons[lessonId]) {
        state.lessons[lessonId].isCompleted = isCompleted;
      }
    },
    saveUserCode(state, action: PayloadAction<{ lessonId: string; code: string }>) {
      const { lessonId, code } = action.payload;
      state.userCode[lessonId] = code;
    },
    setLessonLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setLessonError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { 
  setLesson, 
  setLessons, 
  removeLesson, 
  clearLessons,
  clearChapterLessons,
  setCurrentLesson,
  updateLessonCompletion,
  saveUserCode,
  setLessonLoading,
  setLessonError
} = lessonSlice.actions;

export default lessonSlice.reducer;
