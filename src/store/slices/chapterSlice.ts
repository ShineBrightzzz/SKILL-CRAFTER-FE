import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface Chapter {
  id: string;
  name: string;
  description?: string;
  courseId: string;
  order?: number;
  [key: string]: any; // For other properties we might not know about
}

interface ChapterState {
  chapters: { [key: string]: Chapter }; // Map chapterId to chapter
  byCourse: { [courseId: string]: string[] }; // Map courseId to list of chapter IDs
  isLoading: boolean;
  error: string | null;
}

const initialState: ChapterState = {
  chapters: {},
  byCourse: {},
  isLoading: false,
  error: null,
};

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setChapter(state, action: PayloadAction<Chapter>) {
      const chapter = action.payload;
      state.chapters[chapter.id] = chapter;
      
      // Initialize course array if it doesn't exist
      if (!state.byCourse[chapter.courseId]) {
        state.byCourse[chapter.courseId] = [];
      }
      
      // Add chapterId to course's chapter list if not already there
      if (!state.byCourse[chapter.courseId].includes(chapter.id)) {
        state.byCourse[chapter.courseId].push(chapter.id);
      }
    },
    setChapters(state, action: PayloadAction<Chapter[]>) {
      const chapters = action.payload;
      
      chapters.forEach(chapter => {
        state.chapters[chapter.id] = chapter;
        
        // Initialize course array if it doesn't exist
        if (!state.byCourse[chapter.courseId]) {
          state.byCourse[chapter.courseId] = [];
        }
        
        // Add chapterId to course's chapter list if not already there
        if (!state.byCourse[chapter.courseId].includes(chapter.id)) {
          state.byCourse[chapter.courseId].push(chapter.id);
        }
      });
      
      // Sort chapters by order for each course
      Object.keys(state.byCourse).forEach(courseId => {
        state.byCourse[courseId].sort((a, b) => {
          const orderA = state.chapters[a].order ?? 0;
          const orderB = state.chapters[b].order ?? 0;
          return orderA - orderB;
        });
      });
    },
    removeChapter(state, action: PayloadAction<string>) {
      const chapterId = action.payload;
      const chapter = state.chapters[chapterId];
      
      if (chapter) {
        const courseId = chapter.courseId;
        
        // Remove chapter from chapters object
        delete state.chapters[chapterId];
        
        // Remove chapter from course's chapter list
        if (state.byCourse[courseId]) {
          state.byCourse[courseId] = state.byCourse[courseId].filter(id => id !== chapterId);
          
          // Remove course entry if no chapters left
          if (state.byCourse[courseId].length === 0) {
            delete state.byCourse[courseId];
          }
        }
      }
    },
    clearChapters(state) {
      state.chapters = {};
      state.byCourse = {};
    },
    clearCourseChapters(state, action: PayloadAction<string>) {
      const courseId = action.payload;
      
      // Get all chapter IDs for this course
      const chapterIds = state.byCourse[courseId] || [];
      
      // Remove all chapters for this course
      chapterIds.forEach(chapterId => {
        delete state.chapters[chapterId];
      });
      
      // Remove course entry
      delete state.byCourse[courseId];
    },
    setChapterLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setChapterError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  },
});

export const { 
  setChapter, 
  setChapters, 
  removeChapter, 
  clearChapters,
  clearCourseChapters,
  setChapterLoading,
  setChapterError
} = chapterSlice.actions;

export default chapterSlice.reducer;
