import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface Course {
  id: string;
  title: string;
  description: string;
  price?: number;
  duration?: number;
  level: number;
  categoryName?: string;
  imageUrl?: string;
  paymentQrUrl?: string;
  tags?: string[] | null;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: string;
  [key: string]: any; // For other properties we might not know about
}

interface CourseState {
  courses: { [key: string]: Course }; // Map courseId to course
  allIds: string[]; // List of all course IDs
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: {},
  allIds: [],
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourse(state, action: PayloadAction<Course>) {
      const course = action.payload;
      state.courses[course.id] = course;
      if (!state.allIds.includes(course.id)) {
        state.allIds.push(course.id);
      }
    },
    setCourses(state, action: PayloadAction<Course[]>) {
      const courses = action.payload;
      courses.forEach(course => {
        state.courses[course.id] = course;
        if (!state.allIds.includes(course.id)) {
          state.allIds.push(course.id);
        }
      });
    },
    removeCourse(state, action: PayloadAction<string>) {
      const courseId = action.payload;
      delete state.courses[courseId];
      state.allIds = state.allIds.filter(id => id !== courseId);
    },
    clearCourses(state) {
      state.courses = {};
      state.allIds = [];
    },
    setCourseLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setCourseError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { 
  setCourse, 
  setCourses, 
  removeCourse, 
  clearCourses,
  setCourseLoading,
  setCourseError
} = courseSlice.actions;

export default courseSlice.reducer;
