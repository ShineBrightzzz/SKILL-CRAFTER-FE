import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  progress?: number;
  [key: string]: any; // For other properties we might not know about
}

interface EnrollmentState {
  enrollments: { [key: string]: Enrollment }; // Map enrollmentId to enrollment
  userEnrollmentIds: string[]; // List of courseIds the user is enrolled in
  userEnrollmentsLoaded: boolean;
}

const initialState: EnrollmentState = {
  enrollments: {},
  userEnrollmentIds: [],
  userEnrollmentsLoaded: false,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    addEnrollment(state, action: PayloadAction<Enrollment | Enrollment[]>) {
      const enrollments = Array.isArray(action.payload) 
        ? action.payload 
        : [action.payload];
      
      enrollments.forEach(enrollment => {
        state.enrollments[enrollment.id] = enrollment;
        
        // Add courseId to userEnrollmentIds if not already there
        if (!state.userEnrollmentIds.includes(enrollment.courseId)) {
          state.userEnrollmentIds.push(enrollment.courseId);
        }
      });
      
      state.userEnrollmentsLoaded = true;
    },
    removeEnrollment(state, action: PayloadAction<string>) {
      const enrollmentId = action.payload;
      const enrollment = state.enrollments[enrollmentId];
      
      if (enrollment) {
        // Remove enrollment from enrollments object
        delete state.enrollments[enrollmentId];
        
        // Remove courseId from userEnrollmentIds
        state.userEnrollmentIds = state.userEnrollmentIds.filter(
          id => id !== enrollment.courseId
        );
      }
    },
    clearEnrollments(state) {
      state.enrollments = {};
      state.userEnrollmentIds = [];
      state.userEnrollmentsLoaded = false;
    },
  },
});

export const { 
  addEnrollment, 
  removeEnrollment, 
  clearEnrollments
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
