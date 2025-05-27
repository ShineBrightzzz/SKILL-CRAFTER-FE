import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface Lesson {
  id: string;
  title: string;
  type: number;
  content?: string;
  videoUrl?: string;
  initialCode?: string;
  language?: string;
  chapterId: string;
  order?: number;
  quizData?: any;
  isCompleted?: boolean;
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
      
      // Add lessonId to chapter's lesson list if not already there
      if (!state.byChapter[lesson.chapterId].includes(lesson.id)) {
        state.byChapter[lesson.chapterId].push(lesson.id);
      }
    },
    setLessons(state, action: PayloadAction<Lesson[]>) {
      const lessons = action.payload;
      
      lessons.forEach(lesson => {
        state.lessons[lesson.id] = lesson;
        
        // Initialize chapter array if it doesn't exist
        if (!state.byChapter[lesson.chapterId]) {
          state.byChapter[lesson.chapterId] = [];
        }
        
        // Add lessonId to chapter's lesson list if not already there
        if (!state.byChapter[lesson.chapterId].includes(lesson.id)) {
          state.byChapter[lesson.chapterId].push(lesson.id);
        }
      });
      
      // Sort lessons by order for each chapter
      Object.keys(state.byChapter).forEach(chapterId => {
        state.byChapter[chapterId].sort((a, b) => {
          const orderA = state.lessons[a].order ?? 0;
          const orderB = state.lessons[b].order ?? 0;
          return orderA - orderB;
        });
      });
    },
    removeLesson(state, action: PayloadAction<string>) {
      const lessonId = action.payload;
      const lesson = state.lessons[lessonId];
      
      if (lesson) {
        const chapterId = lesson.chapterId;
        
        // Remove lesson from lessons object
        delete state.lessons[lessonId];
        
        // Remove lesson from chapter's lesson list
        if (state.byChapter[chapterId]) {
          state.byChapter[chapterId] = state.byChapter[chapterId].filter(id => id !== lessonId);
          
          // Remove chapter entry if no lessons left
          if (state.byChapter[chapterId].length === 0) {
            delete state.byChapter[chapterId];
          }
        }
        
        // Remove user code if exists
        if (state.userCode[lessonId]) {
          delete state.userCode[lessonId];
        }
        
        // Reset current lesson if it was this one
        if (state.currentLessonId === lessonId) {
          state.currentLessonId = null;
        }
      }
    },
    clearLessons(state) {
      state.lessons = {};
      state.byChapter = {};
      state.currentLessonId = null;
      // Don't clear user code to preserve it across sessions
    },
    clearChapterLessons(state, action: PayloadAction<string>) {
      const chapterId = action.payload;
      
      // Get all lesson IDs for this chapter
      const lessonIds = state.byChapter[chapterId] || [];
      
      // Remove all lessons for this chapter
      lessonIds.forEach(lessonId => {
        delete state.lessons[lessonId];
        
        // Reset current lesson if it was one of these
        if (state.currentLessonId === lessonId) {
          state.currentLessonId = null;
        }
      });
      
      // Remove chapter entry
      delete state.byChapter[chapterId];
    },
    setCurrentLesson(state, action: PayloadAction<string | null>) {
      state.currentLessonId = action.payload;
    },
    updateLessonCompletion(state, action: PayloadAction<{ lessonId: string, isCompleted: boolean }>) {
      const { lessonId, isCompleted } = action.payload;
      
      if (state.lessons[lessonId]) {
        state.lessons[lessonId].isCompleted = isCompleted;
      }
    },
    saveUserCode(state, action: PayloadAction<{ lessonId: string, code: string }>) {
      const { lessonId, code } = action.payload;
      state.userCode[lessonId] = code;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
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
  setLoading,
  setError
} = lessonSlice.actions;

export default lessonSlice.reducer;
