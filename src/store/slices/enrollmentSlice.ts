import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  completionDate?: string;
  progress?: number;
  // Add any other enrollment fields
}

interface EnrollmentState {
  enrollments: { [courseId: string]: Enrollment }; // Map by courseId for quick lookup
  userEnrollmentsLoaded: boolean;
  userEnrollmentIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  enrollments: {},
  userEnrollmentsLoaded: false,
  userEnrollmentIds: [],
  loading: false,
  error: null
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setUserEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      // Store all enrollments and track the course IDs
      const courseIds: string[] = [];
      
      action.payload.forEach(enrollment => {
        state.enrollments[enrollment.courseId] = enrollment;
        courseIds.push(enrollment.courseId);
      });
      
      state.userEnrollmentIds = courseIds;
      state.userEnrollmentsLoaded = true;
    },    addEnrollment: (state, action: PayloadAction<Enrollment | Enrollment[]>) => {
      const enrollments = Array.isArray(action.payload) ? action.payload : [action.payload];
      
      enrollments.forEach(enrollment => {
        state.enrollments[enrollment.courseId] = enrollment;
        
        // Add to userEnrollmentIds if not already there
        if (!state.userEnrollmentIds.includes(enrollment.courseId)) {
          state.userEnrollmentIds.push(enrollment.courseId);
        }
      });
      
      // Mark as loaded if we received data
      if (enrollments.length > 0) {
        state.userEnrollmentsLoaded = true;
      }
    },
    removeEnrollment: (state, action: PayloadAction<string>) => {
      const courseId = action.payload;
      delete state.enrollments[courseId];
      
      // Remove from userEnrollmentIds
      state.userEnrollmentIds = state.userEnrollmentIds.filter(id => id !== courseId);
    },
    updateEnrollmentProgress: (
      state, 
      action: PayloadAction<{ courseId: string; progress: number }>
    ) => {
      const { courseId, progress } = action.payload;
      if (state.enrollments[courseId]) {
        state.enrollments[courseId].progress = progress;
      }
    },
    setEnrollmentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEnrollmentError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUserEnrollments: (state) => {
      state.enrollments = {};
      state.userEnrollmentIds = [];
      state.userEnrollmentsLoaded = false;
    }
  }
});

export const {
  setUserEnrollments,
  addEnrollment,
  removeEnrollment,
  updateEnrollmentProgress,
  setEnrollmentLoading,
  setEnrollmentError,
  clearUserEnrollments
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
