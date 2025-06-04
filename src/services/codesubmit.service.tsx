import apiSlice from './api';

// Language ID mapping theo Judge0
export const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  typescript: 74,  // TypeScript
  python: 71,      // Python 3
  java: 62,        // Java
  cpp: 54,         // C++
  csharp: 51,      // C#
  go: 60,          // Go
  rust: 73,        // Rust
} as const;

interface SubmitCodeRequest {
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
  lessonId?: string;
  userId?: string;
}

interface SubmitCodeResponse {
  success: boolean;
  message: string;
  error?: string | null;
  data: {
    success: boolean;
    output: string | null;
    error: string | null;
    executionTime: number;
    memoryUsed: number;
    testCasesPassed: number | null;
    totalTestCases: number | null;
  };
  timestamp?: string;
}

export const codeSubmitApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({      
    submitCode: builder.mutation<SubmitCodeResponse, SubmitCodeRequest>({
      query: (payload) => {
        return {
          url: '/api/code/submit',
          method: 'POST',
          body: payload
        };
      },
      invalidatesTags: (result, error, { lessonId, userId }) => [
        ...(lessonId ? [{ type: 'CodeSubmits' as const, id: `Lesson-${lessonId}` }] : []),
        ...(userId ? [{ type: 'CodeSubmits' as const, id: `User-${userId}` }] : []),
        ...(lessonId && userId ? [{ type: 'CodeSubmits' as const, id: `User-${userId}-Lesson-${lessonId}` }] : []),
      ],
    }),

    runCode : builder.mutation<SubmitCodeResponse, SubmitCodeRequest>({
      query: (payload) => {
        return {
          url: '/api/code/run',
          method: 'POST',
          body: payload
        };
      }
    }),
  }),
  overrideExisting: true,
});


export const {
  useSubmitCodeMutation,
  useRunCodeMutation,
} = codeSubmitApiSlice;
