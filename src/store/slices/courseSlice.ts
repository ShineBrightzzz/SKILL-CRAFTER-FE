import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types based on your existing interfaces
export interface Lesson {
  id: string;
  chapterId: string;
  chapterName: string;
  title: string;
  type: number;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  initialCode?: string;
  language?: string;
  quizData?: any;
}

export interface Chapter {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  estimatedTime: number;
  lessons: Lesson[] | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  imageUrl?: string;
  duration: number;
  level: number;
  tags: string[] | null;
  chapters?: Chapter[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
}

interface CourseState {
  courses: { [id: string]: Course }; // Map courses by ID for quick lookup
  allCoursesLoaded: boolean;
  loading: boolean;
  error: string | null;
  categoryCoursesMap: { [categoryId: string]: string[] }; // Map category IDs to course IDs
  instructorCoursesMap: { [instructorId: string]: string[] }; // Map instructor IDs to course IDs
}

const initialState: CourseState = {
  courses: {},
  allCoursesLoaded: false,
  loading: false,
  error: null,
  categoryCoursesMap: {},
  instructorCoursesMap: {}
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourse: (state, action: PayloadAction<Course>) => {
      state.courses[action.payload.id] = action.payload;
    },
    setAllCourses: (state, action: PayloadAction<Course[]>) => {
      action.payload.forEach(course => {
        state.courses[course.id] = course;
      });
      state.allCoursesLoaded = true;
    },
    setCategoryCoursesMap: (
      state, 
      action: PayloadAction<{ categoryId: string; courseIds: string[] }>
    ) => {
      const { categoryId, courseIds } = action.payload;
      state.categoryCoursesMap[categoryId] = courseIds;
    },
    setInstructorCoursesMap: (
      state, 
      action: PayloadAction<{ instructorId: string; courseIds: string[] }>
    ) => {
      const { instructorId, courseIds } = action.payload;
      state.instructorCoursesMap[instructorId] = courseIds;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Update course after enrollment changes
    updateCourse: (state, action: PayloadAction<{ id: string; updates: Partial<Course> }>) => {
      const { id, updates } = action.payload;
      if (state.courses[id]) {
        state.courses[id] = { ...state.courses[id], ...updates };
      }
    }
  }
});

export const {
  setCourse,
  setAllCourses,
  setCategoryCoursesMap,
  setInstructorCoursesMap,
  setLoading,
  setError,
  updateCourse
} = courseSlice.actions;

export default courseSlice.reducer;
