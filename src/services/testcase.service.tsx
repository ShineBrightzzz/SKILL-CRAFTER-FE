import apiSlice from './api';

// Define types based on the TestCaseController from backend
interface TestCaseDTO {
  id?: string;  // UUID
  lessonId: string;  // UUID
  input: string;
  expectedOutput: string;
  isSample: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define API endpoints
export const testCaseApiSlice = apiSlice.enhanceEndpoints({
  addTagTypes: ['TestCases']
}).injectEndpoints({
  endpoints: (builder) => ({
    // Create a test case
    createTestCase: builder.mutation<TestCaseDTO, TestCaseDTO>({
      query: (body) => ({
        url: '/api/test-cases',
        method: 'POST',
        body,
      }),
      // Invalidate the test cases list after create
      invalidatesTags: (result, error, arg) => [
        { type: 'TestCases', id: arg.lessonId }
      ],
    }),

    // Get test cases by lesson ID
    getTestCasesByLessonId: builder.query<TestCaseDTO[], string>({
      query: (lessonId) => `/api/test-cases/lesson/${lessonId}`,
      // Tag for cache invalidation
      providesTags: (result, error, id) => [{ type: 'TestCases', id }],
    }),

    // Get sample test cases by lesson ID
    getSampleTestCases: builder.query<TestCaseDTO[], string>({
      query: (lessonId) => `/api/test-cases/lesson/${lessonId}/samples`,
      // Tag for cache invalidation
      providesTags: (result, error, id) => [{ type: 'TestCases', id }],
    }),    // Update a test case
    updateTestCase: builder.mutation<TestCaseDTO, TestCaseDTO>({
      query: (testCase) => ({
        url: `/api/test-cases/${testCase.id}`,
        method: 'PUT',
        body: testCase,
      }),
      // Invalidate the test cases list after update
      invalidatesTags: (result, error, arg) => [
        { type: 'TestCases', id: arg.lessonId }
      ],
    }),

    // Delete a test case
    deleteTestCase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/test-cases/${id}`,
        method: 'DELETE',
      }),
      // Invalidate the test cases list after delete
      invalidatesTags: (result, error, arg) => [
        { type: 'TestCases', id: 'LIST' }
      ],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useCreateTestCaseMutation,
  useGetTestCasesByLessonIdQuery,
  useGetSampleTestCasesQuery,
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation,
} = testCaseApiSlice;
